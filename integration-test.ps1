# ===============================================================
# SearxNG LinkedIn Collector - Integration Test Script
# ===============================================================
# Comprehensive end-to-end test of the monorepo system

[CmdletBinding()]
param(
    [switch]$SkipSearxNGTest
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SearxNG LinkedIn Collector" -ForegroundColor Cyan
Write-Host "  Integration Test Suite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Errors = @()
}

function Test-Component {
    param([string]$Name, [scriptblock]$TestBlock, [string]$Description = "")

    $testResults.Total++
    Write-Host "[$($testResults.Total.ToString().PadLeft(2))] Testing $Name..." -NoNewline -ForegroundColor Yellow

    if ($Description) {
        Write-Host " ($Description)" -ForegroundColor Gray -NoNewline
    } else {
        Write-Host "" -NoNewline
    }

    try {
        $result = & $TestBlock
        if ($result) {
            Write-Host " PASS" -ForegroundColor Green
            $testResults.Passed++
            return $true
        } else {
            Write-Host " FAIL" -ForegroundColor Red
            $testResults.Failed++
            return $false
        }
    }
    catch {
        Write-Host " ERROR" -ForegroundColor Red
        $testResults.Failed++
        $testResults.Errors += "$Name`: $($_.Exception.Message)"
        return $false
    }
}

# Test 1: Directory Structure
Test-Component "Directory Structure" {
    $rootDir = $PSScriptRoot
    $dataDir = Join-Path $rootDir "data"
    $packagesDir = Join-Path $rootDir "packages"
    $apiDir = Join-Path $packagesDir "api"
    $uiDir = Join-Path $packagesDir "ui"
    $scriptsDir = Join-Path $packagesDir "scripts"
    $sharedDir = Join-Path $rootDir "shared"

    @($dataDir, $packagesDir, $apiDir, $uiDir, $scriptsDir, $sharedDir) | ForEach-Object {
        if (-not (Test-Path $_)) { return $false }
    }

    # Test data subdirectories
    @("results", "reports", "logs", "cache", "exports") | ForEach-Object {
        $subDir = Join-Path $dataDir $_
        if (-not (Test-Path $subDir)) { return $false }
    }

    return $true
} "Root, packages, data, and subdirectories"

# Test 2: Package Files
Test-Component "Package Files" {
    $apiPackage = Join-Path $PSScriptRoot "packages\api\package.json"
    $uiPackage = Join-Path $PSScriptRoot "packages\ui\package.json"
    $rootPackage = Join-Path $PSScriptRoot "package.json"

    @($apiPackage, $uiPackage, $rootPackage) | ForEach-Object {
        if (-not (Test-Path $_)) { return $false }
    }

    # Validate package.json content
    try {
        $rootPkg = Get-Content $rootPackage -Raw | ConvertFrom-Json
        if (-not $rootPkg.workspaces) { return $false }
        if ($rootPkg.workspaces -notcontains "packages/api" -or $rootPkg.workspaces -notcontains "packages/ui") { return $false }
    } catch {
        return $false
    }

    return $true
} "package.json files and workspace configuration"

# Test 3: API Server Configuration
Test-Component "API Server Configuration" {
    $serverJs = Join-Path $PSScriptRoot "packages\api\src\server.js"
    $apiPackage = Join-Path $PSScriptRoot "packages\api\package.json"

    if (-not (Test-Path $serverJs) -or -not (Test-Path $apiPackage)) { return $false }

    # Check that package.json points to correct main file
    $pkg = Get-Content $apiPackage -Raw | ConvertFrom-Json
    if ($pkg.main -ne "src/server.js") { return $false }

    # Check that server.js contains expected path configuration
    $serverContent = Get-Content $serverJs -Raw
    if ($serverContent -notmatch "packages/scripts" -or $serverContent -notmatch "resultsDir.*join.*data.*results") { return $false }

    return $true
} "API server paths and package configuration"

# Test 4: PowerShell Scripts Configuration
Test-Component "PowerShell Scripts Configuration" {
    $scriptQueries = Join-Path $PSScriptRoot "packages\scripts\ScriptQueries.ps1"
    $scriptParallel = Join-Path $PSScriptRoot "packages\scripts\ScriptQueriesParallel.ps1"
    $modulePath = Join-Path $PSScriptRoot "packages\scripts\modules\SearxHelpers.psm1"

    if (-not (Test-Path $scriptQueries) -or -not (Test-Path $scriptParallel) -or -not (Test-Path $modulePath)) { return $false }

    # Test module import
    try {
        Import-Module $modulePath -Force -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
} "Script files and module imports"

# Test 5: Launcher Scripts
Test-Component "Launcher Scripts" {
    $startAll = Join-Path $PSScriptRoot "Start-All.ps1"
    $startApi = Join-Path $PSScriptRoot "Start-API.ps1"
    $startUi = Join-Path $PSScriptRoot "Start-UI.ps1"

    @($startAll, $startApi, $startUi) | ForEach-Object {
        if (-not (Test-Path $_)) { return $false }
    }

    return $true
} "Root launcher scripts"

# Test 6: API Server Start
Test-Component "API Server Startup" {
    # Start API server in background
    $apiProcess = Start-Process powershell -ArgumentList "-Command", "cd '$PSScriptRoot\packages\api'; npm start" -PassThru -WindowStyle Hidden

    # Wait for startup
    Start-Sleep -Seconds 3

    # Test API endpoint
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/reports" -Method GET -TimeoutSec 5
        $apiProcess | Stop-Process -Force -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    } catch {
        $apiProcess | Stop-Process -Force -ErrorAction SilentlyContinue
        return $false
    }
} "API server starts and responds"

# Test 7: React UI Start
Test-Component "React UI Startup" {
    # Start UI in background
    $uiProcess = Start-Process powershell -ArgumentList "-Command", "cd '$PSScriptRoot\packages\ui'; npm run dev" -PassThru -WindowStyle Hidden

    # Wait for startup
    Start-Sleep -Seconds 5

    # Test UI endpoint
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
        $uiProcess | Stop-Process -Force -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    } catch {
        $uiProcess | Stop-Process -Force -ErrorAction SilentlyContinue
        return $false
    }
} "React UI starts and serves content"

# Test 8: Shared Types
Test-Component "Shared Types" {
    $typesFile = Join-Path $PSScriptRoot "shared\types.ts"
    $readmeFile = Join-Path $PSScriptRoot "shared\README.md"

    if (-not (Test-Path $typesFile) -or -not (Test-Path $readmeFile)) { return $false }

    # Check that types.ts contains expected interfaces
    $typesContent = Get-Content $typesFile -Raw
    if ($typesContent -notmatch "interface SearchParams" -or $typesContent -notmatch "interface SearchResult") { return $false }

    return $true
} "TypeScript types and documentation"

# Test 9: Documentation
Test-Component "Documentation" {
    $readme = Join-Path $PSScriptRoot "README.md"
    $newStructure = Join-Path $PSScriptRoot "NEW-STRUCTURE.md"
    $migrationGuide = Join-Path $PSScriptRoot "MIGRATION_GUIDE.md"

    @($readme, $newStructure, $migrationGuide) | ForEach-Object {
        if (-not (Test-Path $_)) { return $false }
    }

    return $true
} "Updated documentation files"

# Test 10: Git Configuration
Test-Component "Git Configuration" {
    $gitignore = Join-Path $PSScriptRoot ".gitignore"

    if (-not (Test-Path $gitignore)) { return $false }

    # Check that .gitignore contains expected patterns
    $gitignoreContent = Get-Content $gitignore -Raw
    if ($gitignoreContent -notmatch "data/cache/\*" -or $gitignoreContent -notmatch "node_modules") { return $false }

    # Check .gitkeep files
    @("cache", "exports", "logs", "reports", "results") | ForEach-Object {
        $gitkeep = Join-Path $PSScriptRoot "data\$_/.gitkeep"
        if (-not (Test-Path $gitkeep)) { return $false }
    }

    return $true
} ".gitignore and .gitkeep files"

# Test Results Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Integration Test Results" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Tests: $($testResults.Total)" -ForegroundColor White
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor Red

if ($testResults.Errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($error in $testResults.Errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

Write-Host ""

if ($testResults.Failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! Monorepo migration successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run '.\Start-All.ps1' to start the full application" -ForegroundColor White
    Write-Host "  2. Access React UI at http://localhost:5173" -ForegroundColor White
    Write-Host "  3. API server runs at http://localhost:3001" -ForegroundColor White
    Write-Host "  4. Test a search to verify end-to-end functionality" -ForegroundColor White
} else {
    Write-Host "❌ Some tests failed. Please review the errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  - Check that Node.js and npm are installed" -ForegroundColor White
    Write-Host "  - Run 'npm run install:all' to install dependencies" -ForegroundColor White
    Write-Host "  - Ensure no other services are using ports 3001 or 5173" -ForegroundColor White
    Write-Host "  - Check PowerShell execution policy: Set-ExecutionPolicy RemoteSigned" -ForegroundColor White
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

