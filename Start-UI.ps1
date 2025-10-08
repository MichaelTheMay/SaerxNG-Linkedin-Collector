# ===============================================================
# SearxNG LinkedIn Collector - Start React UI
# ===============================================================

[CmdletBinding()]
param()

$uiPath = Join-Path $PSScriptRoot "packages\ui"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Starting SearxNG React UI" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $uiPath
npm run dev

