// ===============================================================
// Process Monitoring and Auto-Restart Service
// ===============================================================
// Monitors critical processes and automatically restarts them when needed
// Handles dependency management and resource monitoring

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/Logger');
const healthMonitor = require('./HealthMonitor');

class ProcessMonitor {
  constructor(options = {}) {
    this.checkInterval = options.checkInterval || 15000; // 15 seconds
    this.maxRestartAttempts = options.maxRestartAttempts || 3;
    this.restartCooldown = options.restartCooldown || 60000; // 1 minute
    this.resourceCheckInterval = options.resourceCheckInterval || 300000; // 5 minutes

    this.processes = new Map();
    this.isRunning = false;
    this.intervalId = null;
    this.resourceIntervalId = null;
    this.restartHistory = [];

    // Process definitions
    this.initializeProcessDefinitions();

    logger.info('Process Monitor initialized', null, {
      checkInterval: this.checkInterval,
      maxRestartAttempts: this.maxRestartAttempts,
      restartCooldown: this.restartCooldown
    });
  }

  initializeProcessDefinitions() {
    // These are external processes we can monitor and restart
    this.addProcess('searxng', {
      name: 'SearxNG Docker Container',
      checkCommand: 'docker ps --filter "name=searxng" --format "{{.Names}}"',
      startCommand: 'docker start searxng',
      stopCommand: 'docker stop searxng',
      healthCheck: () => this.checkDockerContainer('searxng'),
      critical: true,
      autoRestart: true,
      dependencies: []
    });

    // Note: API server and React UI are managed externally via launcher scripts
    // We'll monitor their health via HTTP checks rather than process management
  }

  addProcess(id, config) {
    const process = {
      id,
      ...config,
      status: 'unknown',
      pid: null,
      lastCheck: null,
      lastRestart: null,
      restartCount: 0,
      consecutiveFailures: 0,
      isRestarting: false,
      startTime: null,
      resourceUsage: {
        cpu: 0,
        memory: 0
      }
    };

    this.processes.set(id, process);
    logger.info(`Process Monitor - Process registered: ${config.name}`, null, { processId: id });
  }

  start() {
    if (this.isRunning) {
      logger.warn('Process Monitor already running');
      return;
    }

    this.isRunning = true;
    logger.info('Process Monitor starting');

    // Perform initial process check
    this.performProcessCheck();

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.performProcessCheck();
    }, this.checkInterval);

    // Schedule resource monitoring
    this.resourceIntervalId = setInterval(() => {
      this.performResourceCheck();
    }, this.resourceCheckInterval);

    // Listen to health monitor events
    healthMonitor.onHealthChange(this.handleHealthChange.bind(this));

    logger.success('Process Monitor started');
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.resourceIntervalId) {
      clearInterval(this.resourceIntervalId);
      this.resourceIntervalId = null;
    }

    logger.info('Process Monitor stopped');
  }

  async performProcessCheck() {
    const correlationId = logger.createContext();
    logger.debug('Starting process check cycle', correlationId);

    const promises = Array.from(this.processes.values()).map(process =>
      this.checkProcess(process, correlationId)
    );

    await Promise.allSettled(promises);

    logger.debug('Process check cycle completed', correlationId);
  }

  async checkProcess(process, correlationId) {
    if (process.isRestarting) {
      logger.debug(`Process ${process.name} is currently restarting, skipping check`, correlationId);
      return;
    }

    try {
      process.lastCheck = new Date();

      const isRunning = await this.isProcessRunning(process);

      if (isRunning) {
        process.status = 'running';
        process.consecutiveFailures = 0;

        logger.debug(`Process ${process.name} is running`, correlationId);
      } else {
        process.status = 'stopped';
        process.consecutiveFailures++;

        logger.warn(`Process ${process.name} is not running (failure ${process.consecutiveFailures})`, correlationId);

        // Auto-restart if enabled and conditions are met
        if (process.autoRestart && this.shouldRestart(process)) {
          await this.restartProcess(process, correlationId);
        }
      }
    } catch (error) {
      process.status = 'error';
      process.consecutiveFailures++;

      logger.error(`Error checking process ${process.name}`, correlationId, {
        error: error.message,
        consecutiveFailures: process.consecutiveFailures
      });

      if (process.autoRestart && this.shouldRestart(process)) {
        await this.restartProcess(process, correlationId);
      }
    }
  }

  async isProcessRunning(process) {
    if (process.healthCheck) {
      // Use custom health check
      return await process.healthCheck();
    }

    if (process.checkCommand) {
      // Use command-based check
      return new Promise((resolve) => {
        exec(process.checkCommand, (error, stdout, stderr) => {
          if (error) {
            resolve(false);
          } else {
            const output = stdout.trim();
            resolve(output.length > 0);
          }
        });
      });
    }

    // No check method available
    return false;
  }

  shouldRestart(process) {
    // Check restart attempt limits
    if (process.restartCount >= this.maxRestartAttempts) {
      logger.warn(`Process ${process.name} has exceeded max restart attempts (${this.maxRestartAttempts})`);
      return false;
    }

    // Check cooldown period
    if (process.lastRestart) {
      const timeSinceRestart = Date.now() - process.lastRestart.getTime();
      if (timeSinceRestart < this.restartCooldown) {
        logger.debug(`Process ${process.name} is in restart cooldown`);
        return false;
      }
    }

    // Check if critical process
    if (!process.critical) {
      logger.debug(`Process ${process.name} is not critical, skipping auto-restart`);
      return false;
    }

    return true;
  }

  async restartProcess(process, correlationId) {
    if (process.isRestarting) {
      logger.warn(`Process ${process.name} is already being restarted`, correlationId);
      return;
    }

    process.isRestarting = true;
    process.lastRestart = new Date();
    process.restartCount++;

    logger.warn(`Attempting to restart process ${process.name} (attempt ${process.restartCount})`, correlationId);

    try {
      // Check dependencies first
      const dependenciesReady = await this.checkDependencies(process, correlationId);
      if (!dependenciesReady) {
        throw new Error('Dependencies not ready for restart');
      }

      // Stop process if it has a stop command
      if (process.stopCommand) {
        logger.debug(`Stopping process ${process.name}`, correlationId);
        await this.executeCommand(process.stopCommand, 'stop');

        // Wait a moment for graceful shutdown
        await this.sleep(2000);
      }

      // Start process
      if (process.startCommand) {
        logger.debug(`Starting process ${process.name}`, correlationId);
        await this.executeCommand(process.startCommand, 'start');

        // Wait for startup
        await this.sleep(5000);

        // Verify it started successfully
        const isRunning = await this.isProcessRunning(process);
        if (isRunning) {
          process.status = 'running';
          process.consecutiveFailures = 0;
          process.startTime = new Date();

          logger.success(`Process ${process.name} restarted successfully`, correlationId);

          // Record restart in history
          this.restartHistory.push({
            processId: process.id,
            processName: process.name,
            timestamp: new Date(),
            attempt: process.restartCount,
            success: true,
            reason: 'automatic_restart'
          });
        } else {
          throw new Error('Process failed to start after restart command');
        }
      } else {
        throw new Error('No start command defined for process');
      }
    } catch (error) {
      logger.error(`Failed to restart process ${process.name}`, correlationId, {
        error: error.message,
        attempt: process.restartCount
      });

      // Record failed restart
      this.restartHistory.push({
        processId: process.id,
        processName: process.name,
        timestamp: new Date(),
        attempt: process.restartCount,
        success: false,
        reason: 'automatic_restart',
        error: error.message
      });

      process.status = 'failed';
    } finally {
      process.isRestarting = false;
    }
  }

  async checkDependencies(process, correlationId) {
    if (!process.dependencies || process.dependencies.length === 0) {
      return true;
    }

    logger.debug(`Checking dependencies for ${process.name}`, correlationId, {
      dependencies: process.dependencies
    });

    for (const depId of process.dependencies) {
      const dependency = this.processes.get(depId);
      if (!dependency) {
        logger.warn(`Dependency ${depId} not found for ${process.name}`, correlationId);
        continue;
      }

      const isDepRunning = await this.isProcessRunning(dependency);
      if (!isDepRunning) {
        logger.warn(`Dependency ${dependency.name} is not running for ${process.name}`, correlationId);
        return false;
      }
    }

    return true;
  }

  async executeCommand(command, operation) {
    return new Promise((resolve, reject) => {
      exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`${operation} command failed: ${error.message}`));
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  async checkDockerContainer(containerName) {
    try {
      const result = await this.executeCommand(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`, 'check');
      return result.includes(containerName);
    } catch (error) {
      return false;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleHealthChange(serviceId, previousStatus, currentStatus, serviceData) {
    // React to health changes by potentially restarting related processes
    if (currentStatus === 'unhealthy' && previousStatus === 'healthy') {
      logger.warn(`Service ${serviceId} became unhealthy, checking if process restart is needed`);

      // Map services to processes
      const processMap = {
        'searxng': 'searxng'
      };

      const processId = processMap[serviceId];
      if (processId) {
        const process = this.processes.get(processId);
        if (process && process.autoRestart) {
          logger.info(`Scheduling restart for process ${process.name} due to health issue`);

          // Schedule restart after a brief delay
          setTimeout(() => {
            const correlationId = logger.createContext();
            this.restartProcess(process, correlationId);
          }, 5000);
        }
      }
    }
  }

  async performResourceCheck() {
    const correlationId = logger.createContext();
    logger.debug('Starting resource check cycle', correlationId);

    for (const process of this.processes.values()) {
      if (process.status === 'running') {
        try {
          const resources = await this.getProcessResources(process);
          process.resourceUsage = resources;

          // Check for resource thresholds
          if (resources.memory > 1000 || resources.cpu > 80) { // 1GB RAM or 80% CPU
            logger.warn(`Process ${process.name} high resource usage`, correlationId, {
              cpu: resources.cpu,
              memory: resources.memory
            });
          }
        } catch (error) {
          logger.debug(`Could not get resource info for ${process.name}`, correlationId);
        }
      }
    }
  }

  async getProcessResources(process) {
    // This is a simplified example - in practice you'd use proper process monitoring
    return {
      cpu: Math.random() * 20, // Mock CPU usage
      memory: Math.random() * 500 // Mock memory usage in MB
    };
  }

  // Manual process management methods
  async startProcess(processId, correlationId = null) {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Process not found: ${processId}`);
    }

    correlationId = correlationId || logger.createContext();

    if (process.status === 'running') {
      logger.warn(`Process ${process.name} is already running`, correlationId);
      return;
    }

    await this.restartProcess(process, correlationId);
  }

  async stopProcess(processId, correlationId = null) {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Process not found: ${processId}`);
    }

    correlationId = correlationId || logger.createContext();

    if (process.stopCommand) {
      try {
        await this.executeCommand(process.stopCommand, 'stop');
        process.status = 'stopped';
        logger.info(`Process ${process.name} stopped manually`, correlationId);
      } catch (error) {
        logger.error(`Failed to stop process ${process.name}`, correlationId, {
          error: error.message
        });
        throw error;
      }
    } else {
      throw new Error(`No stop command defined for process ${process.name}`);
    }
  }

  getProcessStatus(processId) {
    return this.processes.get(processId) || null;
  }

  getAllProcesses() {
    return Array.from(this.processes.values());
  }

  getRestartHistory(limit = 50) {
    return this.restartHistory.slice(-limit);
  }

  resetRestartCount(processId) {
    const process = this.processes.get(processId);
    if (process) {
      process.restartCount = 0;
      logger.info(`Reset restart count for process ${process.name}`);
    }
  }
}

// Singleton instance
const processMonitor = new ProcessMonitor();

module.exports = processMonitor;