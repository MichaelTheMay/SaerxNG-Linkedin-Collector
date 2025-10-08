# ===============================================================
# SearxNG LinkedIn Collector - Production Start Script
# ===============================================================

[CmdletBinding()]
param()

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  SearxNG LinkedIn Collector - Production Mode" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# Build UI
Write-Host "[1/2] Building React UI..." -ForegroundColor Yellow
Set-Location (Join-Path $rootDir "packages\ui")
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Failed to build UI" -ForegroundColor Red
    exit 1
}

Write-Host "[+] UI built successfully" -ForegroundColor Green
Write-Host ""

# Start API Server
Write-Host "[2/2] Starting API Server in production mode..." -ForegroundColor Yellow
Set-Location (Join-Path $rootDir "packages\api")

$env:NODE_ENV = "production"
npm start

