# SearxNG LinkedIn Collector - PowerShell Scripts

Automated PowerShell scripts for collecting LinkedIn profiles via SearxNG metasearch engine.

## Available Scripts

### ScriptQueries.ps1

Main search script with sequential execution.

**Usage:**
```powershell
.\ScriptQueries.ps1 -Keywords "Stanford AI","Stanford ML" -UseCache -Verbose
```

**Parameters:**
- `-SearxURL` (string): SearxNG instance URL (default: http://localhost:8888)
- `-WorkDir` (string): Output directory (default: auto-detected root)
- `-Keywords` (string[]): Search keywords
- `-Interactive` (switch): Interactive keyword selection
- `-UseCache` (switch): Enable 24-hour result caching
- `-SkipTest` (switch): Skip SearxNG connection test
- `-OpenResults` (switch): Auto-open HTML report
- `-ExportFormat` (string): CSV, JSON, TXT, HTML, or ALL (default: ALL)
- `-MaxRetries` (int): Retry attempts (default: 3)
- `-DelaySeconds` (int): Delay between queries (default: 2)
- `-Verbose` (switch): Detailed logging

**Examples:**
```powershell
# Basic search
.\ScriptQueries.ps1 -Keywords "Stanford PhD AI"

# With all options
.\ScriptQueries.ps1 -Keywords "Stanford AI","Stanford ML" -UseCache -OpenResults -Verbose -ExportFormat "ALL"

# Interactive mode
.\ScriptQueries.ps1 -Interactive
```

### ScriptQueriesParallel.ps1

Parallel execution version for faster searches (3-5x speedup).

**Usage:**
```powershell
.\ScriptQueriesParallel.ps1 -Keywords "Stanford AI" -Parallel -ThrottleLimit 5
```

**Additional Parameters:**
- `-Parallel` (switch): Enable parallel execution
- `-ThrottleLimit` (int): Max concurrent threads (default: 5)
- `-ProgressFile` (string): Progress tracking file path

**Examples:**
```powershell
# Parallel search with 5 threads
.\ScriptQueriesParallel.ps1 -Keywords @("test1", "test2", "test3") -Parallel -ThrottleLimit 5

# With progress tracking
.\ScriptQueriesParallel.ps1 -Keywords "test" -Parallel -ProgressFile "progress.json"
```

### SearxQueriesUI.ps1

Graphical user interface for keyword management and search execution.

**Usage:**
```powershell
.\SearxQueriesUI.ps1
```

Features:
- Visual keyword editor
- File management (load/save keywords)
- Real-time progress tracking
- Integrated results viewer
- Configuration panel
- Report browser

### Generate-KeywordPermutations.ps1

Generates keyword permutations for comprehensive searches.

**Usage:**
```powershell
.\Generate-KeywordPermutations.ps1 -ExportToFile keywords.txt
.\Generate-KeywordPermutations.ps1 -Interactive
.\Generate-KeywordPermutations.ps1 -UseInSearch
```

**Parameters:**
- `-ExportToFile` (string): Export to specified file
- `-UseInSearch` (switch): Immediately run search with generated keywords
- `-Interactive` (switch): Interactive mode with options

Generates 500+ keyword combinations from:
- Institutions (Stanford, Stanford University)
- Departments (CS, Computer Science, etc.)
- Degrees (PhD, MS, BS, etc.)
- Research areas (AI, ML, NLP, etc.)
- Positions (Professor, Student, etc.)
- Labs (AI Lab, SAIL, etc.)

### Restart-SearxNG.ps1

Utility script to restart Docker-based SearxNG instance.

**Usage:**
```powershell
.\Restart-SearxNG.ps1
```

## Module: SearxHelpers.psm1

Shared helper functions used by all scripts.

**Location:** `modules/SearxHelpers.psm1`

**Functions:**
- `Format-LinkedInURL` - Clean LinkedIn URLs
- `Test-URLValid` - Validate and filter URLs
- `Get-CacheKey` - Generate cache keys
- `Import-KeywordFile` - Load keywords from file
- `Export-KeywordFile` - Save keywords to file
- `Invoke-RetryableWebRequest` - HTTP requests with retry logic

**Usage:**
```powershell
Import-Module .\modules\SearxHelpers.psm1

$cleaned = Format-LinkedInURL "https://linkedin.com/in/example?param=value"
$isValid = Test-URLValid $url
```

## Output Structure

All scripts create organized output in the `data/` directory:

```
data/
├── results/
│   ├── linkedin_results_*.csv
│   ├── linkedin_results_*.json
│   └── linkedin_urls_*.txt
├── reports/
│   └── linkedin_report_*.html
├── logs/
│   └── search_log_*.txt
└── cache/
    └── query_cache.json
```

## Configuration

Edit the `$Config` hashtable in each script or use GUI settings.

### Common Settings

```powershell
$Config = @{
    SearxURL = "http://localhost:8888"
    MaxRetries = 3
    DelayBetweenQueries = 2
    UseCache = $true
    CacheExpirationHours = 24
    EnablePagination = $true
    MaxPagesPerQuery = 100
}
```

## Troubleshooting

### "Execution Policy" Error
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Cannot find module"
```powershell
# Ensure you're in the correct directory
cd packages/scripts
# Or use absolute path for module import
```

### "SearxNG Connection Failed"
1. Check SearxNG is running: http://localhost:8888
2. Enable JSON in settings.yml
3. Verify network connectivity

### "No results found"
- Try broader keywords
- Check SearxNG search engine configuration
- Use `-Verbose` for detailed logs
- Check `data/logs/` for error messages

## Best Practices

1. **Start with Test Keywords**: Test with 1-2 keywords before running large batches
2. **Use Caching**: Enable `-UseCache` to avoid redundant searches
3. **Parallel Execution**: Use parallel script for 10+ keywords
4. **Respect Rate Limits**: Adjust `-DelaySeconds` if hitting limits
5. **Monitor Logs**: Check `data/logs/` for errors and warnings

## Performance Tips

- **Sequential**: Good for 1-10 keywords
- **Parallel (ThrottleLimit 3)**: Good for 10-50 keywords
- **Parallel (ThrottleLimit 5)**: Good for 50-200 keywords
- **Parallel (ThrottleLimit 10)**: Use cautiously for 200+ keywords

## License

MIT
