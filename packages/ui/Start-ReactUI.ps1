# ===============================================================
# SearxNG LinkedIn Collector - React UI Launcher (PowerShell)
# ===============================================================
# Run this script to start the React web interface
#
# This will:
#   1. Check if Node.js and npm are installed
#   2. Install dependencies if needed
#   3. Start the development server
#   4. Open your browser to http://localhost:5173

[CmdletBinding()]
param()

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  SearxNG LinkedIn Collector - React UI" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download and install Node.js from:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: npm is not installed!" -ForegroundColor Red
    Write-Host ""
    Read-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "✗ ERROR: Failed to install dependencies!" -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies are already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Starting React UI..." -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The development server will start at: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev
