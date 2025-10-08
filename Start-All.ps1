# ===============================================================
# SearxNG LinkedIn Collector - Start All Services
# ===============================================================
# Starts both API server and React UI in separate windows
# Automatically cleans up any existing processes first

[CmdletBinding()]
param()

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Starting SearxNG LinkedIn Collector" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$scriptRoot = $PSScriptRoot

# Function to kill processes by port
function Stop-ProcessOnPort {
    param([int]$Port, [string]$ServiceName)

    try {
        $netstat = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"

        if ($netstat) {
            Write-Host "  Cleaning up existing $ServiceName process on port $Port..." -ForegroundColor Yellow
            foreach ($line in $netstat) {
                $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
                $pid = $parts[-1]

                if ($pid -and $pid -match '^\d+$') {
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-Host "  ✓ Stopped existing process (PID: $pid)" -ForegroundColor Green
                    } catch {
                        Write-Host "  ✗ Failed to stop PID $pid" -ForegroundColor Red
                    }
                }
            }
            Start-Sleep -Milliseconds 500
        }
    } catch {
        # Silently continue if error
    }
}

# Clean up existing processes
Write-Host "[Cleanup] Checking for existing processes..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 3001 -ServiceName "API Server"
Stop-ProcessOnPort -Port 5173 -ServiceName "React UI"
Write-Host ""

# Start API Server
Write-Host "[1/2] Starting API Server..." -ForegroundColor Yellow
$apiPath = Join-Path $scriptRoot "packages\api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$apiPath'; npm start"
Write-Host "✓ API Server starting in new window (port 3001)" -ForegroundColor Green

# Wait a moment for API to initialize
Start-Sleep -Seconds 2

# Start React UI
Write-Host "[2/2] Starting React UI..." -ForegroundColor Yellow
$uiPath = Join-Path $scriptRoot "packages\ui"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$uiPath'; npm run dev"
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

