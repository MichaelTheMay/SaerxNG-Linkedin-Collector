// ===============================================================
// Structured Logger with Correlation IDs and Multiple Outputs
// ===============================================================
// Provides consistent logging across all API components
// Features: JSON logs, correlation IDs, multiple levels, file/console output

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../../../data/logs');
    this.ensureLogDirectory();
    this.correlationStore = new Map(); // Store correlation contexts
  }

  async ensureLogDirectory() {
    try {
      await fs.promises.access(this.logDir);
    } catch (error) {
      await fs.promises.mkdir(this.logDir, { recursive: true });
    }
  }

  generateCorrelationId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  createContext(correlationId = null) {
    const id = correlationId || this.generateCorrelationId();
    const context = {
      correlationId: id,
      startTime: new Date(),
      metadata: {}
    };
    this.correlationStore.set(id, context);
    return id;
  }

  getContext(correlationId) {
    return this.correlationStore.get(correlationId) || {};
  }

  updateContext(correlationId, metadata) {
    const context = this.correlationStore.get(correlationId);
    if (context) {
      Object.assign(context.metadata, metadata);
    }
  }

  formatLogEntry(level, message, correlationId = null, metadata = {}) {
    const timestamp = new Date().toISOString();
    const context = correlationId ? this.getContext(correlationId) : {};

    return {
      timestamp,
      level: level.toUpperCase(),
      message,
      correlationId,
      component: 'api-server',
      metadata: {
        ...context.metadata,
        ...metadata
      },
      duration: context.startTime ? Date.now() - context.startTime.getTime() : null
    };
  }

  writeToFile(logEntry) {
    const filename = `api-server-${new Date().toISOString().split('T')[0]}.log`;
    const filepath = path.join(this.logDir, filename);
    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(filepath, logLine, 'utf8');
  }

  writeToConsole(logEntry) {
    const colors = {
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      INFO: '\x1b[36m',    // Cyan
      DEBUG: '\x1b[37m',   // White
      SUCCESS: '\x1b[32m', // Green
      HEALTH: '\x1b[35m',  // Magenta
      PERFORMANCE: '\x1b[34m' // Blue
    };

    const reset = '\x1b[0m';
    const color = colors[logEntry.level] || colors.INFO;

    const correlationInfo = logEntry.correlationId ? ` [${logEntry.correlationId}]` : '';
    const durationInfo = logEntry.duration ? ` (${logEntry.duration}ms)` : '';

    console.log(
      `${color}[${logEntry.timestamp}] [${logEntry.level}]${correlationInfo}${reset} ${logEntry.message}${durationInfo}`
    );

    if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
      console.log(`${color}  Metadata:${reset}`, JSON.stringify(logEntry.metadata, null, 2));
    }
  }

  log(level, message, correlationId = null, metadata = {}) {
    const logEntry = this.formatLogEntry(level, message, correlationId, metadata);

    this.writeToFile(logEntry);
    this.writeToConsole(logEntry);

    return logEntry;
  }

  // Convenience methods
  error(message, correlationId = null, metadata = {}) {
    return this.log('ERROR', message, correlationId, metadata);
  }

  warn(message, correlationId = null, metadata = {}) {
    return this.log('WARN', message, correlationId, metadata);
  }

  info(message, correlationId = null, metadata = {}) {
    return this.log('INFO', message, correlationId, metadata);
  }

  debug(message, correlationId = null, metadata = {}) {
    return this.log('DEBUG', message, correlationId, metadata);
  }

  success(message, correlationId = null, metadata = {}) {
    return this.log('SUCCESS', message, correlationId, metadata);
  }

  health(message, correlationId = null, metadata = {}) {
    return this.log('HEALTH', message, correlationId, metadata);
  }

  performance(message, correlationId = null, metadata = {}) {
    return this.log('PERFORMANCE', message, correlationId, metadata);
  }

  // Network-specific logging methods
  networkRequest(method, url, correlationId, metadata = {}) {
    return this.log('INFO', `${method} ${url}`, correlationId, {
      type: 'network_request',
      method,
      url,
      ...metadata
    });
  }

  networkResponse(method, url, statusCode, duration, correlationId, metadata = {}) {
    const level = statusCode >= 400 ? 'ERROR' : statusCode >= 300 ? 'WARN' : 'INFO';
    return this.log(level, `${method} ${url} - ${statusCode}`, correlationId, {
      type: 'network_response',
      method,
      url,
      statusCode,
      duration,
      ...metadata
    });
  }

  networkError(method, url, error, correlationId, metadata = {}) {
    return this.log('ERROR', `${method} ${url} - ${error.message}`, correlationId, {
      type: 'network_error',
      method,
      url,
      error: error.message,
      stack: error.stack,
      ...metadata
    });
  }

  connectionHealth(service, status, details, correlationId = null) {
    return this.log('HEALTH', `${service} - ${status}`, correlationId, {
      type: 'connection_health',
      service,
      status,
      details
    });
  }

  circuitBreakerEvent(service, event, details, correlationId = null) {
    return this.log('WARN', `Circuit Breaker [${service}] - ${event}`, correlationId, {
      type: 'circuit_breaker',
      service,
      event,
      details
    });
  }

  // Cleanup old logs (call periodically)
  cleanup(daysToKeep = 7) {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));

      files.forEach(file => {
        const filepath = path.join(this.logDir, file);
        const stats = fs.statSync(filepath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filepath);
          this.info(`Cleaned up old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to cleanup logs', null, { error: error.message });
    }
  }
}

// Singleton instance
const logger = new Logger();

module.exports = logger;