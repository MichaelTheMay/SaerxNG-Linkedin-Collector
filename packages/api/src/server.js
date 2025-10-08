// Load environment variables
require('dotenv').config();

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Enhanced networking and monitoring
const logger = require('./utils/Logger');
const { httpClient } = require('./utils/HttpClient');
const { circuitBreakers } = require('./utils/CircuitBreaker');
const healthMonitor = require('./services/HealthMonitor');
const processMonitor = require('./services/ProcessMonitor');

const app = express();
const PORT = process.env.PORT || 3001;

// SearxNG configuration with fallbacks
const SEARX_URLS = [
  process.env.SEARX_URL || 'http://localhost:8888',
  process.env.SEARX_ALT_URL_1 || 'http://127.0.0.1:8888',
  process.env.SEARX_ALT_URL_2 || 'http://172.17.0.2:8080'
].filter(Boolean);

// Enhanced middleware with correlation IDs and monitoring
app.use(cors());
app.use(express.json());

// Correlation ID middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || logger.createContext();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  // Log request
  logger.info(`${req.method} ${req.path}`, correlationId, {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.headers['user-agent'],
    remoteAddress: req.ip || req.connection.remoteAddress
  });

  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error in API server', req.correlationId, {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    correlationId: req.correlationId
  });
});

// Paths to PowerShell scripts and data directories
const rootDir = path.resolve(__dirname, '../../..');
const scriptDir = path.join(rootDir, 'packages/scripts');
const searchScript = path.join(scriptDir, 'ScriptQueries.ps1');
const parallelScript = path.join(scriptDir, 'ScriptQueriesParallel.ps1');

// Data directories
const dataDir = path.join(rootDir, 'data');
const resultsDir = path.join(dataDir, 'results');
const reportsDir = path.join(dataDir, 'reports');
const logsDir = path.join(dataDir, 'logs');
const cacheDir = path.join(dataDir, 'cache');

// Helper function to run PowerShell scripts
function runPowerShellScript(scriptPath, args, callback) {
  const powershell = spawn('powershell.exe', [
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    ...args
  ]);

  let output = '';
  let errorOutput = '';

  powershell.stdout.on('data', (data) => {
    output += data.toString();
  });

  powershell.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  powershell.on('close', (code) => {
    if (code === 0) {
      callback(null, output);
    } else {
      callback(new Error(`PowerShell script failed: ${errorOutput}`), output);
    }
  });

  powershell.on('error', (error) => {
    callback(error, output);
  });
}

// API Routes

// Test SearxNG connection with enhanced reliability
app.post('/api/test-connection', async (req, res) => {
  const { searxUrl } = req.body;
  const correlationId = req.correlationId;

  // If no URL provided in request, try all configured URLs
  const urlsToTest = searxUrl ? [searxUrl] : SEARX_URLS;

  logger.info(`Testing connection to SearxNG with ${urlsToTest.length} URL(s)`, correlationId);

  let lastError = null;
  let successfulUrl = null;

  // Try each URL until one succeeds
  for (const url of urlsToTest) {
    logger.info(`Attempting connection to: ${url}`, correlationId);

    try {
      const testUrl = `${url}/search?q=health-check&format=json`;

      // Use enhanced HTTP client with circuit breaker and retry logic
      const startTime = Date.now();
      const response = await httpClient.get(testUrl, {
        timeout: parseInt(process.env.CONNECTION_TIMEOUT) || 8000,
        headers: {
          'Accept': 'application/json, text/html, */*'
        }
      }, correlationId);

      const responseTime = Date.now() - startTime;

      // If we get here, the connection succeeded
      successfulUrl = url;

      // Analyze response for detailed health information
      const healthInfo = {
        statusCode: response.statusCode,
        responseTime,
        hasJsonResponse: typeof response.data === 'object',
        contentLength: response.rawData?.length || 0,
        contentType: response.headers['content-type'] || 'unknown',
        connectedUrl: url
      };

      // Check if response indicates healthy SearxNG
      if (response.statusCode >= 200 && response.statusCode < 400) {
        let resultsCount = 0;
        let engines = [];

        // Try to extract additional health info from JSON response
        if (typeof response.data === 'object' && response.data.results) {
          resultsCount = response.data.results.length;
          engines = response.data.unresponsive_engines || [];
        }

        logger.success(`SearxNG connection successful`, correlationId, {
          url: url,
          responseTime,
          statusCode: response.statusCode,
          resultsCount,
          unresponsiveEngines: engines.length,
          healthInfo
        });

        return res.json({
          success: true,
          message: `Connection successful to ${url}`,
          correlationId,
          details: {
            ...healthInfo,
            resultsFound: resultsCount,
            unresponsiveEngines: engines.length,
            healthy: engines.length < 5 // Consider healthy if less than 5 engines are down
          }
        });
      }

      lastError = `SearxNG returned status code ${response.statusCode}`;

    } catch (error) {
      lastError = error.message;
      logger.warn(`Connection failed to ${url}: ${error.message}`, correlationId);
      // Continue to next URL
    }
  }

  // If we get here, all URLs failed
  logger.error('All SearxNG connection attempts failed', correlationId, {
    testedUrls: urlsToTest,
    lastError: lastError
  });

  let statusCode = 503; // Service Unavailable
  let errorMessage = lastError || 'Failed to connect to SearxNG';

  // Provide specific error messages based on error type
  if (lastError && lastError.includes('timeout')) {
    statusCode = 504; // Gateway Timeout
    errorMessage = 'Connection to SearxNG timed out. Please check if SearxNG is running.';
  } else if (lastError && lastError.includes('ECONNREFUSED')) {
    statusCode = 502; // Bad Gateway
    errorMessage = 'Cannot connect to SearxNG. Please verify the URL and ensure SearxNG Docker container is running.';
  } else if (lastError && lastError.includes('ENOTFOUND')) {
    statusCode = 502;
    errorMessage = 'SearxNG hostname could not be resolved. Please check the URL.';
  }

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    correlationId,
    details: {
      testedUrls: urlsToTest,
      lastError: lastError,
      suggestion: 'Ensure SearxNG Docker container is running: docker ps | grep searxng'
    }
  });
});

// Health and monitoring endpoints

// Overall system health
app.get('/api/health', (req, res) => {
  const correlationId = req.correlationId;

  try {
    const overallHealth = healthMonitor.getOverallHealth();
    const services = healthMonitor.getAllServices();
    const circuitBreakers = healthMonitor.getCircuitBreakerStatus();
    const processes = processMonitor.getAllProcesses();
    const connectionStats = httpClient.getConnectionStats();

    logger.health('Health status requested', correlationId, {
      overallStatus: overallHealth.status,
      servicesCount: services.length,
      healthyServices: services.filter(s => s.status === 'healthy').length
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      correlationId,
      overall: overallHealth,
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        status: service.status,
        uptime: service.uptime,
        averageResponseTime: service.averageResponseTime,
        lastCheck: service.lastCheck,
        issues: service.issues,
        metadata: service.metadata
      })),
      circuitBreakers,
      processes: processes.map(process => ({
        id: process.id,
        name: process.name,
        status: process.status,
        uptime: process.startTime ? Date.now() - process.startTime.getTime() : 0,
        restartCount: process.restartCount,
        lastRestart: process.lastRestart
      })),
      connectionPool: connectionStats
    });
  } catch (error) {
    logger.error('Failed to get health status', correlationId, { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health status',
      correlationId
    });
  }
});

// Health history
app.get('/api/health/history', (req, res) => {
  const correlationId = req.correlationId;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const history = healthMonitor.getHealthHistory(limit);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      correlationId,
      history,
      count: history.length
    });
  } catch (error) {
    logger.error('Failed to get health history', correlationId, { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health history',
      correlationId
    });
  }
});

// Force health check
app.post('/api/health/check/:serviceId?', async (req, res) => {
  const correlationId = req.correlationId;
  const serviceId = req.params.serviceId;

  try {
    if (serviceId) {
      // Check specific service
      const result = await healthMonitor.forceCheck(serviceId, correlationId);

      logger.info(`Forced health check for service: ${serviceId}`, correlationId, {
        serviceStatus: result.status
      });

      res.json({
        success: true,
        correlationId,
        service: result
      });
    } else {
      // Check all services
      await healthMonitor.performHealthCheck();
      const overallHealth = healthMonitor.getOverallHealth();

      logger.info('Forced health check for all services', correlationId);

      res.json({
        success: true,
        correlationId,
        overall: overallHealth
      });
    }
  } catch (error) {
    logger.error('Failed to perform forced health check', correlationId, {
      serviceId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to perform health check',
      correlationId
    });
  }
});

// Circuit breaker management
app.get('/api/circuit-breakers', (req, res) => {
  const correlationId = req.correlationId;

  try {
    const status = Object.keys(circuitBreakers).map(key => circuitBreakers[key].getStatus());

    res.json({
      success: true,
      correlationId,
      circuitBreakers: status
    });
  } catch (error) {
    logger.error('Failed to get circuit breaker status', correlationId, { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve circuit breaker status',
      correlationId
    });
  }
});

// Reset circuit breaker
app.post('/api/circuit-breakers/:name/reset', (req, res) => {
  const correlationId = req.correlationId;
  const name = req.params.name;

  try {
    if (circuitBreakers[name]) {
      circuitBreakers[name].forceClose();

      logger.info(`Circuit breaker reset: ${name}`, correlationId);

      res.json({
        success: true,
        message: `Circuit breaker ${name} has been reset`,
        correlationId
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Circuit breaker not found: ${name}`,
        correlationId
      });
    }
  } catch (error) {
    logger.error('Failed to reset circuit breaker', correlationId, {
      name,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to reset circuit breaker',
      correlationId
    });
  }
});

// Process management
app.get('/api/processes', (req, res) => {
  const correlationId = req.correlationId;

  try {
    const processes = processMonitor.getAllProcesses();
    const restartHistory = processMonitor.getRestartHistory(20);

    res.json({
      success: true,
      correlationId,
      processes,
      restartHistory
    });
  } catch (error) {
    logger.error('Failed to get process status', correlationId, { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve process status',
      correlationId
    });
  }
});

// Start/restart process
app.post('/api/processes/:processId/start', async (req, res) => {
  const correlationId = req.correlationId;
  const processId = req.params.processId;

  try {
    await processMonitor.startProcess(processId, correlationId);

    logger.info(`Process restart requested: ${processId}`, correlationId);

    res.json({
      success: true,
      message: `Process ${processId} start/restart initiated`,
      correlationId
    });
  } catch (error) {
    logger.error('Failed to start process', correlationId, {
      processId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: error.message,
      correlationId
    });
  }
});

// Stop process
app.post('/api/processes/:processId/stop', async (req, res) => {
  const correlationId = req.correlationId;
  const processId = req.params.processId;

  try {
    await processMonitor.stopProcess(processId, correlationId);

    logger.info(`Process stop requested: ${processId}`, correlationId);

    res.json({
      success: true,
      message: `Process ${processId} stopped`,
      correlationId
    });
  } catch (error) {
    logger.error('Failed to stop process', correlationId, {
      processId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: error.message,
      correlationId
    });
  }
});

// Run search
app.post('/api/search', (req, res) => {
  const {
    keywords,
    searxUrl,
    workDir,
    useCache,
    openResults,
    verbose,
    parallel,
    exportFormat,
    throttleLimit,
    delay,
    maxRetries
  } = req.body;

  // Use rootDir as default WorkDir if not provided
  const effectiveWorkDir = workDir || rootDir;
  
  const args = [
    '-SearxURL', searxUrl,
    '-WorkDir', effectiveWorkDir,
    '-Keywords', keywords.join(','),
    '-ExportFormat', exportFormat,
    '-DelaySeconds', delay.toString(),
    '-MaxRetries', maxRetries.toString()
  ];

  if (useCache) args.push('-UseCache');
  if (openResults) args.push('-OpenResults');
  if (verbose) args.push('-Verbose');
  if (parallel) {
    args.push('-Parallel');
    args.push('-ThrottleLimit', throttleLimit.toString());
  }

  const scriptToUse = parallel ? parallelScript : searchScript;

  // Set up Server-Sent Events for real-time progress
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  let progressData = {
    currentKeyword: '',
    currentIndex: 0,
    totalKeywords: keywords.length,
    resultsFound: 0,
    status: 'Starting...',
    percentage: 0,
    startTime: new Date().toISOString()
  };

  const sendProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial progress
  sendProgress(progressData);

  // Run PowerShell script with real-time output
  const child = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', scriptToUse, ...args], {
    cwd: effectiveWorkDir,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let errorOutput = '';

  child.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    console.log('PowerShell output:', text.trim());
    
    // Parse progress from output
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for progress indicators
      if (trimmed.includes('Processing keyword:') || trimmed.includes('Searching for:')) {
        const match = trimmed.match(/(?:Processing keyword:|Searching for:)\s*(.+)/);
        if (match) {
          progressData.currentKeyword = match[1];
          progressData.currentIndex++;
          progressData.percentage = Math.round((progressData.currentIndex / progressData.totalKeywords) * 100);
          progressData.status = `Processing: ${progressData.currentKeyword}`;
          sendProgress(progressData);
        }
      } else if (trimmed.includes('Found') && trimmed.includes('results')) {
        const match = trimmed.match(/Found\s+(\d+)\s+results/);
        if (match) {
          progressData.resultsFound += parseInt(match[1]);
          progressData.status = `Found ${progressData.resultsFound} total results`;
          sendProgress(progressData);
        }
      } else if (trimmed.includes('Starting search operation')) {
        progressData.status = 'Initializing search...';
        sendProgress(progressData);
      } else if (trimmed.includes('Search completed') || trimmed.includes('✓ Search completed')) {
        progressData.status = 'Search completed!';
        progressData.percentage = 100;
        sendProgress(progressData);
      } else if (trimmed.includes('Testing connection')) {
        progressData.status = 'Testing connection to SearxNG...';
        sendProgress(progressData);
      } else if (trimmed.includes('Connection successful')) {
        progressData.status = 'Connection established, starting search...';
        sendProgress(progressData);
      }
    }
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    errorOutput += text;
    console.error('PowerShell error:', text.trim());
    
    // Send error as progress update
    progressData.status = `Error: ${text.trim()}`;
    sendProgress(progressData);
  });

  child.on('close', (code) => {
    console.log(`PowerShell script exited with code ${code}`);
    
    if (code === 0) {
      const results = parseSearchResults(effectiveWorkDir);
      progressData.status = 'Search completed successfully!';
      progressData.percentage = 100;
      progressData.resultsFound = results.length;
      progressData.endTime = new Date().toISOString();
      sendProgress(progressData);
      
      // Send final results
      res.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        success: true, 
        results, 
        output,
        statistics: {
          totalResults: results.length,
          uniqueUrls: new Set(results.map(r => r.url)).size,
          keywordsUsed: new Set(results.map(r => r.keyword)).size,
          enginesUsed: new Set(results.map(r => r.engine)).size
        }
      })}\n\n`);
    } else {
      progressData.status = `Search failed with exit code ${code}`;
      progressData.endTime = new Date().toISOString();
      sendProgress(progressData);
      
      res.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        success: false, 
        error: `PowerShell script failed with exit code ${code}`, 
        output: output + errorOutput 
      })}\n\n`);
    }
    
    res.end();
  });

  child.on('error', (error) => {
    console.error('Failed to start PowerShell script:', error);
    progressData.status = `Failed to start: ${error.message}`;
    progressData.endTime = new Date().toISOString();
    sendProgress(progressData);
    
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      success: false, 
      error: `Failed to start PowerShell script: ${error.message}` 
    })}\n\n`);
    res.end();
  });

  // Set timeout for the request
  const timeout = setTimeout(() => {
    child.kill();
    progressData.status = 'Search timed out';
    progressData.endTime = new Date().toISOString();
    sendProgress(progressData);
    
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      success: false, 
      error: 'Search request timed out' 
    })}\n\n`);
    res.end();
  }, 300000); // 5 minutes timeout

  child.on('close', () => {
    clearTimeout(timeout);
  });
});

// Get comprehensive results with metadata
app.get('/api/results', (req, res) => {
  const searchResultsDir = path.join(rootDir, 'data', 'results');
  
  if (!fs.existsSync(searchResultsDir)) {
    return res.json({ results: [], metadata: null });
  }

  // Get all JSON files
  const jsonFiles = fs.readdirSync(searchResultsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      name: file,
      path: path.join(searchResultsDir, file),
      stats: fs.statSync(path.join(searchResultsDir, file))
    }))
    .sort((a, b) => b.stats.mtime - a.stats.mtime);

  if (jsonFiles.length === 0) {
    return res.json({ results: [], metadata: null });
  }

  try {
    const latestFile = jsonFiles[0];
    let content = fs.readFileSync(latestFile.path, 'utf8');
    
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    
    const data = JSON.parse(content);

    // Normalize data structure (PowerShell outputs capitalized keys)
    const rawResults = data.Results || data.results || [];
    const metadata = data.Metadata || data.metadata || null;
    const statistics = data.Statistics || data.statistics || null;

    // Normalize each result object to have lowercase keys
    const results = rawResults.map(result => ({
      keyword: result.Keyword || result.keyword || '',
      title: result.Title || result.title || '',
      url: result.URL || result.url || '',
      content: result.Content || result.content || '',
      engine: result.Engine || result.engine || 'unknown',
      score: result.Score || result.score || 0,
      timestamp: result.Timestamp || result.timestamp || new Date().toISOString()
    }));

    console.log(`Loaded ${results.length} results from ${latestFile.name}`);

    // Return comprehensive data
    res.json({
      results: results,
      metadata: metadata,
      statistics: statistics,
      fileInfo: {
        name: latestFile.name,
        path: latestFile.path,
        modified: latestFile.stats.mtime,
        size: latestFile.stats.size
      },
      allFiles: jsonFiles.map(f => ({
        name: f.name,
        modified: f.stats.mtime,
        size: f.stats.size
      }))
    });
  } catch (error) {
    console.error('Error loading results:', error);
    res.status(500).json({ error: 'Failed to load results' });
  }
});

// Import data from uploaded file
app.post('/api/import', async (req, res) => {
  const { data, filename, format } = req.body;
  const searchResultsDir = path.join(rootDir, 'data', 'results');

  console.log('Import request received:', { filename, format, dataLength: data?.length });

  if (!data || !filename) {
    return res.status(400).json({ error: 'Data and filename are required' });
  }

  try {
    let results = [];
    let metadata = null;
    
    if (format === 'json') {
      console.log('Parsing JSON data...');
      const parsed = JSON.parse(data);
      
      // Handle different JSON structures
      if (Array.isArray(parsed)) {
        results = parsed;
      } else if (parsed.results && Array.isArray(parsed.results)) {
        results = parsed.results;
        metadata = parsed.metadata || null;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        results = parsed.data;
        metadata = parsed.metadata || null;
      } else {
        throw new Error('Invalid JSON structure. Expected array or object with results/data property.');
      }
      
      console.log(`Parsed ${results.length} results from JSON`);
    } else if (format === 'csv') {
      console.log('Parsing CSV data...');
      const lines = data.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }
      
      // Better CSV parsing that handles quoted fields
      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };
      
      const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim());
      console.log('CSV headers:', headers);
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = parseCSVLine(lines[i]);
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          results.push(row);
        }
      }
      
      console.log(`Parsed ${results.length} results from CSV`);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    if (results.length === 0) {
      throw new Error('No valid data found in the file');
    }
    
    // Ensure results directory exists
    try {
      await fs.promises.access(searchResultsDir);
    } catch (error) {
      await fs.promises.mkdir(searchResultsDir, { recursive: true });
    }
    
    // Save imported data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const importFile = path.join(searchResultsDir, `imported_${timestamp}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
    
    const exportData = {
      metadata: {
        ...metadata,
        imported: true,
        originalFilename: filename,
        importDate: new Date().toISOString(),
        importFormat: format,
        totalResults: results.length
      },
      results: results,
      statistics: {
        totalResults: results.length,
        uniqueUrls: new Set(results.map(r => r.url || r.URL)).size,
        keywordsUsed: new Set(results.map(r => r.keyword || r.Keyword)).size,
        enginesUsed: new Set(results.map(r => r.engine || r.Engine)).size,
        imported: true
      }
    };
    
    await fs.promises.writeFile(importFile, JSON.stringify(exportData, null, 2));
    console.log(`Saved imported data to: ${importFile}`);
    
    res.json({ 
      success: true, 
      imported: results.length,
      file: importFile,
      statistics: exportData.statistics
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: 'Failed to import data', 
      details: error.message 
    });
  }
});

// Export data in various formats
app.post('/api/export', (req, res) => {
  const { format, data, filename } = req.body;
  
  if (!format || !data) {
    return res.status(400).json({ error: 'Format and data are required' });
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFilename = filename || `export_${timestamp}`;
    let content = '';
    let mimeType = 'application/json';
    let extension = 'json';
    
    switch (format.toLowerCase()) {
      case 'csv':
        if (data.results && data.results.length > 0) {
          const headers = Object.keys(data.results[0]);
          content = headers.join(',') + '\n';
          content += data.results.map(row => 
            headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
          ).join('\n');
        }
        mimeType = 'text/csv';
        extension = 'csv';
        break;
        
      case 'txt':
        if (data.results && data.results.length > 0) {
          content = data.results.map(row => row.URL || row.url || JSON.stringify(row)).join('\n');
        }
        mimeType = 'text/plain';
        extension = 'txt';
        break;
        
      case 'xlsx':
        // For Excel, we'll return JSON and let the frontend handle it
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
        break;
        
      case 'json':
      default:
        content = JSON.stringify(data, null, 2);
        break;
    }
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportFilename}.${extension}"`);
    res.send(content);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Get recent reports
app.get('/api/reports', (req, res) => {
  if (!fs.existsSync(reportsDir)) {
    return res.json({ reports: [] });
  }

  const reports = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.html'))
    .map(file => {
      const filePath = path.join(reportsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        modified: stats.mtime,
        size: stats.size
      };
    })
    .sort((a, b) => b.modified - a.modified)
    .slice(0, 10); // Return top 10 most recent

  res.json({ reports });
});

// Get report content
app.get('/api/reports/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(reportsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  res.send(content);
});

// Get keywords from file
app.get('/api/keywords', (req, res) => {
  const keywordsFile = path.join(dataDir, 'keywords.txt');

  if (!fs.existsSync(keywordsFile)) {
    return res.json({ keywords: [] });
  }

  const content = fs.readFileSync(keywordsFile, 'utf8');
  const keywords = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  res.json({ keywords });
});

// Save keywords to file
app.post('/api/keywords', async (req, res) => {
  const { keywords } = req.body;
  const keywordsFile = path.join(dataDir, 'keywords.txt');

  const content = [
    `# Generated Keywords - ${new Date().toISOString()}`,
    `# Total Keywords: ${keywords.length}`,
    '',
    ...keywords
  ].join('\n');

  await fs.promises.writeFile(keywordsFile, content, 'utf8');
  res.json({ success: true });
});

// Helper function to parse search results
function parseSearchResults(workDir) {
  const searchResultsDir = path.join(workDir, 'data', 'results');

  if (!fs.existsSync(searchResultsDir)) {
    return [];
  }

  // Look for the most recent JSON results file
  const jsonFiles = fs.readdirSync(searchResultsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      name: file,
      path: path.join(searchResultsDir, file),
      stats: fs.statSync(path.join(searchResultsDir, file))
    }))
    .sort((a, b) => b.stats.mtime - a.stats.mtime);

  if (jsonFiles.length === 0) {
    return [];
  }

  try {
    let content = fs.readFileSync(jsonFiles[0].path, 'utf8');
    
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    
    // Clean up any non-JSON content (like progress messages)
    const lines = content.split('\n');
    let jsonContent = '';
    let inJsonBlock = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('{') || inJsonBlock) {
        inJsonBlock = true;
        jsonContent += line + '\n';
        if (trimmed.endsWith('}')) {
          break;
        }
      }
    }
    
    if (jsonContent.trim()) {
      return JSON.parse(jsonContent.trim());
    } else {
      // Fallback: try to parse the original content
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error parsing results:', error);
    console.error('File path:', jsonFiles[0].path);
    console.error('Content preview:', fs.readFileSync(jsonFiles[0].path, 'utf8').substring(0, 200));
    return [];
  }
}

// Enhanced server startup with monitoring
async function startServer() {
  const startupCorrelationId = logger.createContext();

  logger.info('Starting SearxNG API Server...', startupCorrelationId, {
    port: PORT,
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid
  });

  try {
    // Start health monitoring
    logger.info('Initializing health monitoring...', startupCorrelationId);
    healthMonitor.start();

    // Start process monitoring
    logger.info('Initializing process monitoring...', startupCorrelationId);
    processMonitor.start();

    // Start the HTTP server
    const server = app.listen(PORT, () => {
      logger.success(`SearxNG API Server running on port ${PORT}`, startupCorrelationId, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      });

      console.log('✅ SearxNG API Server started successfully!');
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`📊 Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`🔧 Make sure SearxNG is running on port 8888`);
      console.log('');
      console.log('📋 Available endpoints:');
      console.log('  POST /api/test-connection    - Test SearxNG connectivity');
      console.log('  POST /api/search             - Run search operations');
      console.log('  GET  /api/health             - System health status');
      console.log('  GET  /api/health/history     - Health history');
      console.log('  POST /api/health/check       - Force health check');
      console.log('  GET  /api/circuit-breakers   - Circuit breaker status');
      console.log('  GET  /api/processes          - Process status');
      console.log('');
    });

    // Enhanced shutdown handling
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`, startupCorrelationId);

      try {
        // Stop accepting new connections
        server.close(() => {
          logger.info('HTTP server closed', startupCorrelationId);
        });

        // Stop monitoring services
        logger.info('Stopping health monitor...', startupCorrelationId);
        healthMonitor.stop();

        logger.info('Stopping process monitor...', startupCorrelationId);
        processMonitor.stop();

        // Cleanup HTTP client connections
        logger.info('Cleaning up HTTP connections...', startupCorrelationId);
        httpClient.destroy();

        // Log cleanup
        logger.info('Performing log cleanup...', startupCorrelationId);
        logger.cleanup();

        logger.success('Server shutdown completed gracefully', startupCorrelationId);
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', startupCorrelationId, {
          error: error.message
        });
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', startupCorrelationId, {
        error: error.message,
        stack: error.stack
      });
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', startupCorrelationId, {
        reason: reason?.toString() || 'Unknown',
        promise: promise?.toString() || 'Unknown'
      });
    });

    // Periodic log cleanup (every 6 hours)
    setInterval(() => {
      logger.cleanup(7); // Keep 7 days of logs
    }, 6 * 60 * 60 * 1000);

    return server;

  } catch (error) {
    logger.error('Failed to start server', startupCorrelationId, {
      error: error.message,
      stack: error.stack
    });

    console.error('❌ Failed to start SearxNG API Server:', error.message);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer().catch(error => {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { app, startServer, healthMonitor, processMonitor, httpClient, logger };
