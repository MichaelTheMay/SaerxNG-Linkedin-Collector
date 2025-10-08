# SearxNG LinkedIn Collector - API Server

Node.js Express API server that provides a REST API for the SearxNG LinkedIn Collector.

## Features

- RESTful API for search operations
- Connection testing to SearxNG
- PowerShell script execution
- Results and reports management
- Keyword management

## Getting Started

### Prerequisites

- Node.js 14 or higher
- npm 6 or higher
- PowerShell 5.1+ (Windows) or PowerShell Core (cross-platform)
- Running SearxNG instance

### Installation

```bash
cd packages/api
npm install
```

### Development Mode

```bash
npm start        # Production mode
npm run dev      # Development mode with auto-reload (requires nodemon)
```

The server will start on `http://localhost:3001`

## API Endpoints

### Connection Testing

**POST** `/api/test-connection`

Test connection to SearxNG instance.

**Request Body:**
```json
{
  "searxUrl": "http://localhost:8888"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection successful"
}
```

### Search Operations

**POST** `/api/search`

Execute a search query through PowerShell scripts.

**Request Body:**
```json
{
  "keywords": ["Stanford AI", "Stanford ML"],
  "searxUrl": "http://localhost:8888",
  "workDir": "C:\\SearxQueries",
  "useCache": true,
  "openResults": false,
  "verbose": true,
  "parallel": true,
  "exportFormat": "ALL",
  "throttleLimit": 5,
  "delay": 2,
  "maxRetries": 3
}
```

**Response:**
```json
{
  "success": true,
  "results": [...],
  "output": "Search completed..."
}
```

### Reports Management

**GET** `/api/reports`

Get list of recent HTML reports.

**Response:**
```json
{
  "reports": [
    {
      "name": "linkedin_report_20251008_104241.html",
      "path": "C:\\SearxQueries\\data\\reports\\...",
      "modified": "2025-10-08T10:42:41.000Z",
      "size": 45678
    }
  ]
}
```

**GET** `/api/reports/:filename`

Get content of a specific report.

**Response:** HTML content

### Keywords Management

**GET** `/api/keywords`

Get keywords from file.

**Response:**
```json
{
  "keywords": ["Stanford AI", "Stanford ML", ...]
}
```

**POST** `/api/keywords`

Save keywords to file.

**Request Body:**
```json
{
  "keywords": ["Stanford AI", "Stanford ML", ...]
}
```

## Configuration

### Environment Variables

Create a `.env` file in the `packages/api` directory:

```env
PORT=3001
NODE_ENV=development
SEARX_DEFAULT_URL=http://localhost:8888
```

### Directory Structure

The API server expects the following directory structure:

```
SearxQueries/
├── packages/
│   ├── api/          # This directory
│   └── scripts/      # PowerShell scripts
└── data/
    ├── results/      # Search results
    ├── reports/      # HTML reports
    ├── logs/         # Log files
    └── cache/        # Query cache
```

## Development

### Running Tests

```bash
npm test
```

### Code Style

This project uses JavaScript with JSDoc type annotations for better IDE support.

## Production Deployment

```bash
# Build (if needed)
npm run build

# Start production server
NODE_ENV=production npm start
```

## Troubleshooting

### "Cannot find PowerShell scripts"
- Ensure `packages/scripts/` directory exists
- Verify ScriptQueries.ps1 and ScriptQueriesParallel.ps1 are present

### "Port 3001 already in use"
- Stop other processes using port 3001
- Or change PORT environment variable

### "PowerShell execution failed"
- Check PowerShell execution policy
- Verify scripts have correct permissions
- Check PowerShell script logs in `data/logs/`

## License

MIT
