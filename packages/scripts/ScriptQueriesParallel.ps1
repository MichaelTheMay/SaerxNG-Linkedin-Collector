# SearxNG LinkedIn Query Collector - Enhanced Edition
# Version 2.0 with real-time progress and detailed logging

[CmdletBinding()]
param(
    [string]$SearxURL = "http://localhost:8888",
    [string]$WorkDir = "C:\SearxQueries",
    [string[]]$Keywords,
    [switch]$UseCache,
    [switch]$SkipTest,
    [switch]$OpenResults,
    [switch]$Parallel,
    [string]$ExportFormat = "ALL",
    [int]$MaxRetries = 3,
    [int]$DelaySeconds = 2,
    [int]$ThrottleLimit = 5,
    [string]$ProgressFile = ""
)

# Setup
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Handle undefined or invalid ExportFormat
if (-not $ExportFormat -or $ExportFormat -eq "undefined" -or $ExportFormat -eq "") {
    $ExportFormat = "ALL"
}
if ($ExportFormat -notin @("CSV", "JSON", "TXT", "HTML", "ALL")) {
    $ExportFormat = "ALL"
}

# Handle Keywords if passed as comma-separated string
if ($Keywords.Count -eq 1 -and $Keywords[0] -like "*,*") {
    $Keywords = $Keywords[0] -split ',' | ForEach-Object { $_.Trim() }
}

# Initialize timing
$scriptStartTime = Get-Date
$sessionId = (Get-Date -Format "yyyyMMdd_HHmmss")

# Create directories
$dataDir = Join-Path $WorkDir "data"
$resultsDir = Join-Path $dataDir "results"
$reportsDir = Join-Path $dataDir "reports"
$logsDir = Join-Path $dataDir "logs"

@($dataDir, $resultsDir, $reportsDir, $logsDir) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Force -Path $_ | Out-Null
    }
}

# Initialize log file
$logFile = Join-Path $logsDir "search_log_$sessionId.txt"

# Logging functions
function Write-LogMessage {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [switch]$NoConsole
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    $logEntry | Out-File -FilePath $logFile -Append -Encoding UTF8
    
    if (-not $NoConsole) {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARNING" { "Yellow" }
            "SUCCESS" { "Green" }
            "INFO" { "White" }
            "DEBUG" { "Gray" }
            "PROGRESS" { "Cyan" }
            default { "White" }
        }
        Write-Host $logEntry -ForegroundColor $color
    }
}

function Write-ProgressUpdate {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Status,
        [string]$Details = "",
        [int]$ResultsFound = 0
    )
    
    $percentage = if ($Total -gt 0) { [math]::Round(($Current / $Total) * 100, 1) } else { 0 }
    $elapsed = (Get-Date) - $scriptStartTime
    $estimatedTotal = if ($Current -gt 0) { 
        $elapsed.TotalSeconds / $Current * $Total 
    } else { 0 }
    $remaining = [TimeSpan]::FromSeconds([math]::Max(0, $estimatedTotal - $elapsed.TotalSeconds))
    
    # Create progress object for UI consumption
    $progressData = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        sessionId = $sessionId
        current = $Current
        total = $Total
        percentage = $percentage
        status = $Status
        details = $Details
        resultsFound = $ResultsFound
        elapsed = $elapsed.ToString("mm\:ss")
        remaining = $remaining.ToString("mm\:ss")
        currentKeyword = if ($Current -le $Keywords.Count) { $Keywords[$Current - 1] } else { "" }
    }
    
    # Output as JSON for UI parsing
    Write-Host "PROGRESS::$($progressData | ConvertTo-Json -Compress)" -ForegroundColor Magenta
    
    # Also write to log
    Write-LogMessage "Progress: $Current/$Total ($percentage%) - $Status - $Details" -Level "PROGRESS" -NoConsole
    
    # Save to progress file if specified
    if ($ProgressFile) {
        $progressData | ConvertTo-Json -Compress | Out-File -FilePath $ProgressFile -Force
    }
}

# Always skip test when running from API (it's already tested by UI)
$SkipTest = $true

# Initial logging
Write-LogMessage "========================================" -Level "INFO"
Write-LogMessage "SearxNG LinkedIn Collector - Session $sessionId" -Level "INFO"
Write-LogMessage "========================================" -Level "INFO"
Write-LogMessage "Configuration:" -Level "INFO"
Write-LogMessage "  Keywords: $($Keywords.Count) items" -Level "INFO"
Write-LogMessage "  SearxNG URL: $SearxURL" -Level "INFO"
Write-LogMessage "  Work Directory: $WorkDir" -Level "INFO"
Write-LogMessage "  Export Format: $ExportFormat" -Level "INFO"
Write-LogMessage "  Max Retries: $MaxRetries" -Level "INFO"
Write-LogMessage "  Delay Between Queries: $DelaySeconds seconds" -Level "INFO"
Write-LogMessage "  Use Cache: $($UseCache.IsPresent)" -Level "INFO"
Write-LogMessage "========================================" -Level "INFO"

# Initialize search statistics
$allResults = @()
$Stats = @{
    Total = $Keywords.Count
    Processed = 0
    Successful = 0
    Failed = 0
    TotalResults = 0
    Errors = @()
    StartTime = Get-Date
}

Write-LogMessage "Starting search for $($Keywords.Count) keywords..." -Level "INFO"
Write-ProgressUpdate -Current 0 -Total $Stats.Total -Status "Initializing" -Details "Preparing to search..."

# Main search loop
$keywordIndex = 0
foreach ($keyword in $Keywords) {
    $keywordIndex++
    $Stats.Processed++
    $keywordStartTime = Get-Date
    
    Write-LogMessage "[$keywordIndex/$($Stats.Total)] Starting search for: $keyword" -Level "INFO"
    Write-ProgressUpdate -Current $keywordIndex -Total $Stats.Total -Status "Searching" -Details "Querying: $keyword" -ResultsFound $allResults.Count
    
    $retryCount = 0
    $searchSuccess = $false
    $lastError = $null
    
    while ($retryCount -lt $MaxRetries -and -not $searchSuccess) {
        try {
            if ($retryCount -gt 0) {
                Write-LogMessage "  Retry attempt $retryCount for: $keyword" -Level "WARNING"
            }
            
            $query = [uri]::EscapeDataString("site:linkedin.com $keyword")
            $url = "$SearxURL/search?q=$query&format=json"
            
            Write-LogMessage "  Query URL: $url" -Level "DEBUG"
            
            $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 30
            
            if ($response.results) {
                $resultsCount = $response.results.Count
                $Stats.Successful++
                $searchSuccess = $true
                
                Write-LogMessage "  Success! Found $resultsCount results for: $keyword" -Level "SUCCESS"
                
                # Process each result
                $resultIndex = 0
                foreach ($result in $response.results) {
                    $resultIndex++
                    
                    # Clean URL
                    $cleanUrl = $result.url
                    if ($cleanUrl -match '\?') {
                        $cleanUrl = $cleanUrl.Substring(0, $cleanUrl.IndexOf('?'))
                    }
                    
                    # Check if it's a LinkedIn URL (be more permissive)
                    $isLinkedIn = $cleanUrl -like "*linkedin.com*"
                    
                    if ($isLinkedIn) {
                        $resultObject = [PSCustomObject]@{
                            Keyword = $keyword
                            Title = $result.title
                            URL = $cleanUrl
                            Content = $result.content
                            Engine = if ($result.engine) { $result.engine } else { "unknown" }
                            Score = if ($result.score) { $result.score } else { 0 }
                            Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
                        }
                        
                        $allResults += $resultObject
                        
                        # Stream result to UI
                        $streamData = @{
                            type = "RESULT"
                            sessionId = $sessionId
                            keyword = $keyword
                            result = @{
                                title = $resultObject.Title
                                url = $resultObject.URL
                                content = $resultObject.Content
                            }
                        }
                        Write-Host "STREAM::$($streamData | ConvertTo-Json -Compress)" -ForegroundColor Blue
                    }
                    
                    # Update progress for each result processed
                    if ($resultIndex % 5 -eq 0) {
                        Write-ProgressUpdate -Current $keywordIndex -Total $Stats.Total -Status "Processing" -Details "Processing result $resultIndex of $resultsCount for: $keyword" -ResultsFound $allResults.Count
                    }
                }
                
                $profileCount = ($allResults | Where-Object { $_.Keyword -eq $keyword }).Count
                Write-LogMessage "  Processed $resultsCount results, kept $profileCount LinkedIn profiles" -Level "INFO"
                        }
                        else {
                Write-LogMessage "  No results found for: $keyword" -Level "WARNING"
                $Stats.Successful++
                $searchSuccess = $true
                    }
                }
                catch {
            $lastError = $_.Exception.Message
            $retryCount++
            
            if ($retryCount -ge $MaxRetries) {
                $Stats.Failed++
                $Stats.Errors += "$keyword : $lastError"
                Write-LogMessage "  Failed after $MaxRetries retries for: $keyword - Error: $lastError" -Level "ERROR"
                
                # Stream error to UI
                $errorData = @{
                    type = "ERROR"
                    sessionId = $sessionId
                    keyword = $keyword
                    error = $lastError
                    retryCount = $retryCount
                }
                Write-Host "STREAM::$($errorData | ConvertTo-Json -Compress)" -ForegroundColor Red
            }
            else {
                Write-LogMessage "  Error on attempt $retryCount : $lastError - Retrying..." -Level "WARNING"
                Start-Sleep -Seconds ($retryCount * 2)
            }
        }
    }
    
    # Calculate timing
    $keywordDuration = (Get-Date) - $keywordStartTime
    Write-LogMessage "  Completed $keyword in $($keywordDuration.TotalSeconds) seconds" -Level "INFO"
    
    # Delay between keywords (except for the last one)
    if ($keywordIndex -lt $Keywords.Count) {
        Write-LogMessage "  Waiting $DelaySeconds seconds before next query..." -Level "DEBUG"
        Write-ProgressUpdate -Current $keywordIndex -Total $Stats.Total -Status "Waiting" -Details "Delay before next query..." -ResultsFound $allResults.Count
        Start-Sleep -Seconds $DelaySeconds
    }
}

# Final progress update
Write-ProgressUpdate -Current $Stats.Total -Total $Stats.Total -Status "Exporting" -Details "Saving results..." -ResultsFound $allResults.Count

Write-LogMessage "========================================" -Level "INFO"
Write-LogMessage "Search phase completed. Starting export..." -Level "INFO"
Write-LogMessage "========================================" -Level "INFO"

# Export results
$exportedFiles = @()

# CSV
if ($ExportFormat -eq "ALL" -or $ExportFormat -eq "CSV") {
    Write-LogMessage "Exporting CSV format..." -Level "INFO"
    $csvPath = Join-Path $resultsDir "linkedin_results_$sessionId.csv"
    $allResults | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
    $exportedFiles += $csvPath
    Write-LogMessage "  CSV exported: $csvPath" -Level "SUCCESS"
}

# JSON
if ($ExportFormat -eq "ALL" -or $ExportFormat -eq "JSON") {
    Write-LogMessage "Exporting JSON format..." -Level "INFO"
    $jsonPath = Join-Path $resultsDir "linkedin_results_$sessionId.json"
    
    # Calculate final statistics
    $Stats.EndTime = Get-Date
    $Stats.Duration = $Stats.EndTime - $Stats.StartTime
    
    $exportData = @{
        metadata = @{
            sessionId = $sessionId
            generated = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            totalResults = $allResults.Count
            keywords = $Keywords
            searxUrl = $SearxURL
            exportFormat = $ExportFormat
        }
        statistics = @{
            totalKeywords = $Stats.Total
            processedKeywords = $Stats.Processed
            successfulSearches = $Stats.Successful
            failedSearches = $Stats.Failed
            totalResults = $allResults.Count
            uniqueProfiles = $allResults.Count
            duration = $Stats.Duration.ToString("mm\:ss")
            errors = $Stats.Errors
        }
        results = $allResults
    }
    $exportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
    $exportedFiles += $jsonPath
    Write-LogMessage "  JSON exported: $jsonPath" -Level "SUCCESS"
}

# TXT (URLs only)
if ($ExportFormat -eq "ALL" -or $ExportFormat -eq "TXT") {
    Write-LogMessage "Exporting TXT format..." -Level "INFO"
    $txtPath = Join-Path $resultsDir "linkedin_urls_$sessionId.txt"
    
    # Header
    $txtContent = @(
        "# LinkedIn Profile URLs"
        "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        "# Total URLs: $($allResults.Count)"
        "# Session: $sessionId"
        ""
    )
    
    # Group URLs by keyword
    $groupedResults = $allResults | Group-Object -Property Keyword
    foreach ($group in $groupedResults) {
        $txtContent += "# Keyword: $($group.Name) ($($group.Count) results)"
        $txtContent += $group.Group | ForEach-Object { $_.URL }
        $txtContent += ""
    }
    
    $txtContent | Out-File -FilePath $txtPath -Encoding UTF8
    $exportedFiles += $txtPath
    Write-LogMessage "  TXT exported: $txtPath" -Level "SUCCESS"
}

# Final summary
Write-LogMessage "========================================" -Level "INFO"
Write-LogMessage "FINAL SUMMARY" -Level "INFO"
Write-LogMessage "========================================" -Level "INFO"
Write-LogMessage "Session ID: $sessionId" -Level "INFO"
Write-LogMessage "Total Keywords: $($Stats.Total)" -Level "INFO"
Write-LogMessage "Processed: $($Stats.Processed)" -Level "INFO"
Write-LogMessage "Successful: $($Stats.Successful)" -Level "SUCCESS"
Write-LogMessage "Failed: $($Stats.Failed)" -Level $(if ($Stats.Failed -gt 0) { "ERROR" } else { "INFO" })
Write-LogMessage "Total Results: $($allResults.Count)" -Level "INFO"
Write-LogMessage "Unique Profiles: $($allResults.Count)" -Level "INFO"
Write-LogMessage "Duration: $($Stats.Duration.ToString('mm\:ss'))" -Level "INFO"
Write-LogMessage "========================================" -Level "INFO"

if ($Stats.Errors.Count -gt 0) {
    Write-LogMessage "ERRORS ENCOUNTERED:" -Level "ERROR"
    foreach ($error in $Stats.Errors) {
        Write-LogMessage "  - $error" -Level "ERROR"
    }
    Write-LogMessage "========================================" -Level "INFO"
}

Write-LogMessage "Exported Files:" -Level "INFO"
foreach ($file in $exportedFiles) {
    Write-LogMessage "  - $file" -Level "INFO"
}
Write-LogMessage "========================================" -Level "INFO"
Write-LogMessage "Log File: $logFile" -Level "INFO"
Write-LogMessage "========================================" -Level "INFO"

# Send completion signal to UI
$completionData = @{
    type = "COMPLETE"
    sessionId = $sessionId
    success = $true
    statistics = @{
        totalKeywords = $Stats.Total
        successful = $Stats.Successful
        failed = $Stats.Failed
        totalResults = $allResults.Count
        duration = $Stats.Duration.ToString("mm\:ss")
    }
    exportedFiles = $exportedFiles
    logFile = $logFile
}
Write-Host "COMPLETE::$($completionData | ConvertTo-Json -Compress)" -ForegroundColor Green

Write-LogMessage "Script completed successfully!" -Level "SUCCESS"
