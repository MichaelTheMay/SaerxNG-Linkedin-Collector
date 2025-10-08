# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SearxNG LinkedIn Collector is a monorepo application for collecting LinkedIn profiles via SearxNG's metasearch engine. It combines PowerShell automation, a Node.js/Express API server, and a React/TypeScript web UI.

## Architecture

### Monorepo Structure

```
packages/
├── api/          # Node.js Express API server (port 3001)
├── ui/           # React + TypeScript frontend (port 5173)
└── scripts/      # PowerShell automation scripts
shared/           # TypeScript types shared across packages
data/             # Runtime data (results, reports, logs, cache)
```

### Component Interaction

1. **React UI** (packages/ui) → Makes HTTP requests to API server
2. **API Server** (packages/api) → Spawns PowerShell scripts and returns results
3. **PowerShell Scripts** (packages/scripts) → Executes SearxNG queries and saves to data/

### Key Technologies

- **Frontend**: React 18, TypeScript, Material-UI, Vite
- **Backend**: Node.js, Express, CORS
- **Automation**: PowerShell 5.1+, SearxHelpers module
- **Data Flow**: PowerShell → File System → API → React

## Development Commands

### Quick Start

```powershell
# Start everything (API + UI)
.\Start-All.ps1

# Or individually:
.\Start-API.ps1    # API server only (port 3001)
.\Start-UI.ps1     # React UI only (port 5173)
```

### Installation

```bash
# Install all dependencies (root + all packages)
npm run install:all

# Or manually:
npm install
cd packages/api && npm install
cd ../ui && npm install
```

### Development

```bash
# Start API server (terminal 1)
npm run dev:api
# or: cd packages/api && npm start

# Start React UI (terminal 2)
npm run dev:ui
# or: cd packages/ui && npm run dev

# Start both simultaneously
npm start
```

### Build

```bash
# Build React UI for production
npm run build
# Output: packages/ui/dist/

# Preview production build
npm run preview
```

### PowerShell Scripts

```powershell
# Basic search
.\packages\scripts\ScriptQueries.ps1 -Keywords "Stanford AI"

# Parallel search (3-5x faster)
.\packages\scripts\ScriptQueriesParallel.ps1 -Keywords "test" -Parallel -ThrottleLimit 5

# Interactive mode
.\packages\scripts\ScriptQueries.ps1 -Interactive

# With all options
.\packages\scripts\ScriptQueries.ps1 `
  -SearxURL "http://localhost:8888" `
  -Keywords "Stanford AI","Stanford ML" `
  -UseCache `
  -OpenResults `
  -ExportFormat "ALL" `
  -Verbose
```

### Testing

```powershell
# Integration test (tests all components)
.\integration-test.ps1

# Test script execution
.\packages\scripts\test-script.ps1
```

## Critical Architecture Details

### Shared Types (shared/types.ts)

All TypeScript interfaces are defined in `shared/types.ts` and used across both API and UI:
- `SearchParams` - Search configuration
- `SearchResult` - Individual search result
- `SearchResponse` - API response format
- `SearchProgress` - Real-time progress updates
- `SearchStats` - Search statistics

**When modifying data structures**: Update `shared/types.ts` first, then update API and UI code.

### API Server Architecture (packages/api/src/server.js)

The API server acts as a bridge between the React UI and PowerShell scripts:

1. **Receives HTTP requests** from React UI
2. **Spawns PowerShell processes** using `child_process.spawn()`
3. **Captures stdout/stderr** from PowerShell scripts
4. **Returns JSON responses** to React UI

Key endpoints:
- `POST /api/test-connection` - Test SearxNG connectivity
- `POST /api/search` - Execute search via ScriptQueries.ps1
- `POST /api/search-parallel` - Execute parallel search via ScriptQueriesParallel.ps1
- `GET /api/reports` - List generated HTML reports
- `GET /api/keywords` - List recent keywords from cache

### PowerShell Script Workflow

1. **ScriptQueries.ps1** - Sequential search execution
   - Validates SearxNG connection
   - Loads keywords (default or custom)
   - Queries SearxNG with pagination support
   - Deduplicates URLs
   - Exports to CSV/JSON/TXT/HTML
   - Generates HTML report

2. **ScriptQueriesParallel.ps1** - Parallel search execution
   - Same as ScriptQueries.ps1 but uses PowerShell runspaces
   - Throttle limit controls max concurrent threads (default: 5)
   - 3-5x faster for large keyword sets

3. **SearxHelpers.psm1** (packages/scripts/modules/)
   - Shared functions for both scripts
   - URL deduplication, caching, HTTP requests, HTML generation

### Data Directory Structure

All search output goes to `data/`:
```
data/
├── cache/       # Query cache (24-hour expiration)
├── exports/     # Custom exports
├── logs/        # Search logs (search_log_YYYYMMDD_HHMMSS.txt)
├── reports/     # HTML reports (Report_YYYYMMDD_HHMMSS.html)
└── results/     # CSV/JSON/TXT results
```

**Important**: Scripts expect `data/` to exist. Root-level launcher scripts handle path resolution correctly.

### React UI Components

- **App.tsx** - Main application with tabs (Search, Query Builder, Wizard)
- **QueryBuilder.tsx** - Advanced query building interface
- **WizardRunner.tsx** - Step-by-step guided search wizard
- **api.ts** - API client functions

## Common Development Tasks

### Adding New Search Parameters

1. Update `shared/types.ts` → Add to `SearchParams` interface
2. Update `packages/scripts/ScriptQueries.ps1` → Add parameter to `param()` block
3. Update `packages/api/src/server.js` → Add to PowerShell script args array
4. Update `packages/ui/src/App.tsx` → Add to search form and state

### Modifying Search Logic

Edit PowerShell scripts in `packages/scripts/`:
- Core logic: `ScriptQueries.ps1` and `ScriptQueriesParallel.ps1`
- Shared functions: `modules/SearxHelpers.psm1`

### Adding API Endpoints

1. Edit `packages/api/src/server.js`
2. Add route handler with `app.get()` or `app.post()`
3. Update `packages/ui/src/api.ts` with client function
4. Use new function in React components

## Dependencies

### Required Software

- **Windows 10/11** (for PowerShell scripts)
- **PowerShell 5.1+**
- **Node.js 14+** and npm 6+
- **SearxNG instance** running with JSON format enabled

### SearxNG Configuration

Ensure `settings.yml` includes:
```yaml
search:
  formats:
    - html
    - json
```

Restart SearxNG after changes: `docker restart searxng`

## Troubleshooting

### "Cannot find script" errors

Scripts moved to `packages/scripts/` in v3.0. Use launcher scripts in root directory:
- `.\Start-All.ps1`, `.\Start-API.ps1`, `.\Start-UI.ps1`

### API not connecting to PowerShell

Check paths in `packages/api/src/server.js`:
- `scriptDir` should resolve to `packages/scripts/`
- Verify PowerShell scripts exist at expected locations

### React UI CORS errors

API server has CORS enabled (`app.use(cors())`). If issues persist, verify:
1. API server is running on port 3001
2. React UI is configured to call `http://localhost:3001`

### PowerShell execution policy

If scripts won't run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### No search results

1. Verify SearxNG is accessible: `http://localhost:8888/search?q=test&format=json`
2. Check search engines enabled in SearxNG settings
3. Try broader keywords
4. Review logs in `data/logs/`

## Performance Notes

- **Sequential search**: 10-300 seconds depending on keyword count and pagination
- **Parallel search**: 3-5x faster with ThrottleLimit of 5
- **Caching**: 24-hour cache significantly speeds up repeated searches
- **Delays**: Default 2s between queries, 500ms between pages (prevents rate limiting)

## Version Information

Current version: 3.0.0 (Monorepo structure)
Previous version: 2.2.0 (Flat structure with parallel execution)

Major changes in v3.0:
- Reorganized as monorepo
- Added React UI with Material-UI
- Node.js API server wraps PowerShell scripts
- Shared TypeScript types
- Consolidated data directory
