# New Monorepo Structure Guide

## Overview

SearxNG LinkedIn Collector v3.0 has been restructured as a monorepo for better organization, maintainability, and development experience.

## Directory Layout

```
SearxQueries/
├── packages/
│   ├── api/                 # Node.js Express API Server
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── server.js
│   │   ├── package.json
│   │   └── README.md
│   ├── ui/                  # React + TypeScript Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── App.tsx
│   │   ├── public/
│   │   ├── package.json
│   │   └── README.md
│   └── scripts/             # PowerShell Scripts
│       ├── modules/
│       │   └── SearxHelpers.psm1
│       ├── ScriptQueries.ps1
│       ├── ScriptQueriesParallel.ps1
│       ├── SearxQueriesUI.ps1
│       └── README.md
├── shared/                  # Shared Types & Utilities
│   ├── types.ts
│   └── README.md
├── data/                    # Runtime Data
│   ├── cache/               # Query cache
│   ├── exports/             # Custom exports
│   ├── logs/                # Search logs
│   ├── reports/             # HTML reports
│   └── results/             # CSV, JSON, TXT results
├── docs/                    # Documentation
│   ├── examples/            # Query examples
│   ├── USAGE_GUIDE.md
│   └── ...
├── config/                  # Configuration Files
│   └── settings.yml.example
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # Workspace definition
└── README.md
```

## Running the Project

### Quick Start (Recommended)
```powershell
# Start everything at once
.\Start-All.ps1

# Or run individual components:
.\Start-API.ps1     # API server only
.\Start-UI.ps1      # React UI only
```

### Manual Start
```bash
# Install all dependencies
npm run install:all

# Start API server (terminal 1)
npm run dev:api

# Start React UI (terminal 2)
npm run dev:ui
```

### PowerShell Scripts
```powershell
# Direct script execution
.\packages\scripts\ScriptQueries.ps1 -Keywords "Stanford AI"
.\packages\scripts\ScriptQueriesParallel.ps1 -Keywords "test" -Parallel
```

## Key Changes from v2.x

### Directory Structure
- **Before**: Mixed concerns in root directory
- **After**: Organized packages with clear separation

### Data Organization
- **Before**: `results/`, `reports/`, `logs/`, `cache/` in root
- **After**: All runtime data consolidated under `data/`

### Development Workflow
- **Before**: Manual dependency management
- **After**: Workspace-managed dependencies with root scripts

## Migration Notes

### For Existing Users
1. All your data remains in `data/` directory
2. Scripts are now in `packages/scripts/`
3. Use new launcher scripts in root directory

### For Developers
1. API server is now in `packages/api/`
2. React UI is in `packages/ui/`
3. Shared types available in `shared/`

## Benefits

1. **Better Organization**: Clear separation of concerns
2. **Easier Development**: Single repository for all components
3. **Atomic Commits**: Changes across components in one commit
4. **Shared Dependencies**: Common types and utilities
5. **Simplified Deployment**: Consistent structure

## Troubleshooting

### "Cannot find script/module"
Update paths to use `packages/scripts/` directory.

### "API not responding"
Ensure API server is running: `npm run dev:api`

### "UI not connecting"
Check API server is on port 3001 and UI is on port 5173.

### "Scripts not working"
Verify WorkDir parameter or use launcher scripts that set correct paths.
