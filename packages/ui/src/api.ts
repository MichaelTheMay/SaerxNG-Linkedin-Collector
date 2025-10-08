// API client for SearxNG backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface SearchParams {
  keywords: string[];
  searxUrl: string;
  useCache: boolean;
  openResults: boolean;
  verbose: boolean;
  parallel: boolean;
  throttleLimit: number;
  delay: number;
  maxRetries: number;
}

export interface SearchResult {
  title: string;
  url: string;
  keyword: string;
  engine: string;
}

export interface SearchResponse {
  success: boolean;
  results?: SearchResult[];
  output?: string;
  error?: string;
}

export const api = {
  async testConnection(searxUrl: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/test-connection`, { searxUrl });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
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