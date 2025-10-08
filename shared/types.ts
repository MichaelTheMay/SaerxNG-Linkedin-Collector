// ===============================================================
// Shared TypeScript Types and Interfaces
// ===============================================================
// Shared between API server and React UI for type consistency

export interface SearchParams {
  keywords: string[];
  searxUrl: string;
  workDir?: string;
  useCache: boolean;
  openResults: boolean;
  verbose: boolean;
  parallel: boolean;
  exportFormat: 'CSV' | 'JSON' | 'TXT' | 'HTML' | 'ALL';
  throttleLimit: number;
  delay: number;
  maxRetries: number;
}

export interface SearchResult {
  title: string;
  url: string;
  keyword: string;
  engine: string;
  snippet?: string;
  timestamp?: string;
}

export interface SearchResponse {
  success: boolean;
  results?: SearchResult[];
  output?: string;
  error?: string;
}

export interface Report {
  name: string;
  path: string;
  modified: Date;
  size: number;
}

export interface ReportsResponse {
  reports: Report[];
}

export interface KeywordsResponse {
  keywords: string[];
}

export interface ConnectionTestResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SearchProgress {
  current: number;
  total: number;
  activity: string;
  timestamp?: string;
}

export interface SearchStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  cachedQueries: number;
  totalResults: number;
  uniqueURLs: number;
  duplicatesSkipped: number;
  executionTime?: number;
}

export interface Config {
  searxURL: string;
  workDir: string;
  useCache: boolean;
  parallel: boolean;
  throttleLimit: number;
  delay: number;
  maxRetries: number;
  exportFormat: 'CSV' | 'JSON' | 'TXT' | 'HTML' | 'ALL';
}

