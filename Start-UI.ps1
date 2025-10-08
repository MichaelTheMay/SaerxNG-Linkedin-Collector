# ===============================================================
# SearxNG LinkedIn Collector - Start React UI
# ===============================================================
# Automatically cleans up any existing Vite processes first

[CmdletBinding()]
param()

$uiPath = Join-Path $PSScriptRoot "packages\ui"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Starting SearxNG React UI" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Function to kill processes by port
function Stop-ProcessOnPort {
    param([int]$Port)

    try {
        $netstat = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"

        if ($netstat) {
            Write-Host "Cleaning up existing process on port $Port..." -ForegroundColor Yellow
            foreach ($line in $netstat) {
                $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
                $pid = $parts[-1]

                if ($pid -and $pid -match '^\d+$') {
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-Host "✓ Stopped existing process (PID: $pid)" -ForegroundColor Green
                    } catch {
                        Write-Host "✗ Failed to stop PID $pid" -ForegroundColor Red
                    }
                }
            }
            Start-Sleep -Milliseconds 500
            Write-Host ""
        }
    } catch {
        # Silently continue if error
    }
}

# Clean up port 5173
Stop-ProcessOnPort -Port 5173

Set-Location $uiPath
npm run dev

