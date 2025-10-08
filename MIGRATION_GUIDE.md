# Migration Guide: Restructuring SearxNG LinkedIn Collector

## Quick Migration Script

Save this as `migrate-structure.ps1` and run it to automatically reorganize your project:

```powershell
# migrate-structure.ps1
# Backup first!
Write-Host "Creating backup..." -ForegroundColor Yellow
$backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item -Path . -Destination $backupDir -Recurse -Exclude node_modules,dist,.git

Write-Host "Creating new directory structure..." -ForegroundColor Green

# Create directories
$directories = @(
    "packages/api/src",
    "packages/api/src/routes",
    "packages/api/src/services",
    "packages/ui",
    "packages/scripts/modules",
    "shared",
    "docs/examples",
    "data",
    "config"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

Write-Host "Moving files to new locations..." -ForegroundColor Green

# Move API files
if (Test-Path "api-server.js") {
    Move-Item -Path "api-server.js" -Destination "packages/api/src/server.js" -Force
}
if (Test-Path "package.json") {
    Copy-Item -Path "package.json" -Destination "packages/api/package.json" -Force
}

# Move UI files
if (Test-Path "searx-ui") {
    Get-ChildItem -Path "searx-ui/*" | Move-Item -Destination "packages/ui/" -Force
}

# Move PowerShell scripts
Get-ChildItem -Path "*.ps1" | Where-Object { $_.Name -ne "migrate-structure.ps1" } | 
    Move-Item -Destination "packages/scripts/" -Force
Get-ChildItem -Path "*.psm1" | Move-Item -Destination "packages/scripts/modules/" -Force

# Move documentation
Get-ChildItem -Path "*.md" | Where-Object { $_.Name -notmatch "README|ARCHITECTURE|MIGRATION" } |
    Move-Item -Destination "docs/" -Force
if (Test-Path "example-queries") {
    Get-ChildItem -Path "example-queries/*" | Move-Item -Destination "docs/examples/" -Force
}

# Move data directories
@("cache", "exports", "logs", "reports", "results") | ForEach-Object {
    if (Test-Path $_) {
        Move-Item -Path $_ -Destination "data/$_" -Force
    }
}

# Move config
if (Test-Path "settings.yml.example") {
    Move-Item -Path "settings.yml.example" -Destination "config/" -Force
}

Write-Host "Structure migration complete!" -ForegroundColor Green
Write-Host "Backup saved to: $backupDir" -ForegroundColor Cyan
```

## Manual Migration Steps

### 1. Create Backup
```bash
cp -r . ../SearxQueries_backup_$(date +%Y%m%d)
```

### 2. Create New Structure
```bash
mkdir -p packages/{api/src,ui,scripts/modules}
mkdir -p {shared,docs/examples,data,config}
```

### 3. Move Files

#### API Server
```bash
mv api-server.js packages/api/src/server.js
cp package.json packages/api/
```

#### React UI
```bash
mv searx-ui/* packages/ui/
```

#### PowerShell Scripts
```bash
mv *.ps1 packages/scripts/
mv *.psm1 packages/scripts/modules/
```

#### Documentation
```bash
mv USAGE_GUIDE.md QUICK_REFERENCE.md FEATURES*.md docs/
mv example-queries/* docs/examples/
```

#### Data Directories
```bash
mv cache exports logs reports results data/
```

### 4. Update Import Paths

#### In packages/api/src/server.js:
```javascript
// Old
const scriptDir = __dirname;
const searchScript = path.join(scriptDir, 'ScriptQueries.ps1');

// New
const scriptDir = path.join(__dirname, '../../scripts');
const searchScript = path.join(scriptDir, 'ScriptQueries.ps1');
```

#### In packages/ui/src/api.ts:
```typescript
// No changes needed if using absolute URLs
const API_BASE_URL = 'http://localhost:3001/api';
```

### 5. Create Root package.json
```json
{
  "name": "searxng-linkedin-collector",
  "version": "3.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run api:dev\" \"npm run ui:dev\"",
    "api:dev": "cd packages/api && npm run dev",
    "ui:dev": "cd packages/ui && npm run dev",
    "api:start": "cd packages/api && npm start",
    "ui:build": "cd packages/ui && npm run build",
    "install:all": "npm install && cd packages/api && npm install && cd ../ui && npm install"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

### 6. Update Launch Scripts

Create `Launch-UI.ps1` in root:
```powershell
# Launch both API and UI
param(
    [switch]$ApiOnly,
    [switch]$UiOnly
)

if (-not $UiOnly) {
    Write-Host "Starting API Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages/api; npm start"
    Start-Sleep -Seconds 2
}

if (-not $ApiOnly) {
    Write-Host "Starting React UI..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages/ui; npm run dev"
}

if (-not $ApiOnly -and -not $UiOnly) {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:5173"
}
```

### 7. Update .gitignore
```gitignore
# Dependencies
node_modules/
packages/*/node_modules/

# Build outputs
dist/
build/
packages/*/dist/

# Data directories
data/cache/*
data/exports/*
data/logs/*
data/reports/*
data/results/*

# Keep directories
!data/cache/.gitkeep
!data/exports/.gitkeep
!data/logs/.gitkeep
!data/reports/.gitkeep
!data/results/.gitkeep

# Environment
.env
.env.local
packages/*/.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### 8. Test Everything
```bash
# Install dependencies
npm run install:all

# Test API
cd packages/api && npm start

# Test UI (new terminal)
cd packages/ui && npm run dev

# Test PowerShell scripts
cd packages/scripts
./ScriptQueries.ps1 -Keywords "test"
```

## Rollback Plan

If you need to revert:
```powershell
# Remove new structure
Remove-Item -Recurse -Force packages, shared, docs, data, config

# Restore from backup
Copy-Item -Path "../SearxQueries_backup_*/*" -Destination . -Recurse -Force
```

## Benefits After Migration

1. **Cleaner root directory**: Only essential files at root
2. **Better organization**: Each component in its own package
3. **Easier deployment**: Can containerize each package separately
4. **Improved development**: Can work on UI/API independently
5. **Professional structure**: Follows industry best practices

## Next Steps

1. Consider adding TypeScript to API server
2. Implement shared types between packages
3. Add automated tests for each package
4. Setup CI/CD pipeline for automated deployment
5. Consider containerization with Docker

## Need Help?

If you encounter issues during migration:
1. Check the backup directory
2. Review error messages carefully
3. Ensure all dependencies are installed
4. Verify PowerShell execution policies
5. Check Node.js and npm versions
