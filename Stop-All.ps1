# ===============================================================
# SearxNG LinkedIn Collector - Stop All Services
# ===============================================================
# Stops all running Node.js processes related to this project

[CmdletBinding()]
param()

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Stopping SearxNG LinkedIn Collector Services" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Function to kill processes by port
function Stop-ProcessOnPort {
    param([int]$Port)

    try {
        $netstat = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"

        if ($netstat) {
            foreach ($line in $netstat) {
                $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
                $pid = $parts[-1]

                if ($pid -and $pid -match '^\d+$') {
                    Write-Host "  Stopping process on port $Port (PID: $pid)..." -ForegroundColor Yellow
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-Host "  ✓ Process $pid stopped successfully" -ForegroundColor Green
                    } catch {
                        Write-Host "  ✗ Failed to stop process $pid : $_" -ForegroundColor Red
                    }
                }
            }
        } else {
            Write-Host "  No process found on port $Port" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  Error checking port $Port : $_" -ForegroundColor Red
    }
}

# Stop API Server (port 3001)
Write-Host "[1/3] Checking for API Server (port 3001)..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 3001

# Stop React UI (port 5173)
Write-Host ""
Write-Host "[2/3] Checking for React UI (port 5173)..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 5173

# Kill all Node.js processes in project directory
Write-Host ""
Write-Host "[3/3] Cleaning up orphaned Node.js processes..." -ForegroundColor Cyan

$projectPath = $PSScriptRoot
$nodeProcesses = Get-WmiObject Win32_Process -Filter "name='node.exe'" | Where-Object {
    $_.CommandLine -like "*$projectPath*"
}

if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        Write-Host "  Stopping Node.js process (PID: $($proc.ProcessId))..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
            Write-Host "  ✓ Process $($proc.ProcessId) stopped" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed to stop process $($proc.ProcessId): $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  No orphaned Node.js processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Cleanup Complete!" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All services have been stopped." -ForegroundColor White
Write-Host "You can now restart using Start-All.ps1" -ForegroundColor Yellow
Write-Host ""
