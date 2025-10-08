# ===============================================================
# SearxNG LinkedIn Collector - Structure Migration Script
# ===============================================================
# This script reorganizes the project into a monorepo structure
# with separate packages for API, UI, and PowerShell scripts.
#
# WARNING: This will move files around! A backup will be created first.
#
# Usage:
#   .\migration-structure.ps1
#   .\migration-structure.ps1 -DryRun    (preview changes only)
#
# ===============================================================

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$SkipBackup
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  SearxNG LinkedIn Collector - Structure Migration" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Create backup
if (-not $SkipBackup -and -not $DryRun) {
    Write-Host "[1/6] Creating backup..." -ForegroundColor Yellow
    $backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    
    $excludeItems = @('node_modules', 'dist', '.git', 'backup_*')
    
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        Get-ChildItem -Path . -Exclude $excludeItems | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination (Join-Path $backupDir $_.Name) -Recurse -Force
        }
        
        Write-Host "   ✓ Backup created: $backupDir" -ForegroundColor Green
    }
} else {
    Write-Host "[1/6] Skipping backup (as requested)" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Create new directory structure
Write-Host "[2/6] Creating new directory structure..." -ForegroundColor Yellow

$directories = @(
    "packages/api/src/routes",
    "packages/api/src/services",
    "packages/ui",
    "packages/scripts/modules",
    "shared",
    "docs/examples",
    "data/cache",
    "data/exports",
    "data/logs",
    "data/reports",
    "data/results",
    "config"
)

foreach ($dir in $directories) {
    if ($DryRun) {
        Write-Host "   Would create: $dir" -ForegroundColor Gray
    } else {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✓ Created: $dir" -ForegroundColor Green
    }
}
Write-Host ""

# Step 3: Move API files
Write-Host "[3/6] Moving API server files..." -ForegroundColor Yellow

if (Test-Path "api-server.js") {
    if ($DryRun) {
        Write-Host "   Would move: api-server.js -> packages/api/src/server.js" -ForegroundColor Gray
    } else {
        Move-Item -Path "api-server.js" -Destination "packages/api/src/server.js" -Force
        Write-Host "   ✓ Moved: api-server.js -> packages/api/src/server.js" -ForegroundColor Green
    }
}

if (Test-Path "package.json") {
    if ($DryRun) {
        Write-Host "   Would copy: package.json -> packages/api/package.json" -ForegroundColor Gray
    } else {
        Copy-Item -Path "package.json" -Destination "packages/api/package.json" -Force
        Write-Host "   ✓ Copied: package.json -> packages/api/package.json" -ForegroundColor Green
    }
}

if (Test-Path "node_modules") {
    if ($DryRun) {
        Write-Host "   Would move: node_modules -> packages/api/node_modules" -ForegroundColor Gray
    } else {
        Move-Item -Path "node_modules" -Destination "packages/api/node_modules" -Force
        Write-Host "   ✓ Moved: node_modules -> packages/api/node_modules" -ForegroundColor Green
    }
}
Write-Host ""

# Step 4: Move UI files
Write-Host "[4/6] Moving React UI files..." -ForegroundColor Yellow

if (Test-Path "searx-ui") {
    $uiFiles = Get-ChildItem -Path "searx-ui" -Force
    foreach ($file in $uiFiles) {
        if ($DryRun) {
            Write-Host "   Would move: searx-ui/$($file.Name) -> packages/ui/$($file.Name)" -ForegroundColor Gray
        } else {
            $destPath = Join-Path "packages/ui" $file.Name
            Move-Item -Path $file.FullName -Destination $destPath -Force
            Write-Host "   ✓ Moved: searx-ui/$($file.Name)" -ForegroundColor Green
        }
    }
    
    if (-not $DryRun) {
        Remove-Item "searx-ui" -Force -ErrorAction SilentlyContinue
    }
}
Write-Host ""

# Step 5: Move PowerShell scripts and documentation
Write-Host "[5/6] Moving scripts and documentation..." -ForegroundColor Yellow

# PowerShell scripts
$ps1Files = Get-ChildItem -Path "*.ps1" -File | Where-Object { 
    $_.Name -ne "migration-structure.ps1" -and $_.Name -notlike "Restart-*.ps1"
}
foreach ($file in $ps1Files) {
    if ($DryRun) {
        Write-Host "   Would move: $($file.Name) -> packages/scripts/$($file.Name)" -ForegroundColor Gray
    } else {
        Move-Item -Path $file.FullName -Destination "packages/scripts/$($file.Name)" -Force
        Write-Host "   ✓ Moved: $($file.Name)" -ForegroundColor Green
    }
}

# PowerShell modules
$psm1Files = Get-ChildItem -Path "*.psm1" -File -ErrorAction SilentlyContinue
foreach ($file in $psm1Files) {
    if ($DryRun) {
        Write-Host "   Would move: $($file.Name) -> packages/scripts/modules/$($file.Name)" -ForegroundColor Gray
    } else {
        Move-Item -Path $file.FullName -Destination "packages/scripts/modules/$($file.Name)" -Force
        Write-Host "   ✓ Moved: $($file.Name)" -ForegroundColor Green
    }
}

# Documentation
$docFiles = Get-ChildItem -Path "*.md" -File | Where-Object { 
    $_.Name -notmatch "^(README|ARCHITECTURE|MIGRATION)" 
}
foreach ($file in $docFiles) {
    if ($DryRun) {
        Write-Host "   Would move: $($file.Name) -> docs/$($file.Name)" -ForegroundColor Gray
    } else {
        Move-Item -Path $file.FullName -Destination "docs/$($file.Name)" -Force
        Write-Host "   ✓ Moved: $($file.Name)" -ForegroundColor Green
    }
}

# Example queries
if (Test-Path "example-queries") {
    $exampleFiles = Get-ChildItem -Path "example-queries" -File
    foreach ($file in $exampleFiles) {
        if ($DryRun) {
            Write-Host "   Would move: example-queries/$($file.Name) -> docs/examples/$($file.Name)" -ForegroundColor Gray
        } else {
            Move-Item -Path $file.FullName -Destination "docs/examples/$($file.Name)" -Force
            Write-Host "   ✓ Moved: example-queries/$($file.Name)" -ForegroundColor Green
        }
    }
    
    if (-not $DryRun) {
        Remove-Item "example-queries" -Force -Recurse -ErrorAction SilentlyContinue
    }
}
Write-Host ""

# Step 6: Move data directories
Write-Host "[6/6] Moving data directories..." -ForegroundColor Yellow

$dataFolders = @("cache", "exports", "logs", "reports", "results")
foreach ($folder in $dataFolders) {
    if (Test-Path $folder) {
        if ($DryRun) {
            Write-Host "   Would move: $folder -> data/$folder" -ForegroundColor Gray
        } else {
            $destPath = Join-Path "data" $folder
            Remove-Item -Path $destPath -Recurse -Force -ErrorAction SilentlyContinue
            Move-Item -Path $folder -Destination $destPath -Force
            Write-Host "   ✓ Moved: $folder -> data/$folder" -ForegroundColor Green
        }
    }
}

# Config files
if (Test-Path "settings.yml.example") {
    if ($DryRun) {
        Write-Host "   Would move: settings.yml.example -> config/settings.yml.example" -ForegroundColor Gray
    } else {
        Move-Item -Path "settings.yml.example" -Destination "config/settings.yml.example" -Force
        Write-Host "   ✓ Moved: settings.yml.example" -ForegroundColor Green
    }
}
Write-Host ""

# Summary
Write-Host "===============================================================" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "  DRY RUN COMPLETE - No changes were made" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run without -DryRun to perform the migration" -ForegroundColor White
} else {
    Write-Host "  MIGRATION COMPLETE!" -ForegroundColor Green
    Write-Host "===============================================================" -ForegroundColor Cyan
    Write-Host ""
    if (-not $SkipBackup) {
        Write-Host "✓ Backup saved to: $backupDir" -ForegroundColor Cyan
    }
    Write-Host "✓ New structure created successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Update API paths in packages/api/src/server.js" -ForegroundColor White
    Write-Host "2. Create root package.json for workspace management" -ForegroundColor White
    Write-Host "3. Test the API: cd packages/api && npm start" -ForegroundColor White
    Write-Host "4. Test the UI: cd packages/ui && npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "See MIGRATION_GUIDE.md for detailed instructions" -ForegroundColor Cyan
}
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""