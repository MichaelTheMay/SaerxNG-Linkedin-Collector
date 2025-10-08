# SearxNG LinkedIn Collector - Connection Diagnostic Script
# This script helps diagnose and fix connection issues between components

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  SearxNG Connection Diagnostic Tool" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# 1. Check if Docker is running
Write-Host "[1/7] Checking Docker..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "  ✓ Docker is installed: $dockerVersion" -ForegroundColor Green

        # Check if Docker daemon is running
        $dockerPs = docker ps 2>&1
        if ($dockerPs -notmatch "error") {
            Write-Host "  ✓ Docker daemon is running" -ForegroundColor Green
            $dockerRunning = $true
        } else {
            Write-Host "  ✗ Docker daemon is not running" -ForegroundColor Red
            $errors += "Docker daemon is not running. Start Docker Desktop."
        }
    }
} catch {
    Write-Host "  ✗ Docker is not installed or not in PATH" -ForegroundColor Red
    $errors += "Docker is not installed. Please install Docker Desktop."
}

# 2. Check SearxNG container
Write-Host "`n[2/7] Checking SearxNG container..." -ForegroundColor Yellow
if ($dockerRunning) {
    $searxContainer = docker ps --filter "name=searxng" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    if ($searxContainer -match "searxng") {
        Write-Host "  ✓ SearxNG container is running" -ForegroundColor Green
        Write-Host "  Container details:" -ForegroundColor Gray
        $searxContainer | Out-String | Write-Host -ForegroundColor Gray
    } else {
        Write-Host "  ✗ SearxNG container is not running" -ForegroundColor Red
        $errors += "SearxNG container is not running. Run: docker-compose up -d searxng"

        # Check if container exists but is stopped
        $stoppedContainer = docker ps -a --filter "name=searxng" --format "{{.Names}}" 2>$null
        if ($stoppedContainer -match "searxng") {
            Write-Host "  ! Container exists but is stopped. Run: docker start searxng" -ForegroundColor Yellow
            $warnings += "SearxNG container exists but is stopped"
        }
    }
}

# 3. Test SearxNG connectivity
Write-Host "`n[3/7] Testing SearxNG connectivity..." -ForegroundColor Yellow
$searxUrls = @(
    "http://localhost:8888",
    "http://127.0.0.1:8888",
    "http://172.17.0.2:8080"
)

$searxWorking = $false
foreach ($url in $searxUrls) {
    Write-Host "  Testing $url..." -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri "$url/search?q=test&format=json" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "    ✓ Connected successfully!" -ForegroundColor Green
            $searxWorking = $true

            # Parse JSON response
            $json = $response.Content | ConvertFrom-Json
            if ($json.results) {
                Write-Host "    ✓ JSON API is working (found $($json.results.Count) results)" -ForegroundColor Green
            }
            break
        }
    } catch {
        Write-Host "    ✗ Failed: $_" -ForegroundColor Red
    }
}

if (-not $searxWorking) {
    $errors += "Cannot connect to SearxNG on any URL. Check Docker port mapping."
}

# 4. Check Node.js installation
Write-Host "`n[4/7] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "  ✓ Node.js is installed: $nodeVersion" -ForegroundColor Green

        # Check version requirements
        $versionNum = [version]($nodeVersion -replace 'v', '')
        if ($versionNum.Major -lt 14) {
            Write-Host "  ! Node.js version is too old. Please upgrade to v14+" -ForegroundColor Yellow
            $warnings += "Node.js version is too old (requires v14+)"
        }
    }
} catch {
    Write-Host "  ✗ Node.js is not installed" -ForegroundColor Red
    $errors += "Node.js is not installed. Download from https://nodejs.org"
}

# 5. Check API server
Write-Host "`n[5/7] Checking API server..." -ForegroundColor Yellow
$apiPort = 3001
$apiRunning = $false

# Check if port is listening
$netstat = netstat -an | Select-String ":$apiPort.*LISTENING"
if ($netstat) {
    Write-Host "  ✓ API server port $apiPort is listening" -ForegroundColor Green

    # Test API endpoint
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:$apiPort/api/health" -TimeoutSec 5 -ErrorAction Stop
        if ($apiResponse.StatusCode -eq 200) {
            Write-Host "  ✓ API server is responding" -ForegroundColor Green
            $apiRunning = $true

            $health = $apiResponse.Content | ConvertFrom-Json
            Write-Host "  Health status: $($health.overall.status)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ✗ API server not responding: $_" -ForegroundColor Red
        $warnings += "Port 3001 is listening but API is not responding"
    }
} else {
    Write-Host "  ✗ API server is not running (port $apiPort not listening)" -ForegroundColor Red
    $errors += "API server is not running. Run: .\Start-API.ps1"
}

# 6. Check React UI
Write-Host "`n[6/7] Checking React UI..." -ForegroundColor Yellow
$uiPort = 5173

$netstat = netstat -an | Select-String ":$uiPort.*LISTENING"
if ($netstat) {
    Write-Host "  ✓ React UI port $uiPort is listening" -ForegroundColor Green

    # Test UI endpoint
    try {
        $uiResponse = Invoke-WebRequest -Uri "http://localhost:$uiPort" -TimeoutSec 5 -ErrorAction Stop
        if ($uiResponse.StatusCode -eq 200) {
            Write-Host "  ✓ React UI is responding" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✗ React UI not responding: $_" -ForegroundColor Red
        $warnings += "Port 5173 is listening but UI is not responding"
    }
} else {
    Write-Host "  ✗ React UI is not running (port $uiPort not listening)" -ForegroundColor Red
    $errors += "React UI is not running. Run: .\Start-UI.ps1"
}

# 7. Test complete chain
Write-Host "`n[7/7] Testing complete connection chain..." -ForegroundColor Yellow
if ($apiRunning -and $searxWorking) {
    try {
        $body = @{ searxUrl = "http://localhost:8888" } | ConvertTo-Json
        $testResponse = Invoke-RestMethod -Uri "http://localhost:$apiPort/api/test-connection" `
            -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop

        if ($testResponse.success) {
            Write-Host "  ✓ Complete chain is working!" -ForegroundColor Green
            Write-Host "  Connected to: $($testResponse.details.connectedUrl)" -ForegroundColor Gray
        } else {
            Write-Host "  ✗ Connection test failed: $($testResponse.error)" -ForegroundColor Red
            $errors += "API cannot connect to SearxNG"
        }
    } catch {
        Write-Host "  ✗ Failed to test connection: $_" -ForegroundColor Red
        $errors += "Failed to test complete connection chain"
    }
} else {
    Write-Host "  ⚠ Skipping chain test (prerequisites not met)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  Diagnostic Summary" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "✅ All components are working correctly!" -ForegroundColor Green
    Write-Host "`nYou can now:" -ForegroundColor White
    Write-Host "  • Open the UI at: http://localhost:5173" -ForegroundColor White
    Write-Host "  • Or use the PowerShell scripts directly" -ForegroundColor White
} else {
    Write-Host "❌ Found $($errors.Count) error(s):" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  • $error" -ForegroundColor Red
    }

    Write-Host "`n📝 Recommended fixes:" -ForegroundColor Yellow
    Write-Host "  1. Run .\Start-All.ps1 to start all services" -ForegroundColor White
    Write-Host "  2. Or start services individually:" -ForegroundColor White
    Write-Host "     - docker-compose up -d searxng" -ForegroundColor Gray
    Write-Host "     - .\Start-API.ps1" -ForegroundColor Gray
    Write-Host "     - .\Start-UI.ps1" -ForegroundColor Gray
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠ Warnings:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  • $warning" -ForegroundColor Yellow
    }
}

Write-Host "`n======================================`n" -ForegroundColor Cyan