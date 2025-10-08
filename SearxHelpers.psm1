# ===============================================================
# SearxNG Helper Functions Module - Optimized
# ===============================================================
# Shared optimized functions for SearxNG scripts
# Import: Import-Module .\SearxHelpers.psm1

# Fast URL cleaning - removes query parameters
function Format-LinkedInURL {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Url)
    $idx = $Url.IndexOf('?')
    if ($idx -gt 0) { return $Url.Substring(0, $idx) }
    return $Url
}

# Fast URL validation using IndexOf instead of regex
function Test-URLValid {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Url,
        [string[]]$ProfileTypes = @("in/", "company/"),
        [string[]]$ExcludePatterns = @("linkedin.com/jobs", "linkedin.com/posts")
    )
    
    if ($ProfileTypes.Count -gt 0) {
        $matched = $false
        foreach ($type in $ProfileTypes) {
            if ($Url.IndexOf("linkedin.com/$type", [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $matched = $true
                break
            }
        }
        if (-not $matched) { return $false }
    }
    
    foreach ($pattern in $ExcludePatterns) {
        if ($Url.IndexOf($pattern, [StringComparison]::OrdinalIgnoreCase) -ge 0) { return $false }
    }
    
    return $true
}

# Optimized cache key generation
function Get-CacheKey {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Keyword)
    return $Keyword.ToLowerInvariant().Trim()
}

# Fast file loading with optimized filtering
function Import-KeywordFile {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Path)
    
    if (-not (Test-Path $Path)) {
        throw "File not found: $Path"
    }
    
    return [System.IO.File]::ReadAllLines($Path) | 
        Where-Object { $_ -and -not $_.TrimStart().StartsWith('#') } |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ }
}

# Fast file saving
function Export-KeywordFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string[]]$Keywords,
        [switch]$IncludeHeader
    )
    
    if ($IncludeHeader) {
        $header = @(
            "# Generated Keywords - $([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))",
            "# Total Keywords: $($Keywords.Count)",
            ""
        )
        [System.IO.File]::WriteAllLines($Path, ($header + $Keywords))
    } else {
        [System.IO.File]::WriteAllLines($Path, $Keywords)
    }
}

# Optimized retry logic with exponential backoff
function Invoke-RetryableWebRequest {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Uri,
        [hashtable]$Headers = @{},
        [int]$MaxRetries = 3,
        [int]$InitialDelaySeconds = 5,
        [int]$TimeoutSeconds = 30
    )
    
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            return Invoke-WebRequest -Uri $Uri -Headers $Headers -UseBasicParsing -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        }
        catch {
            if ($attempt -eq $MaxRetries) { throw }
            Start-Sleep -Seconds ($InitialDelaySeconds * $attempt)
        }
    }
}

# Fast progress bar rendering
function Show-OptimizedProgress {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][int]$Current,
        [Parameter(Mandatory)][int]$Total,
        [Parameter(Mandatory)][string]$Activity
    )
    
    $percent = [math]::Round(($Current / $Total) * 100)
    $completed = [math]::Floor($percent / 2)
    Write-Host ("`r  [" + ("█" * $completed) + ("░" * (50 - $completed)) + "] $percent% - $Activity") -NoNewline -ForegroundColor Cyan
}

# Optimized logger with minimal overhead
function Write-OptimizedLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Message,
        [Parameter(Mandatory)][string]$LogFile,
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS")]
        [string]$Level = "INFO",
        [switch]$ToConsole
    )
    
    $logMessage = "[$([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))] [$Level] $Message"
    [System.IO.File]::AppendAllText($LogFile, "$logMessage`r`n")
    
    if ($ToConsole) {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            default { "Gray" }
        }
        Write-Host $logMessage -ForegroundColor $color
    }
}

# Optimized hashtable/hashset deduplication
function New-FastHashSet {
    [CmdletBinding()]
    param([string[]]$InitialItems = @())
    
    $set = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach ($item in $InitialItems) {
        [void]$set.Add($item)
    }
    return $set
}

# Fast directory structure creation
function Initialize-WorkspaceStructure {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$RootPath)
    
    $directories = @{
        Root = $RootPath
        Logs = [System.IO.Path]::Combine($RootPath, "logs")
        Results = [System.IO.Path]::Combine($RootPath, "results")
        Reports = [System.IO.Path]::Combine($RootPath, "reports")
        Cache = [System.IO.Path]::Combine($RootPath, "cache")
        Exports = [System.IO.Path]::Combine($RootPath, "exports")
    }
    
    foreach ($dir in $directories.Values) {
        if (-not (Test-Path $dir)) {
            [void][System.IO.Directory]::CreateDirectory($dir)
        }
    }
    
    return $directories
}

# Export all functions
Export-ModuleMember -Function @(
    'Format-LinkedInURL',
    'Test-URLValid',
    'Get-CacheKey',
    'Import-KeywordFile',
    'Export-KeywordFile',
    'Invoke-RetryableWebRequest',
    'Show-OptimizedProgress',
    'Write-OptimizedLog',
    'New-FastHashSet',
    'Initialize-WorkspaceStructure'
)

