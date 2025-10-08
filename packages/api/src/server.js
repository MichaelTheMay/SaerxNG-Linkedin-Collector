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
      if (response.statusCode === 200 || response.statusCode === 302) {
        res.json({ success: true, message: 'Connection successful' });
      } else {
        res.status(500).json({ 
          success: false, 
          error: `SearxNG returned status code ${response.statusCode}` 
        });
      }
    });

    request.on('error', (error) => {
      res.status(500).json({ 
        success: false, 
        error: `Failed to connect to SearxNG: ${error.message}` 
      });
    });

    request.on('timeout', () => {
      request.destroy();
      res.status(500).json({ 
        success: false, 
        error: 'Connection timeout - SearxNG is not responding' 
      });
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: `Invalid URL or connection error: ${error.message}` 
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

  // For long-running searches, we should use a job queue system
  // For now, we'll run synchronously with a timeout
  runPowerShellScript(scriptToUse, args, (error, output) => {
    if (error) {
      return res.status(500).json({ success: false, error: error.message, output });
    }

    // Parse results from output or file system
    const results = parseSearchResults(effectiveWorkDir);
    res.json({ success: true, results, output });
  });
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
    const content = fs.readFileSync(jsonFiles[0].path, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing results:', error);
    return [];
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`SearxNG API Server running on port ${PORT}`);
  console.log(`Make sure SearxNG is running and PowerShell scripts are available`);
});

module.exports = app;
