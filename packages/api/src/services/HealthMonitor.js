// ===============================================================
// Health Monitoring Service
// ===============================================================
// Continuously monitors health of all system components
// Provides centralized health status and alerts

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const logger = require('../utils/Logger');
const { circuitBreakers } = require('../utils/CircuitBreaker');

class HealthMonitor {
  constructor(options = {}) {
    this.checkInterval = options.checkInterval || 30000; // 30 seconds
    this.services = new Map();
    this.isRunning = false;
    this.intervalId = null;
    this.healthHistory = [];
    this.maxHistoryEntries = 100;

    // Initialize service definitions
    this.initializeServices();

    // Health status callbacks
    this.healthCallbacks = [];

    logger.info('Health Monitor initialized', null, {
      checkInterval: this.checkInterval,
      servicesCount: this.services.size
    });
  }

  initializeServices() {
    // SearxNG Service
    this.addService('searxng', {
      name: 'SearxNG',
      checkFunction: this.checkSearxNG.bind(this),
      criticalService: true,
      timeout: 5000,
      expectedUptime: 99.0
    });

    // PowerShell Availability
    this.addService('powershell', {
      name: 'PowerShell',
      checkFunction: this.checkPowerShell.bind(this),
      criticalService: true,
      timeout: 3000,
      expectedUptime: 99.9
    });

    // File System (Data Directory)
    this.addService('filesystem', {
      name: 'File System',
      checkFunction: this.checkFileSystem.bind(this),
      criticalService: true,
      timeout: 1000,
      expectedUptime: 99.9
    });

    // React UI (if configured)
    this.addService('react-ui', {
      name: 'React UI',
      checkFunction: this.checkReactUI.bind(this),
      criticalService: false,
      timeout: 3000,
      expectedUptime: 95.0
    });
  }

  addService(id, config) {
    const service = {
      id,
      ...config,
      status: 'unknown',
      lastCheck: null,
      lastSuccess: null,
      lastFailure: null,
      successCount: 0,
      failureCount: 0,
      totalChecks: 0,
      averageResponseTime: 0,
      uptime: 100,
      issues: [],
      metadata: {}
    };

    this.services.set(id, service);
    logger.info(`Health Monitor - Service registered: ${config.name}`, null, { serviceId: id });
  }

  onHealthChange(callback) {
    this.healthCallbacks.push(callback);
  }

  notifyHealthChange(serviceId, previousStatus, currentStatus) {
    this.healthCallbacks.forEach(callback => {
      try {
        callback(serviceId, previousStatus, currentStatus, this.getServiceStatus(serviceId));
      } catch (error) {
        logger.error('Health callback error', null, { error: error.message });
      }
    });
  }

  start() {
    if (this.isRunning) {
      logger.warn('Health Monitor already running');
      return;
    }

    this.isRunning = true;
    logger.info('Health Monitor starting');

    // Perform initial health check
    this.performHealthCheck();

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);

    logger.success('Health Monitor started');
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

    logger.info('Health Monitor stopped');
  }

  async performHealthCheck() {
    const correlationId = logger.createContext();
    logger.health('Starting health check cycle', correlationId);

    const promises = Array.from(this.services.values()).map(service =>
      this.checkService(service, correlationId)
    );

    await Promise.allSettled(promises);

    // Update overall health
    this.updateOverallHealth(correlationId);

    // Clean up old history
    this.cleanupHistory();

    logger.health('Health check cycle completed', correlationId);
  }

  async checkService(service, correlationId) {
    const startTime = Date.now();
    const previousStatus = service.status;

    try {
      service.totalChecks++;
      service.lastCheck = new Date();

      logger.debug(`Checking service: ${service.name}`, correlationId);

      // Execute health check with timeout
      const result = await Promise.race([
        service.checkFunction(correlationId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), service.timeout)
        )
      ]);

      // Success
      const responseTime = Date.now() - startTime;
      service.status = 'healthy';
      service.lastSuccess = new Date();
      service.successCount++;
      service.metadata = result.metadata || {};
      service.issues = result.issues || [];

      this.updateAverageResponseTime(service, responseTime);
      this.updateUptime(service, true);

      logger.health(`Service ${service.name} is healthy`, correlationId, {
        responseTime,
        metadata: service.metadata
      });

    } catch (error) {
      // Failure
      const responseTime = Date.now() - startTime;
      service.status = 'unhealthy';
      service.lastFailure = new Date();
      service.failureCount++;
      service.issues = [error.message];

      this.updateAverageResponseTime(service, responseTime);
      this.updateUptime(service, false);

      logger.error(`Service ${service.name} is unhealthy`, correlationId, {
        error: error.message,
        responseTime,
        failureCount: service.failureCount
      });
    }

    // Notify if status changed
    if (previousStatus !== service.status) {
      this.notifyHealthChange(service.id, previousStatus, service.status);
    }
  }

  async checkSearxNG(correlationId) {
    const searxUrl = process.env.SEARX_URL || 'http://localhost:8888';

    return new Promise((resolve, reject) => {
      const testUrl = `${searxUrl}/search?q=health-check&format=json`;
      const urlObj = new URL(testUrl);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const options = {
        method: 'GET',
        headers: {
          'User-Agent': 'HealthMonitor/1.0',
          'Accept': 'application/json'
        },
        timeout: 5000
      };

      const request = protocol.get(testUrl, options, (response) => {
        let data = '';

        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          if (response.statusCode === 200 || response.statusCode === 302) {
            try {
              const json = JSON.parse(data);
              resolve({
                metadata: {
                  statusCode: response.statusCode,
                  hasResults: !!(json.results && json.results.length > 0),
                  engines: json.unresponsive_engines || []
                }
              });
            } catch (parseError) {
              // SearxNG might return HTML, which is also OK
              resolve({
                metadata: {
                  statusCode: response.statusCode,
                  contentType: response.headers['content-type']
                }
              });
            }
          } else {
            reject(new Error(`SearxNG returned status ${response.statusCode}`));
          }
        });
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('SearxNG health check timeout'));
      });
    });
  }

  async checkPowerShell(correlationId) {
    return new Promise((resolve, reject) => {
      const ps = spawn('powershell.exe', ['-Command', 'Get-Host | Select-Object Version | ConvertTo-Json'], {
        windowsHide: true
      });

      let output = '';
      let errorOutput = '';

      ps.stdout.on('data', data => output += data.toString());
      ps.stderr.on('data', data => errorOutput += data.toString());

      ps.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output.trim());
            resolve({
              metadata: {
                version: result.Version,
                available: true
              }
            });
          } catch (error) {
            resolve({
              metadata: {
                available: true,
                rawOutput: output.trim()
              }
            });
          }
        } else {
          reject(new Error(`PowerShell check failed: ${errorOutput}`));
        }
      });

      ps.on('error', reject);

      // Timeout
      setTimeout(() => {
        ps.kill();
        reject(new Error('PowerShell health check timeout'));
      }, 3000);
    });
  }

  async checkFileSystem(correlationId) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const dataDir = path.join(__dirname, '../../../../data');
      const requiredDirs = ['results', 'reports', 'logs', 'cache'];

      // Check if data directory exists and is writable
      await fs.access(dataDir, fs.constants.F_OK | fs.constants.W_OK);

      // Check required subdirectories
      const dirChecks = await Promise.allSettled(
        requiredDirs.map(async dir => {
          const dirPath = path.join(dataDir, dir);
          await fs.access(dirPath, fs.constants.F_OK | fs.constants.W_OK);
          return dir;
        })
      );

      const availableDirs = dirChecks
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      const missingDirs = requiredDirs.filter(dir => !availableDirs.includes(dir));

      return {
        metadata: {
          dataDirectory: dataDir,
          availableDirectories: availableDirs,
          missingDirectories: missingDirs,
          allDirectoriesPresent: missingDirs.length === 0
        },
        issues: missingDirs.length > 0 ? [`Missing directories: ${missingDirs.join(', ')}`] : []
      };
    } catch (error) {
      throw new Error(`File system check failed: ${error.message}`);
    }
  }

  async checkReactUI(correlationId) {
    const uiUrl = process.env.UI_URL || 'http://localhost:5173';

    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        timeout: 3000
      };

      const protocol = uiUrl.startsWith('https:') ? https : http;

      const request = protocol.get(uiUrl, options, (response) => {
        if (response.statusCode === 200) {
          resolve({
            metadata: {
              statusCode: response.statusCode,
              contentType: response.headers['content-type']
            }
          });
        } else {
          reject(new Error(`React UI returned status ${response.statusCode}`));
        }
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('React UI health check timeout'));
      });
    });
  }

  updateAverageResponseTime(service, responseTime) {
    if (service.averageResponseTime === 0) {
      service.averageResponseTime = responseTime;
    } else {
      // Weighted average favoring recent measurements
      service.averageResponseTime = (service.averageResponseTime * 0.7) + (responseTime * 0.3);
    }
  }

  updateUptime(service, success) {
    const weight = 0.99; // Heavily weight recent history
    if (success) {
      service.uptime = (service.uptime * weight) + (100 * (1 - weight));
    } else {
      service.uptime = service.uptime * weight;
    }
  }

  updateOverallHealth(correlationId) {
    const services = Array.from(this.services.values());
    const criticalServices = services.filter(s => s.criticalService);
    const nonCriticalServices = services.filter(s => !s.criticalService);

    // Check critical services
    const criticalHealthy = criticalServices.every(s => s.status === 'healthy');
    const criticalIssues = criticalServices.filter(s => s.status !== 'healthy');

    // Overall system status
    let overallStatus = 'healthy';
    let overallMessage = 'All systems operational';

    if (criticalIssues.length > 0) {
      overallStatus = 'critical';
      overallMessage = `Critical services down: ${criticalIssues.map(s => s.name).join(', ')}`;
    } else {
      const nonCriticalIssues = nonCriticalServices.filter(s => s.status !== 'healthy');
      if (nonCriticalIssues.length > 0) {
        overallStatus = 'degraded';
        overallMessage = `Non-critical services degraded: ${nonCriticalIssues.map(s => s.name).join(', ')}`;
      }
    }

    // Add to history
    const healthSnapshot = {
      timestamp: new Date(),
      overallStatus,
      overallMessage,
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        status: s.status,
        uptime: s.uptime,
        averageResponseTime: s.averageResponseTime,
        issues: s.issues
      })),
      circuitBreakers: Object.keys(circuitBreakers).map(key => circuitBreakers[key].getStatus())
    };

    this.healthHistory.push(healthSnapshot);

    logger.health(`Overall system status: ${overallStatus}`, correlationId, {
      overallStatus,
      overallMessage,
      criticalServicesHealthy: criticalHealthy,
      totalServices: services.length,
      healthyServices: services.filter(s => s.status === 'healthy').length
    });
  }

  cleanupHistory() {
    if (this.healthHistory.length > this.maxHistoryEntries) {
      this.healthHistory = this.healthHistory.slice(-this.maxHistoryEntries);
    }
  }

  getOverallHealth() {
    if (this.healthHistory.length === 0) {
      return {
        status: 'unknown',
        message: 'No health checks performed yet',
        timestamp: new Date()
      };
    }

    return this.healthHistory[this.healthHistory.length - 1];
  }

  getServiceStatus(serviceId) {
    return this.services.get(serviceId) || null;
  }

  getAllServices() {
    return Array.from(this.services.values());
  }

  getHealthHistory(limit = 50) {
    return this.healthHistory.slice(-limit);
  }

  getCircuitBreakerStatus() {
    return Object.keys(circuitBreakers).map(key => circuitBreakers[key].getStatus());
  }

  // Force a specific service check
  async forceCheck(serviceId, correlationId = null) {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    correlationId = correlationId || logger.createContext();
    await this.checkService(service, correlationId);
    return this.getServiceStatus(serviceId);
  }
}

// Singleton instance
const healthMonitor = new HealthMonitor();

module.exports = healthMonitor;