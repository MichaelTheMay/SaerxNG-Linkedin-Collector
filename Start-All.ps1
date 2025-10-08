# ===============================================================
# SearxNG LinkedIn Collector - Start All Services
# ===============================================================
# Starts both API server and React UI in separate windows

[CmdletBinding()]
param()

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Starting SearxNG LinkedIn Collector" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$scriptRoot = $PSScriptRoot

# Start API Server
Write-Host "[1/2] Starting API Server..." -ForegroundColor Yellow
$apiPath = Join-Path $scriptRoot "packages\api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$apiPath' && npm start"
Write-Host "✓ API Server starting in new window (port 3001)" -ForegroundColor Green

# Wait a moment for API to initialize
Start-Sleep -Seconds 2

# Start React UI
Write-Host "[2/2] Starting React UI..." -ForegroundColor Yellow
$uiPath = Join-Path $scriptRoot "packages\ui"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$uiPath' && npm run dev"
Write-Host "✓ React UI starting in new window (port 5173)" -ForegroundColor Green

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Services Started Successfully!" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Server:  http://localhost:3001" -ForegroundColor White
Write-Host "React UI:    http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Close the PowerShell windows to stop the services" -ForegroundColor Yellow
Write-Host ""

