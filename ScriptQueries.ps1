# ===============================================================
# SearxNG → LinkedIn Query Collector (Professional Edition)
# ===============================================================
# Example run command:
#   powershell -ExecutionPolicy Bypass -File .\ScriptQueries.ps1 -SearxURL "http://localhost:8888" -WorkDir "C:\SearxQueries" -ExportFormat "ALL" -UseCache -OpenResults -Verbose
#
#   # To use custom keywords:
#   powershell -ExecutionPolicy Bypass -File .\ScriptQueries.ps1 -Keywords "Stanford AI","Stanford Robotics" -ExportFormat "CSV"
#
#   # To use interactive keyword selection:
#   powershell -ExecutionPolicy Bypass -File .\ScriptQueries.ps1 -Interactive

[CmdletBinding()]
param(
    [string]$SearxURL = "http://localhost:8888",
    [string]$WorkDir = "C:\SearxQueries",
    [string[]]$Keywords,
    [switch]$Interactive,
    [switch]$UseCache,
    [switch]$SkipTest,
    [switch]$OpenResults,
    [ValidateSet("CSV", "JSON", "TXT", "HTML", "ALL")]
    [string]$ExportFormat = "ALL",
    [int]$MaxRetries = 3,
    [int]$DelaySeconds = 2
)

# ============== CONFIGURATION ==============
$Config = @{
    # SearxNG settings
    SearxURL = $SearxURL
    
    # Default search keywords - comprehensive permutations
    DefaultKeywords = @(
        # Core Stanford CS variations
        "Stanford Computer Science",
        "Stanford CS",
        "Stanford University Computer Science",
        "Stanford CompSci",
        "Stanford Comp Sci",
        
        # Degree + Department combinations
        "Stanford PhD Computer Science",
        "Stanford Ph.D. CS",
        "Stanford MS Computer Science",
        "Stanford M.S. CS",
        "Stanford BS Computer Science",
        "Stanford B.S. CS",
        
        # AI variations
        "Stanford Artificial Intelligence",
        "Stanford AI",
        "Stanford AI Lab",
        "Stanford SAIL",
        
        # ML variations
        "Stanford Machine Learning",
        "Stanford ML",
        
        # Research areas with abbreviations
        "Stanford Natural Language Processing",
        "Stanford NLP",
        "Stanford Computer Vision",
        "Stanford CV",
        "Stanford Deep Learning",
        "Stanford DL",
        "Stanford Robotics",
        "Stanford HCI",
        "Stanford Human-Computer Interaction",
        
        # Data Science
        "Stanford Data Science",
        "Stanford Data Scientist",
        
        # Research positions
        "Stanford Research Scientist",
        "Stanford CS Researcher",
        "Stanford Postdoc Computer Science",
        "Stanford Postdoc CS",
        
        # Faculty variations
        "Stanford Professor Computer Science",
        "Stanford Prof Computer Science",
        "Stanford CS Professor",
        "Stanford Faculty Computer Science",
        
        # Student variations
        "Stanford PhD Student CS",
        "Stanford Graduate Student CS",
        "Stanford Grad Student Computer Science",
        "Stanford Doctoral Student Computer Science",
        
        # Advanced research areas
        "Stanford Reinforcement Learning",
        "Stanford RL",
        "Stanford Generative AI",
        "Stanford Large Language Models",
        "Stanford LLM",
        
        # Lab affiliations
        "Stanford NLP Group",
        "Stanford Vision Lab",
        "Stanford Graphics Lab",
        "Stanford Systems Group",
        
        # Cross-disciplinary
        "Stanford Computational Biology",
        "Stanford Bioinformatics",
        "Stanford Medical AI",
        "Stanford HAI",
        "Stanford Human-Centered AI",
        
        # Combined high-value terms
        "Stanford PhD AI ML",
        "Stanford CS Research Scientist",
        "Stanford University AI Researcher"
    )
    
    # Filter settings
    ProfileTypes = @("in/", "company/")  # Filter for: personal profiles and/or companies
    ExcludePatterns = @("linkedin.com/jobs", "linkedin.com/posts")  # URLs to exclude
    
    # Retry settings
    MaxRetries = $MaxRetries
    RetryDelaySeconds = 5
    
    # Rate limiting
    DelayBetweenQueries = $DelaySeconds
    
    # Output settings
    WorkDir = $WorkDir
    ExportFormats = if ($ExportFormat -eq "ALL") { @("CSV", "JSON", "TXT", "HTML") } else { @($ExportFormat) }
    DeduplicateURLs = $true
    
    # Cache settings
    UseCache = $UseCache.IsPresent
    CacheExpirationHours = 24
    
    # Advanced settings
    TimeoutSeconds = 30
    MaxResultsPerQuery = 9999  # Maximum results to fetch per query (set high to get all)
    EnablePagination = $true   # Enable pagination to fetch all results
    MaxPagesPerQuery = 100     # Maximum pages to fetch per query
    LogToFile = $true
}

# ============== INITIALIZATION ==============
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Create organized directory structure
$Directories = @{
    Root = $Config.WorkDir
    Logs = Join-Path $Config.WorkDir "logs"
    Results = Join-Path $Config.WorkDir "results"
    Reports = Join-Path $Config.WorkDir "reports"
    Cache = Join-Path $Config.WorkDir "cache"
    Export = Join-Path $Config.WorkDir "exports"
}

# Create all directories
foreach ($dir in $Directories.Values) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Set-Location $Config.WorkDir

# Setup logging with organized path
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$LogFile = Join-Path $Directories.Logs "search_log_$timestamp.txt"
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    if ($Config.LogToFile) {
        $logMessage | Out-File -FilePath $LogFile -Append -Encoding UTF8
    }
    if ($VerbosePreference -eq 'Continue' -or $Level -eq "ERROR") {
        Write-Host $logMessage -ForegroundColor $(
            switch ($Level) {
                "ERROR" { "Red" }
                "WARN" { "Yellow" }
                "SUCCESS" { "Green" }
                default { "Gray" }
            }
        )
    }
}

# Display banner
Clear-Host
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SearxNG LinkedIn Collector - Professional Edition v2.1   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📁 Directory Structure:" -ForegroundColor Cyan
Write-Host "   Root:    $($Directories.Root)" -ForegroundColor Gray
Write-Host "   ├─ logs/       (search logs)" -ForegroundColor Gray
Write-Host "   ├─ results/    (CSV, JSON, TXT)" -ForegroundColor Gray
Write-Host "   ├─ reports/    (HTML reports)" -ForegroundColor Gray
Write-Host "   ├─ cache/      (query cache)" -ForegroundColor Gray
Write-Host "   └─ exports/    (custom exports)" -ForegroundColor Gray
Write-Host ""

Write-Log "Script started with parameters: SearxURL=$SearxURL, WorkDir=$WorkDir, UseCache=$($Config.UseCache)"
Write-Log "Directory structure created: logs, results, reports, cache, exports"

# Statistics tracking
$Stats = @{
    StartTime = [DateTime]::Now
    TotalQueries = 0
    SuccessfulQueries = 0
    FailedQueries = 0
    CachedQueries = 0
    TotalResults = 0
    UniqueURLs = 0
    DuplicatesSkipped = 0
    Errors = [System.Collections.Generic.List[string]]::new()
}

$AllResults = [System.Collections.Generic.List[PSCustomObject]]::new()
$SeenURLs = [System.Collections.Generic.HashSet[string]]::new()
$Cache = @{}
$CacheFile = Join-Path $Directories.Cache "query_cache.json"

# Load cache if enabled
if ($Config.UseCache -and (Test-Path $CacheFile)) {
    try {
        $cacheData = Get-Content $CacheFile -Raw | ConvertFrom-Json
        foreach ($item in $cacheData.PSObject.Properties) {
            $cacheAge = (Get-Date) - [DateTime]$item.Value.Timestamp
            if ($cacheAge.TotalHours -lt $Config.CacheExpirationHours) {
                $Cache[$item.Name] = $item.Value
            }
        }
        Write-Host "[CACHE] Loaded $($Cache.Count) cached queries`n" -ForegroundColor Magenta
        Write-Log "Loaded $($Cache.Count) cached queries from $CacheFile"
    }
    catch {
        Write-Host "[CACHE] Could not load cache: $($_.Exception.Message)`n" -ForegroundColor Yellow
        Write-Log "Cache load failed: $($_.Exception.Message)" "WARN"
    }
}

# ============== KEYWORD SELECTION ==============
if ($Interactive.IsPresent) {
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  INTERACTIVE MODE - Select Keywords" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Write-Host "Available keywords:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $Config.DefaultKeywords.Count; $i++) {
        Write-Host "  [$($i+1)] $($Config.DefaultKeywords[$i])" -ForegroundColor White
    }
    Write-Host "  [A] All keywords" -ForegroundColor Green
    Write-Host "  [C] Custom keywords`n" -ForegroundColor Cyan
    
    $selection = Read-Host "Enter selection (comma-separated numbers, A, or C)"
    
    if ($selection -eq "A" -or $selection -eq "a") {
        $Keywords = $Config.DefaultKeywords
    }
    elseif ($selection -eq "C" -or $selection -eq "c") {
        Write-Host "`nEnter keywords (one per line, empty line to finish):" -ForegroundColor Yellow
        $Keywords = @()
        while ($true) {
            $kw = Read-Host "Keyword"
            if ([string]::IsNullOrWhiteSpace($kw)) { break }
            $Keywords += $kw.Trim()
        }
    }
    else {
        $Keywords = @()
        $indices = $selection -split ',' | ForEach-Object { $_.Trim() }
        foreach ($idx in $indices) {
            if ($idx -match '^\d+$') {
                $i = [int]$idx - 1
                if ($i -ge 0 -and $i -lt $Config.DefaultKeywords.Count) {
                    $Keywords += $Config.DefaultKeywords[$i]
                }
            }
        }
    }
    Write-Host ""
}
elseif ($Keywords -and $Keywords.Count -gt 0) {
    # Use keywords from command line
    Write-Host "[CONFIG] Using $($Keywords.Count) keywords from command line`n" -ForegroundColor Cyan
}
else {
    # Use default keywords
    $Keywords = $Config.DefaultKeywords
    Write-Host "[CONFIG] Using $($Keywords.Count) default keywords`n" -ForegroundColor Cyan
}

if ($Keywords.Count -eq 0) {
    Write-Host "❌ No keywords selected. Exiting.`n" -ForegroundColor Red
    exit
}

Write-Log "Selected $($Keywords.Count) keywords for search"

# ============== CONNECTION TEST ==============
if (-not $SkipTest.IsPresent) {
    Write-Host "[1/8] Testing SearxNG connection..." -ForegroundColor Yellow
    try {
        $testHeaders = @{
            'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            'Accept' = 'application/json'
        }
        $testQuery = [uri]::EscapeDataString("test")
        $null = Invoke-WebRequest -Uri "$($Config.SearxURL)/search?q=$testQuery`&format=json" -Headers $testHeaders -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "      ✓ SearxNG is accessible at $($Config.SearxURL)`n" -ForegroundColor Green
        Write-Log "SearxNG connection test successful" "SUCCESS"
    }
    catch {
        Write-Host "      ✗ Cannot access SearxNG JSON API`n" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
        Write-Log "SearxNG connection test failed: $($_.Exception.Message)" "ERROR"
        
        Write-Host "Troubleshooting steps:" -ForegroundColor Cyan
        Write-Host "  1. Check if running: $($Config.SearxURL)" -ForegroundColor Gray
        Write-Host "  2. Enable JSON in settings.yml: formats: ['html', 'json']" -ForegroundColor Gray
        Write-Host "  3. Disable limiter in settings.yml if needed" -ForegroundColor Gray
        Write-Host "  4. Check logs: docker logs searxng`n" -ForegroundColor Gray
        
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') { exit }
        Write-Host ""
    }
}
else {
    Write-Host "[1/8] Skipping connection test...`n" -ForegroundColor Yellow
}

# ============== HELPER FUNCTIONS ==============
function Show-ProgressBar {
    param([int]$Current, [int]$Total, [string]$Activity)
    $percent = [math]::Round(($Current / $Total) * 100)
    $completed = [math]::Floor($percent / 2)
    Write-Host ("`r  [" + ("█" * $completed) + ("░" * (50 - $completed)) + "] $percent% - $Activity") -NoNewline -ForegroundColor Cyan
}

function Invoke-RetryableRequest {
    param(
        [string]$Url,
        [hashtable]$Headers,
        [int]$MaxRetries = 3
    )
    
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec $Config.TimeoutSeconds -ErrorAction Stop
            return $response
        }
        catch {
            if ($attempt -eq $MaxRetries) {
                throw $_
            }
            Write-Log "Retry $attempt/$MaxRetries after error: $($_.Exception.Message)" "WARN"
            Start-Sleep -Seconds ($Config.RetryDelaySeconds * $attempt)
        }
    }
}

function Format-LinkedInURL {
    param([string]$Url)
    $idx = $Url.IndexOf('?')
    if ($idx -gt 0) { return $Url.Substring(0, $idx) }
    return $Url
}

function Test-URLValid {
    param([string]$Url)
    if ($Config.ProfileTypes.Count -gt 0) {
        $matched = $false
        foreach ($type in $Config.ProfileTypes) {
            if ($Url.IndexOf("linkedin.com/$type", [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $matched = $true
                break
            }
        }
        if (-not $matched) { return $false }
    }
    foreach ($pattern in $Config.ExcludePatterns) {
        if ($Url.IndexOf($pattern, [StringComparison]::OrdinalIgnoreCase) -ge 0) { return $false }
    }
    return $true
}

function Get-CacheKey {
    param([string]$Keyword)
    return $Keyword.ToLower().Trim()
}

# ============== SEARCH EXECUTION ==============
Write-Host "[2/8] Executing searches..." -ForegroundColor Yellow
Write-Host "      Keywords: $($Keywords.Count) | Max retries: $($Config.MaxRetries) | Cache: $($Config.UseCache)`n" -ForegroundColor Gray

$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    'Accept' = 'application/json'
    'Accept-Language' = 'en-US,en;q=0.9'
    'Referer' = $Config.SearxURL
    'DNT' = '1'
}

$currentQuery = 0
foreach ($kw in $Keywords) {
    $currentQuery++
    $Stats.TotalQueries++
    
    $cacheKey = Get-CacheKey -Keyword $kw
    $query = "site:linkedin.com $kw"
    
    Show-ProgressBar -Current $currentQuery -Total $Keywords.Count -Activity "Searching: $kw"
    
    # Check cache
    if ($Config.UseCache -and $Cache.ContainsKey($cacheKey)) {
        $cachedResults = $Cache[$cacheKey].Results
        Write-Host "`n  [$currentQuery/$($Keywords.Count)] $query [CACHED]" -ForegroundColor Magenta
        $addedFromCache = 0
        foreach ($result in $cachedResults) {
            if ($SeenURLs.Add($result.URL)) {
                $AllResults.Add([PSCustomObject]$result)
                $addedFromCache++
            } else {
                $Stats.DuplicatesSkipped++
            }
        }
        Write-Host "      ✓ Loaded: $addedFromCache results from cache" -ForegroundColor Magenta
        $Stats.CachedQueries++
        continue
    }
    
    # Execute search with pagination
    Write-Host "`n  [$currentQuery/$($Keywords.Count)] " -NoNewline -ForegroundColor Cyan
    Write-Host "$query" -ForegroundColor White
    Write-Log "Executing query: $query"
    
    $addedCount = 0
    $duplicateCount = 0
    $filteredCount = 0
    $queryResults = @()
    $pageNum = 1
    $continueSearching = $true
    $totalPagesChecked = 0
    $emptyPageCount = 0
    $maxEmptyPages = 3  # Stop after 3 consecutive empty pages
    
    try {
        # Pagination loop - continue until no more results or max pages reached
        while ($continueSearching -and $pageNum -le $Config.MaxPagesPerQuery) {
            $encoded = [uri]::EscapeDataString($query)
            $url = "$($Config.SearxURL)/search?q=$encoded`&format=json`&pageno=$pageNum"
            
            if ($pageNum -gt 1) {
                Write-Host "      → Page $pageNum..." -NoNewline -ForegroundColor Gray
            }
            
            $response = Invoke-RetryableRequest -Url $url -Headers $headers -MaxRetries $Config.MaxRetries
            
            if ($response.StatusCode -eq 200) {
                $jsonData = $response.Content | ConvertFrom-Json
                $results = $jsonData.results
                $totalPagesChecked++
                
                if ($results -and $results.Count -gt 0) {
                    $pageAddedCount = 0
                    $pageDuplicateCount = 0
                    $pageHasValidResults = $false
                    
                    $timestamp = [DateTime]::Now.ToString("yyyy-MM-dd HH:mm:ss")
                    foreach ($result in $results) {
                        $cleanUrl = Format-LinkedInURL -Url $result.url
                        if (-not (Test-URLValid -Url $cleanUrl)) {
                            $filteredCount++
                            continue
                        }
                        $resultObject = @{
                            Keyword = $kw
                            Title = $result.title
                            URL = $cleanUrl
                            Content = if ($result.content) { $result.content } else { "" }
                            Engine = if ($result.engine) { $result.engine } else { "unknown" }
                            Score = if ($result.score) { $result.score } else { 0 }
                            Timestamp = $timestamp
                        }
                        $queryResults += $resultObject
                        if ($Config.DeduplicateURLs) {
                            if ($SeenURLs.Add($cleanUrl)) {
                                $AllResults.Add([PSCustomObject]$resultObject)
                                $addedCount++
                                $pageAddedCount++
                                $pageHasValidResults = $true
                            } else {
                                $duplicateCount++
                                $pageDuplicateCount++
                                $Stats.DuplicatesSkipped++
                            }
                        } else {
                            $AllResults.Add([PSCustomObject]$resultObject)
                            $addedCount++
                            $pageAddedCount++
                            $pageHasValidResults = $true
                        }
                    }
                    
                    if ($pageNum -gt 1) {
                        if ($pageAddedCount -gt 0) {
                            Write-Host " +$pageAddedCount" -ForegroundColor Green
                        } else {
                            Write-Host " (all dupes)" -ForegroundColor Yellow
                        }
                    }
                    
                    # Reset empty page counter if we got valid results
                    if ($pageHasValidResults) {
                        $emptyPageCount = 0
                    } else {
                        $emptyPageCount++
                        if ($emptyPageCount -ge $maxEmptyPages) {
                            $continueSearching = $false
                        }
                    }
                    
                    # Check if we've hit the max results limit
                    if ($addedCount -ge $Config.MaxResultsPerQuery) {
                        Write-Log "Reached MaxResultsPerQuery limit ($($Config.MaxResultsPerQuery))" "INFO"
                        $continueSearching = $false
                    }
                    
                    if ($continueSearching) {
                        $pageNum++
                    }
                }
                else {
                    # No results on this page
                    $emptyPageCount++
                    if ($pageNum -gt 1) {
                        Write-Host " (empty)" -ForegroundColor Gray
                    }
                    
                    if ($emptyPageCount -ge $maxEmptyPages) {
                        Write-Log "Stopped after $maxEmptyPages consecutive empty pages" "INFO"
                        $continueSearching = $false
                    } else {
                        $pageNum++  # Try next page
                    }
                }
            }
            else {
                Write-Host "      ✗ HTTP $($response.StatusCode) on page $pageNum" -ForegroundColor Red
                $continueSearching = $false
            }
            
            # Delay between pages to avoid rate limiting
            if ($continueSearching -and $pageNum -le $Config.MaxPagesPerQuery) {
                Start-Sleep -Milliseconds 1000
            }
        }
        
        # Cache results
        if ($Config.UseCache -and $queryResults.Count -gt 0) {
            $Cache[$cacheKey] = @{
                Results = $queryResults
                Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            }
        }
        
        $Stats.TotalResults += $addedCount
        
        if ($addedCount -gt 0) {
            Write-Host "      ✓ Added: $addedCount" -NoNewline -ForegroundColor Green
            Write-Host " from $totalPagesChecked page(s)" -NoNewline -ForegroundColor Cyan
            if ($duplicateCount -gt 0) {
                Write-Host " | Duplicates: $duplicateCount" -NoNewline -ForegroundColor Yellow
            }
            if ($filteredCount -gt 0) {
                Write-Host " | Filtered: $filteredCount" -NoNewline -ForegroundColor Gray
            }
            Write-Host ""
            $Stats.SuccessfulQueries++
            Write-Log "Query successful: $addedCount results added from $totalPagesChecked pages" "SUCCESS"
        }
        else {
            Write-Host "      ⚠ No results" -ForegroundColor Yellow
            $Stats.SuccessfulQueries++
            Write-Log "Query returned no results" "WARN"
        }
    }
    catch {
        Write-Host "      ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        $Stats.FailedQueries++
        $errorMsg = "Query '$kw': $($_.Exception.Message)"
        $Stats.Errors.Add($errorMsg)
        Write-Log $errorMsg "ERROR"
    }
    
    # Rate limiting
    if ($currentQuery -lt $Keywords.Count) {
        Start-Sleep -Seconds $Config.DelayBetweenQueries
    }
}

Write-Host ""  # Clear progress bar

# Save cache
if ($Config.UseCache -and $Cache.Count -gt 0) {
    try {
        $Cache | ConvertTo-Json -Depth 10 | Out-File -FilePath $CacheFile -Encoding UTF8
        Write-Log "Saved $($Cache.Count) queries to cache"
    }
    catch {
        Write-Log "Failed to save cache: $($_.Exception.Message)" "WARN"
    }
}

$Stats.UniqueURLs = $AllResults.Count
$Stats.EndTime = [DateTime]::Now
$Stats.Duration = $Stats.EndTime - $Stats.StartTime

# ============== DATA ANALYSIS ==============
Write-Host "[3/8] Analyzing results..." -ForegroundColor Yellow

# Top keywords by results
$keywordStats = $AllResults | Group-Object -Property Keyword | 
    Select-Object @{N='Keyword';E={$_.Name}}, @{N='Count';E={$_.Count}} | 
    Sort-Object Count -Descending

# Top engines
$engineStats = $AllResults | Group-Object -Property Engine | 
    Select-Object @{N='Engine';E={$_.Name}}, @{N='Count';E={$_.Count}} | 
    Sort-Object Count -Descending

Write-Host "      ✓ Grouped by keyword: $($keywordStats.Count) keywords" -ForegroundColor Green
Write-Host "      ✓ Grouped by engine: $($engineStats.Count) engines" -ForegroundColor Green

# ============== EXPORT RESULTS ==============
Write-Host "`n[4/8] Exporting results..." -ForegroundColor Yellow

$ExportedFiles = @()
$exportTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Export CSV
if ($Config.ExportFormats -contains "CSV") {
    $csvPath = Join-Path $Directories.Results "linkedin_results_$exportTimestamp.csv"
    $AllResults | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
    Write-Host "      ✓ CSV: $csvPath" -ForegroundColor Green
    $ExportedFiles += $csvPath
    Write-Log "Exported CSV: $csvPath" "SUCCESS"
}

# Export JSON
if ($Config.ExportFormats -contains "JSON") {
    $jsonPath = Join-Path $Directories.Results "linkedin_results_$exportTimestamp.json"
    $exportData = @{
        Metadata = @{
            Generated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            TotalResults = $AllResults.Count
            Keywords = $Keywords
            SearxURL = $Config.SearxURL
        }
        Results = $AllResults
        Statistics = $Stats
    }
    $exportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
    Write-Host "      ✓ JSON: $jsonPath" -ForegroundColor Green
    $ExportedFiles += $jsonPath
    Write-Log "Exported JSON: $jsonPath" "SUCCESS"
}

# Export TXT (URLs only)
if ($Config.ExportFormats -contains "TXT") {
    $txtPath = Join-Path $Directories.Results "linkedin_urls_$exportTimestamp.txt"
    $urls = @($AllResults | ForEach-Object { $_.URL } | Where-Object { $_ })
    if ($urls.Count -gt 0) {
        [System.IO.File]::WriteAllLines($txtPath, $urls)
    } else {
        [System.IO.File]::WriteAllText($txtPath, "# No results found`n", [System.Text.Encoding]::UTF8)
    }
    Write-Host "      ✓ TXT: $txtPath" -ForegroundColor Green
    $ExportedFiles += $txtPath
    Write-Log "Exported TXT: $txtPath" "SUCCESS"
}

# Export HTML Report
if ($Config.ExportFormats -contains "HTML") {
    $htmlPath = Join-Path $Directories.Reports "linkedin_report_$exportTimestamp.html"
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>LinkedIn Search Results - $(Get-Date -Format 'yyyy-MM-dd')</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #0077b5; border-bottom: 3px solid #0077b5; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-box h3 { margin: 0; font-size: 32px; }
        .stat-box p { margin: 5px 0 0 0; opacity: 0.9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #0077b5; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        tr:hover { background: #f0f8ff; }
        a { color: #0077b5; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .keyword { display: inline-block; background: #e7f3ff; color: #0066cc; padding: 3px 8px; border-radius: 3px; font-size: 12px; margin-right: 5px; }
        .engine { display: inline-block; background: #f0f0f0; color: #666; padding: 3px 8px; border-radius: 3px; font-size: 11px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 LinkedIn Search Results</h1>
        <p><strong>Generated:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | <strong>Duration:</strong> $($Stats.Duration.ToString('mm\:ss'))</p>
        
        <div class="stats">
            <div class="stat-box">
                <h3>$($Stats.UniqueURLs)</h3>
                <p>Unique Profiles</p>
            </div>
            <div class="stat-box">
                <h3>$($Stats.TotalQueries)</h3>
                <p>Total Queries</p>
            </div>
            <div class="stat-box">
                <h3>$($Stats.SuccessfulQueries)</h3>
                <p>Successful</p>
            </div>
            <div class="stat-box">
                <h3>$($Stats.DuplicatesSkipped)</h3>
                <p>Duplicates Removed</p>
            </div>
        </div>
        
        <h2>📊 Results by Keyword</h2>
        <table>
            <tr><th>Keyword</th><th>Results</th><th>Percentage</th></tr>
"@
    
    $sb = [System.Text.StringBuilder]::new($html)
    foreach ($stat in $keywordStats) {
        $percent = [math]::Round(($stat.Count / $Stats.UniqueURLs) * 100, 1)
        [void]$sb.AppendLine("<tr><td>$($stat.Keyword)</td><td>$($stat.Count)</td><td>$percent%</td></tr>")
    }
    [void]$sb.AppendLine("</table><h2>🔗 All Results</h2><table><tr><th>Title</th><th>URL</th><th>Keyword</th><th>Engine</th></tr>")
    foreach ($result in $AllResults) {
        [void]$sb.AppendLine("<tr><td>$($result.Title)</td><td><a href='$($result.URL)' target='_blank'>$($result.URL)</a></td><td><span class='keyword'>$($result.Keyword)</span></td><td><span class='engine'>$($result.Engine)</span></td></tr>")
    }
    $html = $sb.ToString()
    
    [void]$sb.AppendLine("</table><div class='footer'><p>Generated by SearxNG LinkedIn Collector Professional Edition v2.0</p></div></div></body></html>")
    [System.IO.File]::WriteAllText($htmlPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
    Write-Host "      ✓ HTML: $htmlPath" -ForegroundColor Green
    $ExportedFiles += $htmlPath
    Write-Log "Exported HTML: $htmlPath" "SUCCESS"
}

# ============== STATISTICS REPORT ==============
Write-Host "`n[5/8] Statistics Summary" -ForegroundColor Yellow
Write-Host "      ╔═══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "      ║  Queries:     $($Stats.TotalQueries.ToString().PadRight(24))║" -ForegroundColor Cyan
Write-Host "      ║  Successful:  $($Stats.SuccessfulQueries.ToString().PadRight(24))║" -ForegroundColor Green
Write-Host "      ║  Failed:      $($Stats.FailedQueries.ToString().PadRight(24))║" -ForegroundColor $(if ($Stats.FailedQueries -gt 0) { "Red" } else { "Cyan" })
Write-Host "      ║  Cached:      $($Stats.CachedQueries.ToString().PadRight(24))║" -ForegroundColor Magenta
Write-Host "      ║  Unique URLs: $($Stats.UniqueURLs.ToString().PadRight(24))║" -ForegroundColor Cyan
Write-Host "      ║  Duplicates:  $($Stats.DuplicatesSkipped.ToString().PadRight(24))║" -ForegroundColor Yellow
Write-Host "      ║  Duration:    $($Stats.Duration.ToString('mm\:ss').PadRight(24))║" -ForegroundColor Cyan
Write-Host "      ╚═══════════════════════════════════════╝" -ForegroundColor Cyan

Write-Log "Statistics - Queries: $($Stats.TotalQueries), Successful: $($Stats.SuccessfulQueries), Results: $($Stats.UniqueURLs), Duration: $($Stats.Duration.ToString('mm\:ss'))" "SUCCESS"

# ============== TOP PERFORMERS ==============
Write-Host "`n[6/8] Top Performers" -ForegroundColor Yellow

Write-Host "`n      🏆 Top 5 Keywords by Results:" -ForegroundColor Cyan
$top5Keywords = $keywordStats | Select-Object -First 5
foreach ($stat in $top5Keywords) {
    $percent = [math]::Round(($stat.Count / $Stats.UniqueURLs) * 100, 1)
    $bar = "█" * [math]::Min([math]::Floor($percent / 2), 50)
    Write-Host "         $($stat.Keyword.PadRight(40)) " -NoNewline -ForegroundColor White
    Write-Host "$($stat.Count.ToString().PadLeft(3)) " -NoNewline -ForegroundColor Green
    Write-Host "($percent%) " -NoNewline -ForegroundColor Gray
    Write-Host "$bar" -ForegroundColor Cyan
}

Write-Host "`n      🌐 Search Engines Used:" -ForegroundColor Cyan
foreach ($stat in $engineStats) {
    Write-Host "         $($stat.Engine.PadRight(20)): $($stat.Count)" -ForegroundColor White
}

# ============== ERROR REPORT ==============
Write-Host "`n[7/8] Error Report" -ForegroundColor Yellow
if ($Stats.Errors.Count -gt 0) {
    Write-Host "      ⚠ $($Stats.Errors.Count) errors encountered:" -ForegroundColor Red
    foreach ($errMsg in $Stats.Errors | Select-Object -First 5) {
        Write-Host "         • $errMsg" -ForegroundColor Red
    }
    if ($Stats.Errors.Count -gt 5) {
        Write-Host "         ... and $($Stats.Errors.Count - 5) more (see log file)" -ForegroundColor Yellow
    }
}
else {
    Write-Host "      ✓ No errors encountered!" -ForegroundColor Green
}

# ============== COMPLETION ==============
Write-Host "`n[8/8] " -NoNewline -ForegroundColor Yellow
Write-Host "✓ Complete!`n" -ForegroundColor Green

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📁 EXPORTED FILES (Organized by Type)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Organize files by directory
$filesByDir = $ExportedFiles | Group-Object { Split-Path -Parent $_ }

foreach ($group in $filesByDir) {
    $dirName = Split-Path -Leaf $group.Name
    Write-Host "`n  📂 $dirName/" -ForegroundColor Yellow
    foreach ($file in $group.Group) {
        $fileInfo = Get-Item $file
        $sizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
        Write-Host "     • " -NoNewline -ForegroundColor White
        Write-Host "$([System.IO.Path]::GetFileName($file))" -NoNewline -ForegroundColor Cyan
        Write-Host " ($sizeKB KB)" -ForegroundColor Gray
    }
}

Write-Host "`n  📂 logs/" -ForegroundColor Yellow
Write-Host "     • " -NoNewline -ForegroundColor White
Write-Host "$(Split-Path -Leaf $LogFile)" -ForegroundColor Cyan

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ⚡ QUICK ACTIONS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

$csvFile = $ExportedFiles | Where-Object { $_ -like "*.csv" } | Select-Object -First 1
$htmlFile = $ExportedFiles | Where-Object { $_ -like "*.html" } | Select-Object -First 1

Write-Host "`n  📄 Open Files:" -ForegroundColor Cyan
if ($csvFile) {
    Write-Host "     • CSV:     " -NoNewline -ForegroundColor Gray
    Write-Host "notepad `"$csvFile`"" -ForegroundColor White
}
if ($htmlFile) {
    Write-Host "     • Report:  " -NoNewline -ForegroundColor Gray
    Write-Host "start `"$htmlFile`"" -ForegroundColor White
}
Write-Host "     • Log:     " -NoNewline -ForegroundColor Gray
Write-Host "notepad `"$LogFile`"" -ForegroundColor White

Write-Host "`n  📂 Open Folders:" -ForegroundColor Cyan
Write-Host "     • Root:    " -NoNewline -ForegroundColor Gray
Write-Host "explorer `"$($Directories.Root)`"" -ForegroundColor White
Write-Host "     • Results: " -NoNewline -ForegroundColor Gray
Write-Host "explorer `"$($Directories.Results)`"" -ForegroundColor White
Write-Host "     • Reports: " -NoNewline -ForegroundColor Gray
Write-Host "explorer `"$($Directories.Reports)`"" -ForegroundColor White
Write-Host "     • Logs:    " -NoNewline -ForegroundColor Gray
Write-Host "explorer `"$($Directories.Logs)`"" -ForegroundColor White

Write-Log "Script completed successfully. Total results: $($Stats.UniqueURLs)" "SUCCESS"

# Auto-open results if requested
if ($OpenResults.IsPresent -and $htmlFile) {
    Write-Host "`n[AUTO-OPEN] Opening HTML report..." -ForegroundColor Magenta
    Start-Process $htmlFile
}

Write-Host "`n"
