// ===============================================================
// Enhanced HTTP Client with Exponential Backoff and Connection Pooling
// ===============================================================
// Provides robust HTTP requests with retry logic, circuit breakers, and connection pooling

const http = require('http');
const https = require('https');
const logger = require('./Logger');
const { circuitBreakers } = require('./CircuitBreaker');

class HttpClient {
  constructor(options = {}) {
    this.defaultTimeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.jitterFactor = options.jitterFactor || 0.1;
    this.retryCondition = options.retryCondition || this.defaultRetryCondition;

    // Connection pooling agents
    this.httpAgent = new http.Agent({
      keepAlive: true,
      keepAliveMsecs: 30000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: this.defaultTimeout
    });

    this.httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 30000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: this.defaultTimeout,
      rejectUnauthorized: false // For development with self-signed certs
    });

    logger.info('HTTP Client initialized', null, {
      maxRetries: this.maxRetries,
      baseDelay: this.baseDelay,
      maxDelay: this.maxDelay,
      defaultTimeout: this.defaultTimeout
    });
  }

  defaultRetryCondition(error, response) {
    // Retry on network errors
    if (error) {
      const retryableErrors = [
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'EHOSTUNREACH',
        'ENETUNREACH',
        'EAI_AGAIN'
      ];
      return retryableErrors.some(code => error.code === code || error.message.includes(code));
    }

    // Retry on server errors (5xx) and some client errors
    if (response) {
      return response.statusCode >= 500 ||
             response.statusCode === 408 || // Request Timeout
             response.statusCode === 429 || // Too Many Requests
             response.statusCode === 502 || // Bad Gateway
             response.statusCode === 503 || // Service Unavailable
             response.statusCode === 504;   // Gateway Timeout
    }

    return false;
  }

  calculateDelay(attempt) {
    // Exponential backoff with jitter
    const delay = Math.min(this.baseDelay * Math.pow(2, attempt - 1), this.maxDelay);
    const jitter = delay * this.jitterFactor * Math.random();
    return Math.floor(delay + jitter);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(options, correlationId = null) {
    correlationId = correlationId || logger.createContext();

    const url = this.buildUrl(options);
    const method = (options.method || 'GET').toUpperCase();

    logger.networkRequest(method, url, correlationId, {
      headers: options.headers,
      timeout: options.timeout || this.defaultTimeout
    });

    let lastError = null;
    let lastResponse = null;

    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      const requestStartTime = Date.now();

      try {
        // Apply circuit breaker if available
        const circuitBreaker = this.getCircuitBreaker(url);

        const makeHttpRequest = async () => {
          return await this.executeHttpRequest(options, correlationId);
        };

        let result;
        if (circuitBreaker) {
          result = await circuitBreaker.execute(makeHttpRequest, correlationId);
        } else {
          result = await makeHttpRequest();
        }

        const duration = Date.now() - requestStartTime;

        logger.networkResponse(method, url, result.statusCode, duration, correlationId, {
          attempt,
          responseSize: result.data ? result.data.length : 0
        });

        // Success - return result
        return result;

      } catch (error) {
        lastError = error;
        const duration = Date.now() - requestStartTime;

        // Check if we should retry
        if (attempt <= this.maxRetries && this.retryCondition(error, lastResponse)) {
          const delay = this.calculateDelay(attempt);

          logger.networkError(method, url, error, correlationId, {
            attempt,
            duration,
            willRetry: true,
            retryDelay: delay
          });

          logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt}/${this.maxRetries})`, correlationId, {
            method,
            url,
            error: error.message,
            attempt,
            delay
          });

          await this.sleep(delay);
          continue;
        } else {
          // Final failure
          logger.networkError(method, url, error, correlationId, {
            attempt,
            duration,
            willRetry: false,
            finalFailure: true
          });

          logger.error(`Request failed after ${attempt} attempts`, correlationId, {
            method,
            url,
            error: error.message,
            totalAttempts: attempt
          });

          throw error;
        }
      }
    }

    // This should never be reached, but just in case
    throw lastError || new Error('Request failed for unknown reason');
  }

  async executeHttpRequest(options, correlationId) {
    return new Promise((resolve, reject) => {
      const url = this.buildUrl(options);
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const protocol = isHttps ? https : http;
      const agent = isHttps ? this.httpsAgent : this.httpAgent;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'SearxNG-Collector/3.0 (Enhanced HTTP Client)',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          ...options.headers
        },
        agent,
        timeout: options.timeout || this.defaultTimeout
      };

      // Add correlation ID to headers for tracing
      if (correlationId) {
        requestOptions.headers['X-Correlation-ID'] = correlationId;
      }

      const request = protocol.request(requestOptions, (response) => {
        let data = '';

        response.on('data', chunk => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            let parsedData = data;

            // Try to parse JSON if content type suggests it
            const contentType = response.headers['content-type'] || '';
            if (contentType.includes('application/json') && data.trim()) {
              try {
                parsedData = JSON.parse(data);
              } catch (parseError) {
                // Keep as string if JSON parsing fails
                logger.debug('Failed to parse JSON response, keeping as string', correlationId, {
                  contentType,
                  dataLength: data.length
                });
              }
            }

            resolve({
              statusCode: response.statusCode,
              headers: response.headers,
              data: parsedData,
              rawData: data
            });
          } catch (error) {
            reject(new Error(`Response processing error: ${error.message}`));
          }
        });
      });

      request.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error(`Request timeout after ${requestOptions.timeout}ms`));
      });

      // Send request body if provided
      if (options.data) {
        if (typeof options.data === 'object') {
          request.write(JSON.stringify(options.data));
        } else {
          request.write(options.data);
        }
      }

      request.end();
    });
  }

  buildUrl(options) {
    if (options.url) {
      return options.url;
    }

    const protocol = options.protocol || 'http';
    const hostname = options.hostname || 'localhost';
    const port = options.port ? `:${options.port}` : '';
    const path = options.path || '/';

    return `${protocol}://${hostname}${port}${path}`;
  }

  getCircuitBreaker(url) {
    // Map URLs to circuit breakers
    try {
      const urlObj = new URL(url);

      if (urlObj.hostname.includes('searx') || urlObj.port === '8888') {
        return circuitBreakers.searxng;
      }

      // Add more circuit breaker mappings as needed
      return null;
    } catch (error) {
      return null;
    }
  }

  // Convenience methods
  async get(url, options = {}, correlationId = null) {
    return this.makeRequest({
      ...options,
      url,
      method: 'GET'
    }, correlationId);
  }

  async post(url, data = null, options = {}, correlationId = null) {
    return this.makeRequest({
      ...options,
      url,
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, correlationId);
  }

  async put(url, data = null, options = {}, correlationId = null) {
    return this.makeRequest({
      ...options,
      url,
      method: 'PUT',
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, correlationId);
  }

  async delete(url, options = {}, correlationId = null) {
    return this.makeRequest({
      ...options,
      url,
      method: 'DELETE'
    }, correlationId);
  }

  // Health check method
  async healthCheck(url, timeout = 5000, correlationId = null) {
    try {
      const response = await this.makeRequest({
        url,
        method: 'GET',
        timeout,
        headers: {
          'Accept': 'application/json, text/html, */*'
        }
      }, correlationId);

      return {
        success: true,
        statusCode: response.statusCode,
        responseTime: response.responseTime || 0,
        healthy: response.statusCode >= 200 && response.statusCode < 400
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        healthy: false
      };
    }
  }

  // Get connection pool stats
  getConnectionStats() {
    return {
      http: {
        totalSocketCount: this.httpAgent.totalSocketCount || 0,
        freeSocketCount: this.httpAgent.freeSocketCount || 0,
        sockets: Object.keys(this.httpAgent.sockets || {}).length,
        freeSockets: Object.keys(this.httpAgent.freeSockets || {}).length
      },
      https: {
        totalSocketCount: this.httpsAgent.totalSocketCount || 0,
        freeSocketCount: this.httpsAgent.freeSocketCount || 0,
        sockets: Object.keys(this.httpsAgent.sockets || {}).length,
        freeSockets: Object.keys(this.httpsAgent.freeSockets || {}).length
      }
    };
  }

  // Cleanup connections
  destroy() {
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
    logger.info('HTTP Client connections destroyed');
  }
}

// Create singleton instance
const httpClient = new HttpClient();

// Export both class and instance
module.exports = {
  HttpClient,
  httpClient
};