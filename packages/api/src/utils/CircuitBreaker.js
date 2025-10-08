// ===============================================================
// Circuit Breaker Pattern Implementation
// ===============================================================
// Prevents cascading failures by temporarily stopping requests to failing services
// States: CLOSED (normal), OPEN (failing), HALF_OPEN (testing recovery)

const logger = require('./Logger');

class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'unnamed';
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    this.expectedErrors = options.expectedErrors || [];

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    this.monitoringInterval = null; // Store interval reference for cleanup

    // Statistics
    this.stats = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      totalTimeouts: 0,
      totalCircuitOpenEvents: 0,
      averageResponseTime: 0,
      lastResponse: null
    };

    // Start monitoring
    this.startMonitoring();

    logger.info(`Circuit Breaker [${this.name}] initialized`, null, {
      failureThreshold: this.failureThreshold,
      timeout: this.timeout,
      monitoringPeriod: this.monitoringPeriod
    });
  }

  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.logStatus();
      this.tryRecovery();
    }, this.monitoringPeriod);
  }

  logStatus() {
    logger.health(`Circuit Breaker [${this.name}] Status: ${this.state}`, null, {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      stats: this.stats
    });
  }

  async execute(operation, correlationId = null) {
    this.stats.totalRequests++;
    const startTime = Date.now();

    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const error = new Error(`Circuit breaker [${this.name}] is OPEN. Next attempt at ${new Date(this.nextAttempt).toISOString()}`);
        error.circuitBreakerOpen = true;
        this.stats.totalTimeouts++;

        logger.circuitBreakerEvent(this.name, 'REQUEST_BLOCKED', {
          nextAttempt: this.nextAttempt,
          timeUntilNextAttempt: this.nextAttempt - Date.now()
        }, correlationId);

        throw error;
      } else {
        // Try to transition to HALF_OPEN
        this.state = 'HALF_OPEN';
        logger.circuitBreakerEvent(this.name, 'HALF_OPEN', 'Attempting recovery', correlationId);
      }
    }

    try {
      // Execute the operation
      const result = await operation();
      this.onSuccess(Date.now() - startTime, correlationId);
      return result;
    } catch (error) {
      this.onFailure(error, Date.now() - startTime, correlationId);
      throw error;
    }
  }

  onSuccess(responseTime, correlationId = null) {
    this.successCount++;
    this.stats.totalSuccesses++;
    this.updateAverageResponseTime(responseTime);
    this.stats.lastResponse = new Date().toISOString();

    // Reset failure count on success
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      // Successful request in HALF_OPEN state - close the circuit
      this.state = 'CLOSED';
      logger.circuitBreakerEvent(this.name, 'CLOSED', 'Circuit recovered after successful request', correlationId);
    }

    logger.success(`Circuit Breaker [${this.name}] - Operation successful`, correlationId, {
      responseTime,
      state: this.state,
      successCount: this.successCount
    });
  }

  onFailure(error, responseTime, correlationId = null) {
    this.stats.totalFailures++;
    this.lastFailureTime = Date.now();
    this.updateAverageResponseTime(responseTime);

    // Check if this is an expected error (don't count towards circuit breaker)
    const isExpectedError = this.expectedErrors.some(expectedError => {
      if (typeof expectedError === 'string') {
        return error.message.includes(expectedError);
      }
      if (expectedError instanceof RegExp) {
        return expectedError.test(error.message);
      }
      return false;
    });

    if (isExpectedError) {
      logger.warn(`Circuit Breaker [${this.name}] - Expected error (not counted)`, correlationId, {
        error: error.message,
        responseTime
      });
      return;
    }

    this.failureCount++;

    logger.error(`Circuit Breaker [${this.name}] - Operation failed`, correlationId, {
      error: error.message,
      responseTime,
      failureCount: this.failureCount,
      threshold: this.failureThreshold,
      state: this.state
    });

    // Check if we should open the circuit
    if (this.failureCount >= this.failureThreshold) {
      this.openCircuit(correlationId);
    }
  }

  openCircuit(correlationId = null) {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.timeout;
    this.stats.totalCircuitOpenEvents++;

    logger.circuitBreakerEvent(this.name, 'OPEN', `Circuit opened after ${this.failureCount} failures`, correlationId);
    logger.error(`Circuit Breaker [${this.name}] - CIRCUIT OPENED`, correlationId, {
      failureCount: this.failureCount,
      nextAttempt: this.nextAttempt,
      timeoutDuration: this.timeout
    });
  }

  tryRecovery() {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttempt) {
      this.state = 'HALF_OPEN';
      logger.circuitBreakerEvent(this.name, 'HALF_OPEN_AUTO', 'Auto-transitioning to HALF_OPEN for recovery attempt');
    }
  }

  forceClose() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;

    logger.circuitBreakerEvent(this.name, 'FORCE_CLOSED', 'Circuit manually closed');
  }

  forceOpen() {
    this.openCircuit();
    logger.circuitBreakerEvent(this.name, 'FORCE_OPENED', 'Circuit manually opened');
  }

  destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    logger.info(`Circuit Breaker [${this.name}] destroyed and monitoring stopped`);
  }

  updateAverageResponseTime(responseTime) {
    if (this.stats.averageResponseTime === 0) {
      this.stats.averageResponseTime = responseTime;
    } else {
      // Simple moving average
      this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2;
    }
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
      stats: this.stats,
      isHealthy: this.state === 'CLOSED',
      timeUntilNextAttempt: this.nextAttempt ? Math.max(0, this.nextAttempt - Date.now()) : 0
    };
  }

  // Create a wrapper function for HTTP requests
  static createHttpWrapper(name, httpFunction, options = {}) {
    const circuitBreaker = new CircuitBreaker({
      name,
      ...options
    });

    return async function wrappedHttpRequest(...args) {
      const correlationId = args.find(arg => arg && arg.correlationId)?.correlationId;

      return circuitBreaker.execute(async () => {
        return await httpFunction(...args);
      }, correlationId);
    };
  }
}

// Circuit breaker instances for different services
const circuitBreakers = {
  searxng: new CircuitBreaker({
    name: 'SearxNG',
    failureThreshold: 3,
    timeout: 30000, // 30 seconds
    monitoringPeriod: 10000,
    expectedErrors: ['ECONNREFUSED', 'timeout']
  }),

  powershell: new CircuitBreaker({
    name: 'PowerShell',
    failureThreshold: 5,
    timeout: 60000, // 1 minute
    monitoringPeriod: 15000,
    expectedErrors: ['execution policy', 'script not found']
  })
};

module.exports = {
  CircuitBreaker,
  circuitBreakers
};