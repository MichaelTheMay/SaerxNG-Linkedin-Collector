// API client for SearxNG backend
import axios from 'axios';
import type { SearchParams, SearchResult, SearchResponse } from '../../../shared/types';

const API_BASE_URL = 'http://localhost:3001/api';

export type { SearchParams, SearchResult, SearchResponse };

// Enhanced API client with correlation IDs and better error handling
class EnhancedApiClient {
  private correlationId: string | null = null;

  generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setCorrelationId(id: string | null): void {
    this.correlationId = id;
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const correlationId = this.correlationId || this.generateCorrelationId();

    const headers = new Headers(options.headers);
    headers.set('X-Correlation-ID', correlationId);
    headers.set('Content-Type', 'application/json');

    const startTime = Date.now();

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Log successful requests in development
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
        console.log(`✅ API ${options.method || 'GET'} ${url}`, {
          correlationId,
          responseTime,
          status: response.status
        });
      }

      return data;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      // Log failed requests
      console.error(`❌ API ${options.method || 'GET'} ${url}`, {
        correlationId,
        responseTime,
        error: error.message
      });

      throw error;
    }
  }
}

// Create enhanced API client instance
const enhancedClient = new EnhancedApiClient();

// Health monitoring types
export interface HealthStatus {
  success: boolean;
  timestamp: string;
  correlationId: string;
  overall: {
    status: 'healthy' | 'degraded' | 'critical';
    message: string;
    timestamp: string;
  };
  services: Array<{
    id: string;
    name: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    uptime: number;
    averageResponseTime: number;
    lastCheck: string;
    issues: string[];
    metadata: any;
  }>;
  circuitBreakers: Array<{
    name: string;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    isHealthy: boolean;
    stats: any;
  }>;
  processes: Array<{
    id: string;
    name: string;
    status: string;
    uptime: number;
    restartCount: number;
  }>;
  connectionPool: any;
}

export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  error?: string;
  correlationId: string;
  details?: {
    statusCode: number;
    responseTime: number;
    hasJsonResponse: boolean;
    resultsFound: number;
    unresponsiveEngines: number;
    healthy: boolean;
    circuitBreakerOpen?: boolean;
    retryAfter?: number;
  };
}

export const api = {
  // Enhanced connection test with detailed diagnostics
  async testConnection(searxUrl: string): Promise<ConnectionTestResult> {
    try {
      return await enhancedClient.request<ConnectionTestResult>('/test-connection', {
        method: 'POST',
        body: JSON.stringify({ searxUrl })
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        correlationId: enhancedClient.generateCorrelationId()
      };
    }
  },

  // Health monitoring endpoints
  async getHealth(): Promise<HealthStatus> {
    return await enhancedClient.request<HealthStatus>('/health');
  },

  async getHealthHistory(limit: number = 50): Promise<{ success: boolean; history: any[]; count: number }> {
    return await enhancedClient.request(`/health/history?limit=${limit}`);
  },

  async forceHealthCheck(serviceId?: string): Promise<any> {
    const url = serviceId ? `/health/check/${serviceId}` : '/health/check';
    return await enhancedClient.request(url, { method: 'POST' });
  },

  async getCircuitBreakers(): Promise<{ success: boolean; circuitBreakers: any[] }> {
    return await enhancedClient.request('/circuit-breakers');
  },

  async resetCircuitBreaker(name: string): Promise<{ success: boolean; message: string }> {
    return await enhancedClient.request(`/circuit-breakers/${name}/reset`, { method: 'POST' });
  },

  async getProcesses(): Promise<{ success: boolean; processes: any[]; restartHistory: any[] }> {
    return await enhancedClient.request('/processes');
  },

  async startProcess(processId: string): Promise<{ success: boolean; message: string }> {
    return await enhancedClient.request(`/processes/${processId}/start`, { method: 'POST' });
  },

  async stopProcess(processId: string): Promise<{ success: boolean; message: string }> {
    return await enhancedClient.request(`/processes/${processId}/stop`, { method: 'POST' });
  },

  async runSearch(params: SearchParams): Promise<SearchResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/search`, params, {
        timeout: 300000 // 5 minutes
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  async getReports(): Promise<{ reports: any[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`);
      return response.data;
    } catch (error) {
      return { reports: [] };
    }
  },

  async getReportContent(filename: string): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/${filename}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to load report');
    }
  },

  async getKeywords(): Promise<{ keywords: string[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/keywords`);
      return response.data;
    } catch (error) {
      return { keywords: [] };
    }
  },

  async saveKeywords(keywords: string[]): Promise<{ success: boolean }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/keywords`, { keywords });
      return response.data;
    } catch (error) {
      return { success: false };
    }
  }
};

// Export utility functions (not part of api object)
export const exportToCSV = (results: SearchResult[]): string => {
  const headers = ['Title', 'URL', 'Keyword', 'Engine'];
  const csvData = [
    headers.join(','),
    ...results.map(result => [
      `"${result.title.replace(/"/g, '""')}"`,
      `"${result.url}"`,
      `"${result.keyword}"`,
      `"${result.engine}"`
    ].join(','))
  ];
  return csvData.join('\n');
};

export const exportToJSON = (results: SearchResult[]): string => {
  return JSON.stringify(results, null, 2);
};