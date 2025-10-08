# ===============================================================
# SearxNG LinkedIn Collector - Start API Server
# ===============================================================

[CmdletBinding()]
param()

$apiPath = Join-Path $PSScriptRoot "packages\api"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Starting SearxNG API Server" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $apiPath
npm start