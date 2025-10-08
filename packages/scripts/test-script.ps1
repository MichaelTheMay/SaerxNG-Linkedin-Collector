# Simple test script to validate the new monorepo structure
[CmdletBinding()]
param()

Write-Host "Testing new monorepo structure..." -ForegroundColor Green

# Test path calculation
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$packagesDir = Split-Path -Parent $scriptDir
$rootDir = Split-Path -Parent $packagesDir

Write-Host "Script directory: $scriptDir" -ForegroundColor Gray
Write-Host "Packages directory: $packagesDir" -ForegroundColor Gray
Write-Host "Root directory: $rootDir" -ForegroundColor Gray

# Test directory structure
$dataDir = Join-Path $rootDir "data"
$resultsDir = Join-Path $dataDir "results"
$reportsDir = Join-Path $dataDir "reports"
$logsDir = Join-Path $dataDir "logs"
$cacheDir = Join-Path $dataDir "cache"

Write-Host "`nTesting directory structure:" -ForegroundColor Cyan
@($dataDir, $resultsDir, $reportsDir, $logsDir, $cacheDir) | ForEach-Object {
    if (Test-Path $_) {
        Write-Host "  [+] $(Split-Path -Leaf $_)" -ForegroundColor Green
    } else {
        Write-Host "  [-] $(Split-Path -Leaf $_) - MISSING" -ForegroundColor Red
        New-Item -ItemType Directory -Force -Path $_ | Out-Null
        Write-Host "     Created directory" -ForegroundColor Yellow
    }
}

# Test PowerShell module
$modulePath = Join-Path $scriptDir "modules\SearxHelpers.psm1"
if (Test-Path $modulePath) {
    Write-Host "`n[+] SearxHelpers module found" -ForegroundColor Green
    try {
        Import-Module $modulePath -Force
        Write-Host "[+] Module imported successfully" -ForegroundColor Green
    } catch {
        Write-Host "[-] Module import failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n[-] SearxHelpers module not found: $modulePath" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green

