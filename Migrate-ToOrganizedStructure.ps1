# ================================================================
# Migration Script: Organize Files into v2.1 Directory Structure
# ================================================================
# This script moves existing files from v2.0 flat structure
# into the new v2.1 organized directory structure.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\Migrate-ToOrganizedStructure.ps1
#   
# Or with custom path:
#   powershell -ExecutionPolicy Bypass -File .\Migrate-ToOrganizedStructure.ps1 -WorkDir "C:\SearxQueries"

[CmdletBinding()]
param(
    [string]$WorkDir = "C:\SearxQueries",
    [switch]$DryRun,  # Preview changes without actually moving files
    [switch]$Backup   # Create backup before moving files
)

$ErrorActionPreference = "Stop"

# Display banner
Clear-Host
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SearxNG v2.1 - File Migration Utility                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be moved`n" -ForegroundColor Yellow
}

Write-Host "Working Directory: $WorkDir`n" -ForegroundColor Gray

# Create directory structure
$Directories = @{
    Logs = Join-Path $WorkDir "logs"
    Results = Join-Path $WorkDir "results"
    Reports = Join-Path $WorkDir "reports"
    Cache = Join-Path $WorkDir "cache"
    Export = Join-Path $WorkDir "exports"
}

Write-Host "[1/4] Creating directory structure..." -ForegroundColor Yellow
foreach ($dir in $Directories.Values) {
    if (-not (Test-Path $dir)) {
        if ($DryRun) {
            Write-Host "      [DRY RUN] Would create: $dir" -ForegroundColor Gray
        }
        else {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
            Write-Host "      ✓ Created: $dir" -ForegroundColor Green
        }
    }
    else {
        Write-Host "      ℹ Already exists: $dir" -ForegroundColor Gray
    }
}

# Create backup if requested
if ($Backup -and -not $DryRun) {
    Write-Host "`n[2/4] Creating backup..." -ForegroundColor Yellow
    $backupDir = Join-Path $WorkDir "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    
    $filesToBackup = Get-ChildItem -Path $WorkDir -File -Include "*.csv","*.json","*.txt","*.html" -Exclude "*.ps1","*.md"
    foreach ($file in $filesToBackup) {
        Copy-Item $file.FullName -Destination $backupDir
    }
    Write-Host "      ✓ Backup created: $backupDir" -ForegroundColor Green
    Write-Host "      ✓ Backed up $($filesToBackup.Count) files" -ForegroundColor Green
}
else {
    Write-Host "`n[2/4] Skipping backup..." -ForegroundColor Yellow
}

# File migration mappings
$FileMigrations = @(
    @{
        Pattern = "linkedin_results_*.csv"
        Destination = $Directories.Results
        Type = "CSV Results"
    },
    @{
        Pattern = "linkedin_results_*.json"
        Destination = $Directories.Results
        Type = "JSON Results"
    },
    @{
        Pattern = "linkedin_urls_*.txt"
        Destination = $Directories.Results
        Type = "URL Lists"
    },
    @{
        Pattern = "linkedin_report_*.html"
        Destination = $Directories.Reports
        Type = "HTML Reports"
    },
    @{
        Pattern = "search_log_*.txt"
        Destination = $Directories.Logs
        Type = "Search Logs"
    },
    @{
        Pattern = "query_cache.json"
        Destination = $Directories.Cache
        Type = "Query Cache"
    },
    @{
        Pattern = "stanford_*.csv"
        Destination = $Directories.Results
        Type = "Legacy CSV"
    },
    @{
        Pattern = "stanford_*.json"
        Destination = $Directories.Results
        Type = "Legacy JSON"
    },
    @{
        Pattern = "stanford_*.txt"
        Destination = $Directories.Results
        Type = "Legacy TXT"
    }
)

# Migrate files
Write-Host "`n[3/4] Migrating files..." -ForegroundColor Yellow
$stats = @{
    TotalMoved = 0
    TotalSkipped = 0
    Errors = 0
}

foreach ($migration in $FileMigrations) {
    $files = Get-ChildItem -Path $WorkDir -File -Filter $migration.Pattern -ErrorAction SilentlyContinue
    
    if ($files.Count -gt 0) {
        Write-Host "`n  📁 $($migration.Type) ($($files.Count) files)" -ForegroundColor Cyan
        
        foreach ($file in $files) {
            $destPath = Join-Path $migration.Destination $file.Name
            
            if (Test-Path $destPath) {
                Write-Host "      ⚠ Already exists: $($file.Name)" -ForegroundColor Yellow
                $stats.TotalSkipped++
            }
            else {
                if ($DryRun) {
                    Write-Host "      [DRY RUN] Would move: $($file.Name)" -ForegroundColor Gray
                    $stats.TotalMoved++
                }
                else {
                    try {
                        Move-Item -Path $file.FullName -Destination $destPath -Force
                        Write-Host "      ✓ Moved: $($file.Name)" -ForegroundColor Green
                        $stats.TotalMoved++
                    }
                    catch {
                        Write-Host "      ✗ Error: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
                        $stats.Errors++
                    }
                }
            }
        }
    }
}

# Summary
Write-Host "`n[4/4] Migration Summary" -ForegroundColor Yellow
Write-Host "      ╔═══════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "      ║  Files Moved:    $($stats.TotalMoved.ToString().PadRight(16))║" -ForegroundColor Green
Write-Host "      ║  Files Skipped:  $($stats.TotalSkipped.ToString().PadRight(16))║" -ForegroundColor Yellow
Write-Host "      ║  Errors:         $($stats.Errors.ToString().PadRight(16))║" -ForegroundColor $(if ($stats.Errors -gt 0) { "Red" } else { "Green" })
Write-Host "      ╚═══════════════════════════════════╝" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`n💡 This was a DRY RUN. No files were actually moved." -ForegroundColor Yellow
    Write-Host "   To perform the migration, run again without -DryRun`n" -ForegroundColor Yellow
}
else {
    Write-Host "`n✅ Migration complete!" -ForegroundColor Green
    
    # Show directory structure
    Write-Host "`n📁 New Directory Structure:" -ForegroundColor Cyan
    foreach ($dir in $Directories.GetEnumerator()) {
        $fileCount = (Get-ChildItem -Path $dir.Value -File -ErrorAction SilentlyContinue).Count
        Write-Host "   $($dir.Key.PadRight(10)): $fileCount files" -ForegroundColor Gray
    }
    
    Write-Host "`n⚡ Quick Actions:" -ForegroundColor Cyan
    Write-Host "   • View results:  explorer `"$($Directories.Results)`"" -ForegroundColor White
    Write-Host "   • View reports:  explorer `"$($Directories.Reports)`"" -ForegroundColor White
    Write-Host "   • View logs:     explorer `"$($Directories.Logs)`"" -ForegroundColor White
}

Write-Host ""

