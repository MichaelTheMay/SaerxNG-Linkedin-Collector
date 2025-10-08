# ===============================================================
# SearxNG Restart & Test Script
# ===============================================================
# Automatically restarts SearxNG and tests JSON API access
# ===============================================================

Write-Host "`n╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           SearxNG Restart & Verification Script                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$SearxURL = "http://localhost:8888"
$DockerComposeDir = "c:\searxng"

# ============== Step 1: Check Docker ==============
Write-Host "[1/6] Checking Docker status..." -ForegroundColor Yellow

try {
    $dockerVersion = docker --version
    Write-Host "      ✓ Docker installed: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "      ✗ Docker not found or not running!" -ForegroundColor Red
    Write-Host "`nPlease install Docker Desktop and start it.`n" -ForegroundColor Yellow
    exit
}

# ============== Step 2: Find SearxNG Container ==============
Write-Host "`n[2/6] Finding SearxNG container..." -ForegroundColor Yellow

$containers = docker ps -a --format "{{.Names}}" | Select-String -Pattern "searxng"

if ($containers) {
    $containerName = $containers[0].ToString()
    Write-Host "      ✓ Found container: $containerName" -ForegroundColor Green
}
else {
    Write-Host "      ⚠ No SearxNG container found" -ForegroundColor Yellow
    Write-Host "      Attempting docker-compose restart anyway..." -ForegroundColor Yellow
    $containerName = "searxng"
}

# ============== Step 3: Restart SearxNG ==============
Write-Host "`n[3/6] Restarting SearxNG..." -ForegroundColor Yellow

try {
    # Try docker-compose restart first
    if (Test-Path "$DockerComposeDir\docker-compose.yml") {
        Push-Location $DockerComposeDir
        docker-compose restart 2>&1 | Out-Null
        Pop-Location
        Write-Host "      ✓ Restarted via docker-compose" -ForegroundColor Green
    }
    else {
        # Fall back to direct container restart
        docker restart $containerName 2>&1 | Out-Null
        Write-Host "      ✓ Restarted container: $containerName" -ForegroundColor Green
    }
}
catch {
    Write-Host "      ✗ Restart failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTry manually: docker restart $containerName`n" -ForegroundColor Yellow
    exit
}

# ============== Step 4: Wait for Startup ==============
Write-Host "`n[4/6] Waiting for SearxNG to start..." -ForegroundColor Yellow

$maxWait = 30
$waited = 0
$started = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
    
    try {
        $response = Invoke-WebRequest -Uri $SearxURL -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $started = $true
            break
        }
    }
    catch {
        # Still waiting...
    }
    
    Write-Host "`r      Waiting... $waited/$maxWait seconds" -NoNewline
}

Write-Host "`r      " -NoNewline

if ($started) {
    Write-Host "✓ SearxNG started successfully ($waited seconds)     " -ForegroundColor Green
}
else {
    Write-Host "⚠ SearxNG may not be fully ready yet ($waited seconds)" -ForegroundColor Yellow
}

# ============== Step 5: Test JSON API ==============
Write-Host "`n[5/6] Testing JSON API access..." -ForegroundColor Yellow

$testPassed = $false

try {
    $headers = @{
        'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        'Accept' = 'application/json'
    }
    
    $testQuery = [uri]::EscapeDataString("test search")
    $response = Invoke-WebRequest -Uri "$SearxURL/search?q=$testQuery`&format=json" -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        $jsonData = $response.Content | ConvertFrom-Json
        $resultCount = if ($jsonData.results) { $jsonData.results.Count } else { 0 }
        
        Write-Host "      ✓ JSON API working!" -ForegroundColor Green
        Write-Host "      ✓ Status Code: 200" -ForegroundColor Green
        Write-Host "      ✓ Test query returned $resultCount results" -ForegroundColor Green
        $testPassed = $true
    }
}
catch {
    $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.Value__ } else { "Unknown" }
    Write-Host "      ✗ JSON API test failed!" -ForegroundColor Red
    Write-Host "      ✗ Status Code: $statusCode" -ForegroundColor Red
    Write-Host "      ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    
    Write-Host "`n      Possible issues:" -ForegroundColor Yellow
    Write-Host "      1. JSON format not enabled in settings.yml" -ForegroundColor Gray
    Write-Host "      2. SearxNG still starting up (wait 30 more seconds)" -ForegroundColor Gray
    Write-Host "      3. Limiter blocking requests" -ForegroundColor Gray
    Write-Host "      4. Check logs: docker logs $containerName" -ForegroundColor Gray
}

# ============== Step 6: Verify Settings ==============
Write-Host "`n[6/6] Verifying settings..." -ForegroundColor Yellow

$settingsFile = "$DockerComposeDir\config\settings.yml"

if (Test-Path $settingsFile) {
    $formats = Get-Content $settingsFile | Select-String -Pattern "^\s*- (html|json|csv|rss)" | ForEach-Object { $_.Line.Trim() }
    
    Write-Host "      Enabled formats in settings.yml:" -ForegroundColor Gray
    foreach ($format in $formats) {
        $formatName = $format -replace '^\s*-\s*', ''
        if ($formatName -eq "json") {
            Write-Host "        ✓ $formatName" -ForegroundColor Green
        }
        else {
            Write-Host "        • $formatName" -ForegroundColor Gray
        }
    }
    
    $limiter = Get-Content $settingsFile | Select-String -Pattern "limiter:\s*(true|false)" | Select-Object -First 1
    if ($limiter -match "false") {
        Write-Host "      ✓ Limiter: disabled" -ForegroundColor Green
    }
    else {
        Write-Host "      ⚠ Limiter: enabled (may cause issues)" -ForegroundColor Yellow
    }
}
else {
    Write-Host "      ⚠ Settings file not found at: $settingsFile" -ForegroundColor Yellow
}

# ============== Summary ==============
Write-Host "`n╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                           SUMMARY                                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if ($testPassed) {
    Write-Host "  ✅ SearxNG is running and JSON API is accessible!`n" -ForegroundColor Green
    
    Write-Host "  🚀 Ready to run the LinkedIn collector script:" -ForegroundColor Cyan
    Write-Host "     cd C:\SearxQueries" -ForegroundColor White
    Write-Host "     .\ScriptQueries.ps1 -Interactive`n" -ForegroundColor White
    
    Write-Host "  📖 Or try these examples:" -ForegroundColor Cyan
    Write-Host "     # Quick search with defaults" -ForegroundColor Gray
    Write-Host "     .\ScriptQueries.ps1" -ForegroundColor White
    Write-Host "" 
    Write-Host "     # Custom keywords with caching" -ForegroundColor Gray
    Write-Host "     .\ScriptQueries.ps1 -Keywords `"AI Research`",`"ML Engineer`" -UseCache -OpenResults" -ForegroundColor White
    Write-Host ""
    
    Write-Host "  📚 Documentation:" -ForegroundColor Cyan
    Write-Host "     • README.md - Full guide" -ForegroundColor Gray
    Write-Host "     • EXAMPLES.ps1 - 25+ examples" -ForegroundColor Gray
    Write-Host "     • WHATS_NEW.md - Feature overview`n" -ForegroundColor Gray
}
else {
    Write-Host "  ❌ JSON API test failed. Troubleshooting needed.`n" -ForegroundColor Red
    
    Write-Host "  🔧 Try these steps:" -ForegroundColor Yellow
    Write-Host "     1. Wait 30 seconds and run this script again" -ForegroundColor White
    Write-Host "     2. Check SearxNG logs:" -ForegroundColor White
    Write-Host "        docker logs $containerName" -ForegroundColor Gray
    Write-Host "     3. Verify settings.yml has JSON format enabled:" -ForegroundColor White
    Write-Host "        notepad $settingsFile" -ForegroundColor Gray
    Write-Host "     4. Try accessing SearxNG in browser:" -ForegroundColor White
    Write-Host "        start $SearxURL" -ForegroundColor Gray
    Write-Host "     5. Check if Docker container is healthy:" -ForegroundColor White
    Write-Host "        docker ps" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  📖 More help: RESTART_GUIDE.md`n" -ForegroundColor Cyan
}

# ============== Quick Actions ==============
Write-Host "  ⚡ Quick actions:" -ForegroundColor Cyan
Write-Host "     • View logs:        " -NoNewline -ForegroundColor Gray
Write-Host "docker logs $containerName" -ForegroundColor White
Write-Host "     • Open SearxNG:     " -NoNewline -ForegroundColor Gray
Write-Host "start $SearxURL" -ForegroundColor White
Write-Host "     • Check containers: " -NoNewline -ForegroundColor Gray
Write-Host "docker ps" -ForegroundColor White
Write-Host "     • Run script:       " -NoNewline -ForegroundColor Gray
Write-Host "cd C:\SearxQueries; .\ScriptQueries.ps1 -Interactive" -ForegroundColor White

Write-Host "`n"

