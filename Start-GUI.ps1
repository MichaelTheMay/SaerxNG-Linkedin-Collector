# ===============================================================
# SearxNG LinkedIn Collector - PowerShell GUI Launcher
# ===============================================================

[CmdletBinding()]
param()

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Starting SearxNG PowerShell GUI" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Join-Path $PSScriptRoot "packages\scripts\SearxQueriesUI.ps1"

if (Test-Path $scriptPath) {
    & $scriptPath
} else {
    Write-Host "ERROR: SearxQueriesUI.ps1 not found at $scriptPath" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
}

