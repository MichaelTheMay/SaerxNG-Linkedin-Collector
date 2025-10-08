const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Test SearxNG connection
app.post('/api/test-connection', async (req, res) => {
  const { searxUrl } = req.body;

  if (!searxUrl) {
    return res.status(400).json({ success: false, error: 'SearxNG URL is required' });
  }

  // Direct HTTP test to SearxNG
  try {
    const testUrl = `${searxUrl}/search?q=test&format=json`;
    const urlObj = new URL(testUrl);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 5000
    };

    const request = protocol.get(testUrl, options, (response) => {
      if (!res.headersSent) {
        if (response.statusCode === 200 || response.statusCode === 302) {
          res.json({ success: true, message: 'Connection successful' });
        } else {
          res.status(500).json({ 
            success: false, 
            error: `SearxNG returned status code ${response.statusCode}` 
          });
        }
      }
    });

    request.on('error', (error) => {
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: `Failed to connect to SearxNG: ${error.message}` 
        });
      }
    });

    request.on('timeout', () => {
      request.destroy();
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: 'Connection timeout - SearxNG is not responding' 
        });
      }
    });

  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: `Invalid URL or connection error: ${error.message}` 
      });
    }
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
    
    // Return comprehensive data
    res.json({
      results: data.results || [],
      metadata: data.metadata || null,
      statistics: data.statistics || null,
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
app.post('/api/import', (req, res) => {
  const { data, filename, format } = req.body;
  
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
    if (!fs.existsSync(searchResultsDir)) {
      fs.mkdirSync(searchResultsDir, { recursive: true });
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
    
    fs.writeFileSync(importFile, JSON.stringify(exportData, null, 2));
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
app.post('/api/keywords', (req, res) => {
  const { keywords } = req.body;
  const keywordsFile = path.join(dataDir, 'keywords.txt');

  const content = [
    `# Generated Keywords - ${new Date().toISOString()}`,
    `# Total Keywords: ${keywords.length}`,
    '',
    ...keywords
  ].join('\n');

  fs.writeFileSync(keywordsFile, content, 'utf8');
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

// Start server
app.listen(PORT, () => {
  console.log(`SearxNG API Server running on port ${PORT}`);
  console.log(`Make sure SearxNG is running and PowerShell scripts are available`);
});

module.exports = app;
