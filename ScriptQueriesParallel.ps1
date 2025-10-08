# ===============================================================
# SearxNG → LinkedIn Query Collector (Parallel Edition)
# ===============================================================
# Enhanced version with parallel execution and progress tracking

[CmdletBinding()]
param(
    [string]$SearxURL = "http://localhost:8888",
    [string]$WorkDir = "C:\SearxQueries",
    [string[]]$Keywords,
    [switch]$UseCache,
    [switch]$SkipTest,
    [switch]$OpenResults,
    [switch]$Parallel,
    [ValidateSet("CSV", "JSON", "TXT", "HTML", "ALL")]
    [string]$ExportFormat = "ALL",
    [int]$MaxRetries = 3,
    [int]$DelaySeconds = 2,
    [int]$ThrottleLimit = 5,
    [string]$ProgressFile = ""
)

# ============== CONFIGURATION ==============
$Config = @{
    SearxURL = $SearxURL
    MaxRetries = $MaxRetries
    RetryDelaySeconds = 5
    DelayBetweenQueries = $DelaySeconds
    WorkDir = $WorkDir
    ExportFormats = if ($ExportFormat -eq "ALL") { @("CSV", "JSON", "TXT", "HTML") } else { @($ExportFormat) }
    DeduplicateURLs = $true
    UseCache = $UseCache.IsPresent
    CacheExpirationHours = 24
    TimeoutSeconds = 30
    MaxResultsPerQuery = 9999
    EnablePagination = $true
    MaxPagesPerQuery = 100
    LogToFile = $true
    Parallel = $Parallel.IsPresent
    ThrottleLimit = $ThrottleLimit
    ProfileTypes = @("in/", "company/")
    ExcludePatterns = @("linkedin.com/jobs", "linkedin.com/posts")
    ProgressFile = $ProgressFile
}

# ============== INITIALIZATION ==============
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Create directory structure
$Directories = @{
    Root = $Config.WorkDir
    Logs = Join-Path $Config.WorkDir "logs"
    Results = Join-Path $Config.WorkDir "results"
    Reports = Join-Path $Config.WorkDir "reports"
    Cache = Join-Path $Config.WorkDir "cache"
    Export = Join-Path $Config.WorkDir "exports"
}

foreach ($dir in $Directories.Values) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Set-Location $Config.WorkDir

# Setup logging
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$LogFile = Join-Path $Directories.Logs "search_log_$timestamp.txt"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    if ($Config.LogToFile) {
        $logMessage | Out-File -FilePath $LogFile -Append -Encoding UTF8
    }
    Write-Host $logMessage
}

function Write-Progress {
    param([int]$Current, [int]$Total, [string]$Activity)
    if ($Config.ProgressFile) {
        $progressData = @{
            Current = $Current
            Total = $Total
            Activity = $Activity
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
        $progressData | ConvertTo-Json -Compress | Out-File -FilePath $Config.ProgressFile -Force
    }
}

# Display banner
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SearxNG LinkedIn Collector - $(if ($Config.Parallel) { 'PARALLEL' } else { 'SEQUENTIAL' }) Edition  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Log "Script started - Parallel: $($Config.Parallel), ThrottleLimit: $($Config.ThrottleLimit)"

# Statistics
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

# Thread-safe collections for parallel execution
$AllResults = [System.Collections.Concurrent.ConcurrentBag[PSCustomObject]]::new()
$SeenURLs = [System.Collections.Concurrent.ConcurrentDictionary[string, byte]]::new([StringComparer]::OrdinalIgnoreCase)
$Cache = @{}
$CacheFile = Join-Path $Directories.Cache "query_cache.json"

# Load cache
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
        Write-Log "Loaded $($Cache.Count) cached queries"
    }
    catch {
        Write-Host "[CACHE] Could not load cache: $($_.Exception.Message)`n" -ForegroundColor Yellow
    }
}

# Validate keywords
if (-not $Keywords -or $Keywords.Count -eq 0) {
    Write-Host "❌ No keywords provided. Exiting.`n" -ForegroundColor Red
    exit
}

Write-Log "Using $($Keywords.Count) keywords for search"

# ============== CONNECTION TEST ==============
if (-not $SkipTest.IsPresent) {
    Write-Host "[1/3] Testing SearxNG connection..." -ForegroundColor Yellow
    try {
        $testHeaders = @{
            'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            'Accept' = 'application/json'
        }
        $testQuery = [uri]::EscapeDataString("test")
        $null = Invoke-WebRequest -Uri "$($Config.SearxURL)/search?q=$testQuery`&format=json" -Headers $testHeaders -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "      ✓ SearxNG is accessible`n" -ForegroundColor Green
        Write-Log "SearxNG connection test successful"
    }
    catch {
        Write-Host "      ✗ Cannot access SearxNG: $($_.Exception.Message)`n" -ForegroundColor Red
        Write-Log "SearxNG connection test failed: $($_.Exception.Message)" "ERROR"
        exit
    }
}

# ============== HELPER FUNCTIONS ==============
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

function Invoke-RetryableRequest {
    param([string]$Url, [hashtable]$Headers, [int]$MaxRetries = 3)
    
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            return Invoke-WebRequest -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec $Config.TimeoutSeconds -ErrorAction Stop
        }
        catch {
            if ($attempt -eq $MaxRetries) { throw }
            Start-Sleep -Seconds ($Config.RetryDelaySeconds * $attempt)
        }
    }
}

# ============== SEARCH EXECUTION ==============
Write-Host "[2/3] Executing searches $(if ($Config.Parallel) { "in PARALLEL (max $($Config.ThrottleLimit) threads)" } else { 'SEQUENTIALLY' })..." -ForegroundColor Yellow
Write-Progress -Current 0 -Total $Keywords.Count -Activity "Starting search"

$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    'Accept' = 'application/json'
    'Accept-Language' = 'en-US,en;q=0.9'
    'Referer' = $Config.SearxURL
    'DNT' = '1'
}

# Search scriptblock
$searchScriptBlock = {
    param($keyword, $config, $headers, $cache, $logFile)
    
    $result = @{
        Keyword = $keyword
        Success = $false
        Added = 0
        Duplicates = 0
        Filtered = 0
        Cached = $false
        Error = $null
        Results = @()
    }
    
    try {
        $cacheKey = $keyword.ToLower().Trim()
        $query = "site:linkedin.com $keyword"
        
        # Check cache
        if ($config.UseCache -and $cache.ContainsKey($cacheKey)) {
            $result.Cached = $true
            $result.Results = $cache[$cacheKey].Results
            $result.Success = $true
            return $result
        }
        
        # Execute search with pagination
        $pageNum = 1
        $continueSearching = $true
        $queryResults = @()
        $emptyPageCount = 0
        $maxEmptyPages = 3  # Stop after 3 consecutive empty pages
        
        while ($continueSearching -and $pageNum -le $config.MaxPagesPerQuery) {
            $encoded = [uri]::EscapeDataString($query)
            $url = "$($config.SearxURL)/search?q=$encoded`&format=json`&pageno=$pageNum"
            
            $response = $null
            for ($attempt = 1; $attempt -le $config.MaxRetries; $attempt++) {
                try {
                    $response = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec $config.TimeoutSeconds -ErrorAction Stop
                    break
                }
                catch {
                    if ($attempt -eq $config.MaxRetries) { throw }
                    Start-Sleep -Seconds ($config.RetryDelaySeconds * $attempt)
                }
            }
            
            if ($response -and $response.StatusCode -eq 200) {
                $jsonData = $response.Content | ConvertFrom-Json
                $searchResults = $jsonData.results
                
                if ($searchResults -and $searchResults.Count -gt 0) {
                    $timestamp = [DateTime]::Now.ToString("yyyy-MM-dd HH:mm:ss")
                    $pageHasValidResults = $false
                    
                    foreach ($searchResult in $searchResults) {
                        $cleanUrl = $searchResult.url
                        $idx = $cleanUrl.IndexOf('?')
                        if ($idx -gt 0) { $cleanUrl = $cleanUrl.Substring(0, $idx) }
                        
                        # Validate URL
                        $valid = $true
                        if ($config.ProfileTypes.Count -gt 0) {
                            $matched = $false
                            foreach ($type in $config.ProfileTypes) {
                                if ($cleanUrl.IndexOf("linkedin.com/$type", [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                                    $matched = $true
                                    break
                                }
                            }
                            if (-not $matched) { $valid = $false }
                        }
                        
                        if ($valid) {
                            foreach ($pattern in $config.ExcludePatterns) {
                                if ($cleanUrl.IndexOf($pattern, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                                    $valid = $false
                                    break
                                }
                            }
                        }
                        
                        if (-not $valid) {
                            $result.Filtered++
                            continue
                        }
                        
                        $resultObject = @{
                            Keyword = $keyword
                            Title = $searchResult.title
                            URL = $cleanUrl
                            Content = if ($searchResult.content) { $searchResult.content } else { "" }
                            Engine = if ($searchResult.engine) { $searchResult.engine } else { "unknown" }
                            Score = if ($searchResult.score) { $searchResult.score } else { 0 }
                            Timestamp = $timestamp
                        }
                        
                        $queryResults += $resultObject
                        $result.Results += $resultObject
                        $pageHasValidResults = $true
                    }
                    
                    # Reset empty page counter if we got valid results
                    if ($pageHasValidResults) {
                        $emptyPageCount = 0
                    } else {
                        $emptyPageCount++
                    }
                    
                    $pageNum++
                }
                else {
                    # No results on this page
                    $emptyPageCount++
                    if ($emptyPageCount -ge $maxEmptyPages) {
                        $continueSearching = $false
                    } else {
                        $pageNum++  # Try next page
                    }
                }
            }
            else {
                $continueSearching = $false
            }
            
            # Delay between pages to avoid rate limiting
            if ($continueSearching -and $pageNum -le $config.MaxPagesPerQuery) {
                Start-Sleep -Milliseconds 1000
            }
        }
        
        $result.Success = $true
    }
    catch {
        $result.Error = $_.Exception.Message
    }
    
    return $result
}

# Execute searches
if ($Config.Parallel) {
    Write-Host "   Using parallel execution with throttle limit of $($Config.ThrottleLimit)" -ForegroundColor Cyan
    
    # Create runspace pool
    $runspacePool = [runspacefactory]::CreateRunspacePool(1, $Config.ThrottleLimit)
    $runspacePool.Open()
    
    $jobs = [System.Collections.ArrayList]::new()
    $completed = 0
    
    # Start all jobs
    foreach ($kw in $Keywords) {
        $powershell = [powershell]::Create()
        $powershell.RunspacePool = $runspacePool
        
        [void]$powershell.AddScript($searchScriptBlock)
        [void]$powershell.AddArgument($kw)
        [void]$powershell.AddArgument($Config)
        [void]$powershell.AddArgument($headers)
        [void]$powershell.AddArgument($Cache)
        [void]$powershell.AddArgument($LogFile)
        
        $jobs.Add(@{
            PowerShell = $powershell
            Handle = $powershell.BeginInvoke()
            Keyword = $kw
        }) | Out-Null
        
        $Stats.TotalQueries++
    }
    
    # Wait for completion and collect results
    while ($jobs.Count -gt 0) {
        for ($i = $jobs.Count - 1; $i -ge 0; $i--) {
            $job = $jobs[$i]
            
            if ($job.Handle.IsCompleted) {
                try {
                    $result = $job.PowerShell.EndInvoke($job.Handle)
                    $job.PowerShell.Dispose()
                    
                    $completed++
                    Write-Progress -Current $completed -Total $Keywords.Count -Activity "Processing: $($job.Keyword)"
                    
                    if ($result.Success) {
                        if ($result.Cached) {
                            Write-Host "  ✓ $($job.Keyword) [CACHED] - $($result.Results.Count) results" -ForegroundColor Magenta
                            $Stats.CachedQueries++
                        }
                        else {
                            Write-Host "  ✓ $($job.Keyword) - $($result.Results.Count) results" -ForegroundColor Green
                        }
                        
                        # Add results
                        foreach ($res in $result.Results) {
                            if ($SeenURLs.TryAdd($res.URL, 1)) {
                                $AllResults.Add([PSCustomObject]$res)
                                $result.Added++
                            }
                            else {
                                $result.Duplicates++
                                $Stats.DuplicatesSkipped++
                            }
                        }
                        
                        $Stats.SuccessfulQueries++
                        $Stats.TotalResults += $result.Added
                    }
                    else {
                        Write-Host "  ✗ $($job.Keyword) - Error: $($result.Error)" -ForegroundColor Red
                        $Stats.FailedQueries++
                        $Stats.Errors.Add("$($job.Keyword) - $($result.Error)")
                    }
                }
                catch {
                    Write-Host "  ✗ $($job.Keyword) - Exception: $($_.Exception.Message)" -ForegroundColor Red
                    $Stats.FailedQueries++
                }
                finally {
                    $jobs.RemoveAt($i)
                }
            }
        }
        
        Start-Sleep -Milliseconds 100
    }
    
    $runspacePool.Close()
    $runspacePool.Dispose()
}
else {
    # Sequential execution
    $currentQuery = 0
    foreach ($kw in $Keywords) {
        $currentQuery++
        $Stats.TotalQueries++
        
        Write-Progress -Current $currentQuery -Total $Keywords.Count -Activity "Searching: $kw"
        
        $result = & $searchScriptBlock $kw $Config $headers $Cache $LogFile
        
        if ($result.Success) {
            if ($result.Cached) {
                Write-Host "  [$currentQuery/$($Keywords.Count)] $kw [CACHED] - $($result.Results.Count) results" -ForegroundColor Magenta
                $Stats.CachedQueries++
            }
            else {
                Write-Host "  [$currentQuery/$($Keywords.Count)] $kw - $($result.Results.Count) results" -ForegroundColor Green
            }
            
            # Add results
            foreach ($res in $result.Results) {
                if ($SeenURLs.TryAdd($res.URL, 1)) {
                    $AllResults.Add([PSCustomObject]$res)
                    $result.Added++
                }
                else {
                    $result.Duplicates++
                    $Stats.DuplicatesSkipped++
                }
            }
            
            $Stats.SuccessfulQueries++
            $Stats.TotalResults += $result.Added
        }
        else {
            Write-Host "  [$currentQuery/$($Keywords.Count)] $kw - Error: $($result.Error)" -ForegroundColor Red
                        $Stats.FailedQueries++
                        $Stats.Errors.Add("${kw}: $($result.Error)")
        }
        
        if ($currentQuery -lt $Keywords.Count) {
            Start-Sleep -Seconds $Config.DelayBetweenQueries
        }
    }
}

$Stats.UniqueURLs = $AllResults.Count
$Stats.EndTime = [DateTime]::Now
$Stats.Duration = $Stats.EndTime - $Stats.StartTime

Write-Host "`n✓ Search completed in $($Stats.Duration.ToString('mm\:ss'))" -ForegroundColor Green
Write-Log "Search completed - Results: $($Stats.UniqueURLs), Duration: $($Stats.Duration.ToString('mm\:ss'))"

# ============== EXPORT RESULTS ==============
Write-Host "`n[3/3] Exporting results..." -ForegroundColor Yellow

$ExportedFiles = @()
$exportTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$allResultsList = @($AllResults)

# CSV
if ($Config.ExportFormats -contains "CSV") {
    $csvPath = Join-Path $Directories.Results "linkedin_results_$exportTimestamp.csv"
    $allResultsList | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
    Write-Host "      ✓ CSV: $csvPath" -ForegroundColor Green
    $ExportedFiles += $csvPath
}

# JSON
if ($Config.ExportFormats -contains "JSON") {
    $jsonPath = Join-Path $Directories.Results "linkedin_results_$exportTimestamp.json"
    $exportData = @{
        Metadata = @{
            Generated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            TotalResults = $Stats.UniqueURLs
            Keywords = $Keywords
            Parallel = $Config.Parallel
            ThrottleLimit = $Config.ThrottleLimit
        }
        Results = $allResultsList
        Statistics = $Stats
    }
    $exportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
    Write-Host "      ✓ JSON: $jsonPath" -ForegroundColor Green
    $ExportedFiles += $jsonPath
}

# TXT
if ($Config.ExportFormats -contains "TXT") {
    $txtPath = Join-Path $Directories.Results "linkedin_urls_$exportTimestamp.txt"
    $urls = @($allResultsList | ForEach-Object { $_.URL } | Where-Object { $_ })
    if ($urls.Count -gt 0) {
        [System.IO.File]::WriteAllLines($txtPath, $urls)
    } else {
        [System.IO.File]::WriteAllText($txtPath, "# No results found`n", [System.Text.Encoding]::UTF8)
    }
    Write-Host "      ✓ TXT: $txtPath" -ForegroundColor Green
    $ExportedFiles += $txtPath
}

# HTML
if ($Config.ExportFormats -contains "HTML") {
    $htmlPath = Join-Path $Directories.Reports "linkedin_report_$exportTimestamp.html"
    
    # Group results
    $keywordStats = $allResultsList | Group-Object -Property Keyword | 
        Select-Object @{N='Keyword';E={$_.Name}}, @{N='Count';E={$_.Count}} | 
        Sort-Object Count -Descending
    
    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.AppendLine('<!DOCTYPE html><html><head><title>LinkedIn Search Results</title>')
    [void]$sb.AppendLine('<style>body{font-family:Arial;margin:20px;background:#f5f5f5}')
    [void]$sb.AppendLine('.container{max-width:1200px;margin:0 auto;background:white;padding:30px;border-radius:10px}')
    [void]$sb.AppendLine('h1{color:#0077b5}table{width:100%;border-collapse:collapse;margin:20px 0}')
    [void]$sb.AppendLine('th{background:#0077b5;color:white;padding:12px;text-align:left}')
    [void]$sb.AppendLine('td{padding:10px;border-bottom:1px solid #ddd}tr:hover{background:#f0f8ff}')
    [void]$sb.AppendLine('a{color:#0077b5;text-decoration:none}a:hover{text-decoration:underline}')
    [void]$sb.AppendLine('.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:20px 0}')
    [void]$sb.AppendLine('.stat-box{background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:20px;border-radius:8px;text-align:center}')
    [void]$sb.AppendLine('.stat-box h3{margin:0;font-size:32px}.stat-box p{margin:5px 0 0 0}</style></head><body>')
    [void]$sb.AppendLine('<div class="container"><h1>🔍 LinkedIn Search Results</h1>')
    [void]$sb.AppendLine("<p><strong>Generated:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | <strong>Duration:</strong> $($Stats.Duration.ToString('mm\:ss')) | <strong>Mode:</strong> $(if ($Config.Parallel) { "Parallel ($($Config.ThrottleLimit) threads)" } else { 'Sequential' })</p>")
    [void]$sb.AppendLine('<div class="stats">')
    [void]$sb.AppendLine("<div class='stat-box'><h3>$($Stats.UniqueURLs)</h3><p>Unique Profiles</p></div>")
    [void]$sb.AppendLine("<div class='stat-box'><h3>$($Stats.TotalQueries)</h3><p>Total Queries</p></div>")
    [void]$sb.AppendLine("<div class='stat-box'><h3>$($Stats.SuccessfulQueries)</h3><p>Successful</p></div>")
    [void]$sb.AppendLine("<div class='stat-box'><h3>$($Stats.DuplicatesSkipped)</h3><p>Duplicates</p></div>")
    [void]$sb.AppendLine('</div><h2>📊 Results by Keyword</h2><table><tr><th>Keyword</th><th>Results</th><th>%</th></tr>')
    
    foreach ($stat in $keywordStats) {
        $percent = [math]::Round(($stat.Count / $Stats.UniqueURLs) * 100, 1)
        [void]$sb.AppendLine("<tr><td>$($stat.Keyword)</td><td>$($stat.Count)</td><td>$percent%</td></tr>")
    }
    
    [void]$sb.AppendLine('</table><h2>🔗 All Results</h2><table><tr><th>Title</th><th>URL</th><th>Keyword</th></tr>')
    foreach ($result in $allResultsList) {
        [void]$sb.AppendLine("<tr><td>$($result.Title)</td><td><a href='$($result.URL)' target='_blank'>$($result.URL)</a></td><td>$($result.Keyword)</td></tr>")
    }
    [void]$sb.AppendLine('</table></div></body></html>')
    
    [System.IO.File]::WriteAllText($htmlPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
    Write-Host "      ✓ HTML: $htmlPath" -ForegroundColor Green
    $ExportedFiles += $htmlPath
}

# Summary
Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Queries:     $($Stats.TotalQueries)" -ForegroundColor White
Write-Host "  Successful:  $($Stats.SuccessfulQueries)" -ForegroundColor Green
Write-Host "  Failed:      $($Stats.FailedQueries)" -ForegroundColor $(if ($Stats.FailedQueries -gt 0) { "Red" } else { "White" })
Write-Host "  Cached:      $($Stats.CachedQueries)" -ForegroundColor Magenta
Write-Host "  Results:     $($Stats.UniqueURLs)" -ForegroundColor Cyan
Write-Host "  Duplicates:  $($Stats.DuplicatesSkipped)" -ForegroundColor Yellow
Write-Host "  Duration:    $($Stats.Duration.ToString('mm\:ss'))" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Log "Export completed - Files: $($ExportedFiles.Count)"

# Auto-open
if ($OpenResults.IsPresent) {
    $htmlFile = $ExportedFiles | Where-Object { $_ -like "*.html" } | Select-Object -First 1
    if ($htmlFile) {
        Start-Process $htmlFile
    }
}

Write-Host "✓ Complete!`n" -ForegroundColor Green

