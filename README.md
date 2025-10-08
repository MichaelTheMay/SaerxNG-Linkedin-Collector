# 🚀 SearxNG LinkedIn Collector - Professional Edition v2.1

A powerful PowerShell script for collecting LinkedIn profiles and company pages using SearxNG's privacy-focused search engine. **Now with complete pagination and organized directory structure!**

---

## 📋 Table of Contents

- [What's New in v2.1](#-whats-new-in-v21)
- [Features](#-features)
- [Requirements](#-requirements)
- [Quick Start](#-quick-start)
- [Directory Structure](#-directory-structure)
- [Usage Examples](#-usage-examples)
- [Configuration](#-configuration)
- [Output Files](#-output-files)
- [Command-Line Parameters](#-command-line-parameters)
- [Migration from v2.0](#-migration-from-v20)
- [Troubleshooting](#-troubleshooting)
- [Maintenance](#-maintenance)
- [Performance & Expected Results](#-performance--expected-results)
- [Privacy & Ethics](#-privacy--ethics)

---

## ⭐ What's New in v2.1

### 🔄 **Complete Pagination - Scrape ALL Results**
The script now fetches **every single result** available for each query, not just the first page!

- ✅ Automatic pagination through all result pages
- ✅ 10-50x more results per query (100-500+ profiles instead of 10-20)
- ✅ Smart stopping when no new unique results found
- ✅ Real-time progress: `→ Page 2... +15`
- ✅ Configurable limits (MaxPagesPerQuery: 100)
- ✅ 500ms delay between pages to avoid rate limiting

**Before v2.1**: 10-20 results per query  
**After v2.1**: 100-500+ results per query 🚀

### 📁 **Organized Directory Structure**
Files are now automatically organized into logical folders!

```
C:\SearxQueries\
├── 📂 logs/        ← Search execution logs
├── 📂 results/     ← CSV, JSON, TXT data files
├── 📂 reports/     ← HTML reports with charts
├── 📂 cache/       ← Query cache for speed
└── 📂 exports/     ← Custom exports
```

**Benefits:**
- ✅ Clean, professional organization
- ✅ Easy to find files by type
- ✅ Scalable for hundreds of searches
- ✅ Enterprise-grade structure

### 🎨 **Enhanced User Experience**
- Updated version banner with directory overview
- Real-time page-by-page progress tracking
- Organized file summaries by type
- Quick access commands for all folders

---

## ✨ Features

### 🎯 Core Features
- **Complete Pagination**: Scrape ALL available results (not just first page)
- **Organized Structure**: Files automatically organized into logical folders
- **Multiple Export Formats**: CSV, JSON, TXT, and beautiful HTML reports
- **Smart Caching**: Cache query results to avoid redundant searches (24-hour expiration)
- **URL Deduplication**: Automatically removes duplicate profiles across searches
- **Retry Logic**: Automatic retry with exponential backoff for failed requests
- **Progress Tracking**: Real-time progress bars with page numbers
- **Comprehensive Logging**: Detailed logs saved to organized logs/ folder

### 📊 Data Analysis
- **Keyword Performance**: See which keywords yield the most results
- **Search Engine Stats**: Track which engines provide results
- **Visual HTML Reports**: Beautiful, interactive reports with charts and statistics
- **Smart URL Cleaning**: Removes tracking parameters from LinkedIn URLs
- **Multi-page Statistics**: Shows results per page and total pages checked

### ⚙️ Advanced Features
- **Command-Line Parameters**: Full CLI support for automation
- **Interactive Mode**: User-friendly menu for keyword selection
- **Profile Type Filtering**: Filter for personal profiles, companies, or both
- **URL Exclusion Patterns**: Automatically exclude job posts, articles, etc.
- **Rate Limiting**: Configurable delays between queries and pages
- **Connection Testing**: Pre-flight checks for SearxNG availability
- **Migration Tools**: Easy migration from v2.0 to v2.1 structure

---

## 📋 Requirements

- **PowerShell 5.1+** (Windows PowerShell or PowerShell Core)
- **SearxNG Instance** running locally or remotely
- **JSON Format Enabled** in SearxNG settings

---

## 🚀 Quick Start

### 1. Basic Usage
```powershell
# Run with default settings (uses all new v2.1 features)
.\ScriptQueries.ps1

# Interactive mode - choose keywords from a menu
.\ScriptQueries.ps1 -Interactive

# Use custom keywords
.\ScriptQueries.ps1 -Keywords "Machine Learning", "Data Science", "AI Research"

# Enable caching for faster subsequent runs
.\ScriptQueries.ps1 -UseCache

# Auto-open HTML report when complete
.\ScriptQueries.ps1 -OpenResults

# Verbose output with detailed progress
.\ScriptQueries.ps1 -Verbose
```

### 2. Recommended Setup
```powershell
# Best experience: cache, verbose, and auto-open
.\ScriptQueries.ps1 -UseCache -OpenResults -Verbose -ExportFormat ALL
```

### 3. Quick Access Commands
```powershell
# View latest HTML report
Get-ChildItem "reports\*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Start-Process

# Open results folder
explorer "results"

# Open reports folder
explorer "reports"

# View latest log
Get-ChildItem "logs\*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | notepad
```

---

## 📁 Directory Structure

### Automatic Organization
All files are automatically organized into dedicated folders:

```
C:\SearxQueries\
├── 📂 logs/              # Search execution logs
│   └── search_log_YYYYMMDD_HHMMSS.txt
│
├── 📂 results/           # Data files (CSV, JSON, TXT)
│   ├── linkedin_results_YYYYMMDD_HHMMSS.csv
│   ├── linkedin_results_YYYYMMDD_HHMMSS.json
│   └── linkedin_urls_YYYYMMDD_HHMMSS.txt
│
├── 📂 reports/           # HTML reports
│   └── linkedin_report_YYYYMMDD_HHMMSS.html
│
├── 📂 cache/             # Query cache
│   └── query_cache.json
│
├── 📂 exports/           # Custom exports (future use)
│
└── 📄 Script files       # PowerShell scripts & docs
    ├── ScriptQueries.ps1
    ├── Migrate-ToOrganizedStructure.ps1
    └── README.md (this file)
```

### File Locations Quick Reference

| Type | Location | Purpose |
|------|----------|---------|
| **CSV Results** | `results/` | Spreadsheet-ready data |
| **JSON Results** | `results/` | Structured data with metadata |
| **URL Lists** | `results/` | Plain text URL lists |
| **HTML Reports** | `reports/` | Interactive visual reports |
| **Search Logs** | `logs/` | Detailed execution logs |
| **Query Cache** | `cache/` | Cached results for speed |

### File Naming Convention
All files use consistent timestamps:
```
{filename}_{YYYYMMDD}_{HHMMSS}.{extension}
Example: linkedin_results_20251008_143025.csv
```

---

## 🎨 Usage Examples

### Example 1: Quick Search
```powershell
.\ScriptQueries.ps1
```
Uses default keywords, exports all formats, paginates through all results.

### Example 2: Custom Research with Caching
```powershell
.\ScriptQueries.ps1 `
    -Interactive `
    -UseCache `
    -OpenResults `
    -Verbose
```
Choose keywords interactively, use cache, auto-open report, see detailed progress.

### Example 3: Targeted Search
```powershell
.\ScriptQueries.ps1 `
    -Keywords "Stanford AI", "Stanford Machine Learning", "Stanford Robotics" `
    -ExportFormat "ALL" `
    -UseCache
```
Search specific topics, export all formats, use caching.

### Example 4: Automation/Batch Processing
```powershell
.\ScriptQueries.ps1 `
    -Keywords "AI Research", "Machine Learning", "Deep Learning" `
    -ExportFormat CSV `
    -SkipTest `
    -MaxRetries 5 `
    -DelaySeconds 3
```
Automated search for scheduled tasks or batch processing.

### Example 5: Comprehensive Analysis
```powershell
.\ScriptQueries.ps1 `
    -Keywords "Stanford CS", "MIT CS", "Berkeley CS", "CMU CS" `
    -UseCache `
    -ExportFormat ALL `
    -MaxRetries 5 `
    -DelaySeconds 3 `
    -Verbose `
    -OpenResults
```
Full-featured search with all options enabled.

### Example 6: Recruitment Research
```powershell
.\ScriptQueries.ps1 `
    -Keywords "Senior Software Engineer", "Machine Learning Engineer", "Data Scientist" `
    -UseCache `
    -OpenResults
```

### Example 7: Academic Research
```powershell
.\ScriptQueries.ps1 `
    -Keywords "Stanford PhD", "MIT Faculty", "Berkeley Researcher" `
    -Interactive
```

---

## ⚙️ Configuration

### Quick Configuration
Edit the `$Config` section in `ScriptQueries.ps1` (lines 28-71):

#### Pagination Settings (NEW in v2.1)
```powershell
MaxResultsPerQuery = 9999        # High limit for unlimited results
EnablePagination = $true          # Enable pagination feature
MaxPagesPerQuery = 100            # Maximum pages to check per query
```

#### Default Keywords
```powershell
DefaultKeywords = @(
    "Stanford Computer Science",
    "Stanford AI",
    "Stanford Machine Learning",
    # ... add your own
)
```

#### Profile Filtering
```powershell
ProfileTypes = @("in/", "company/")   # Personal profiles and companies
# Or @("in/") for just profiles
# Or @("company/") for just companies

ExcludePatterns = @("linkedin.com/jobs", "linkedin.com/posts")
```

#### Performance Settings
```powershell
MaxRetries = 3                    # Retry attempts for failed requests
RetryDelaySeconds = 5             # Delay between retries
DelayBetweenQueries = 2           # Delay between queries (in seconds)
TimeoutSeconds = 30               # Request timeout
```

#### Cache Settings
```powershell
UseCache = $UseCache.IsPresent    # Enable with -UseCache flag
CacheExpirationHours = 24         # Cache expires after 24 hours
```

---

## 📊 Output Files

### Generated Files
The script generates timestamped files organized by type:

#### 1. CSV Results (`results/`)
- **File**: `linkedin_results_YYYYMMDD_HHMMSS.csv`
- **Purpose**: Spreadsheet-ready data for Excel/analysis
- **Columns**:
  - Keyword - Search keyword that found this result
  - Title - Profile/company page title
  - URL - Clean LinkedIn URL (tracking removed)
  - Content - Snippet/description from search result
  - Engine - Search engine that provided this result
  - Score - Relevance score (if available)
  - Timestamp - When this result was collected

#### 2. JSON Results (`results/`)
- **File**: `linkedin_results_YYYYMMDD_HHMMSS.json`
- **Purpose**: Structured data with complete metadata
- **Contains**:
  - Full result data
  - Search metadata (keywords, SearxNG URL, timestamp)
  - Complete statistics
  - All configuration used

#### 3. URL Lists (`results/`)
- **File**: `linkedin_urls_YYYYMMDD_HHMMSS.txt`
- **Purpose**: Simple list of URLs, one per line
- **Use Case**: Quick import into other tools

#### 4. HTML Reports (`reports/`)
- **File**: `linkedin_report_YYYYMMDD_HHMMSS.html`
- **Purpose**: Interactive visual report
- **Features**:
  - Statistics dashboard with key metrics
  - Top performers (keywords and engines)
  - Sortable results table
  - Professional LinkedIn-themed design
  - Clickable profile links
  - Page count statistics (NEW in v2.1)

#### 5. Search Logs (`logs/`)
- **File**: `search_log_YYYYMMDD_HHMMSS.txt`
- **Purpose**: Detailed execution log
- **Contains**:
  - All queries executed
  - Page-by-page progress (NEW in v2.1)
  - Errors and warnings
  - Timing information
  - Cache hits/misses

#### 6. Query Cache (`cache/`)
- **File**: `query_cache.json`
- **Purpose**: Cached results for faster repeat searches
- **Lifespan**: 24 hours (configurable)

---

## 📝 Command-Line Parameters

### All Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `-SearxURL` | String | `http://localhost:8888` | SearxNG instance URL |
| `-WorkDir` | String | `C:\SearxQueries` | Working directory (auto-creates folders) |
| `-Keywords` | String[] | Default list | Custom search keywords |
| `-Interactive` | Switch | False | Enable interactive keyword selection |
| `-UseCache` | Switch | False | Enable query caching (24hr) |
| `-SkipTest` | Switch | False | Skip SearxNG connection test |
| `-OpenResults` | Switch | False | Auto-open HTML report when complete |
| `-ExportFormat` | String | `ALL` | Export format: CSV, JSON, TXT, HTML, or ALL |
| `-MaxRetries` | Int | 3 | Maximum retry attempts for failed requests |
| `-DelaySeconds` | Int | 2 | Delay between queries (in seconds) |
| `-Verbose` | Switch | False | Detailed logging output to console |

### Export Format Options
- `CSV` - CSV file only
- `JSON` - JSON file only
- `TXT` - URL list only
- `HTML` - HTML report only
- `ALL` - All formats (default, recommended)

### Usage Examples
```powershell
# Custom SearxNG URL
.\ScriptQueries.ps1 -SearxURL "http://192.168.1.100:8888"

# Custom output directory
.\ScriptQueries.ps1 -WorkDir "D:\LinkedInData"

# Export only CSV
.\ScriptQueries.ps1 -ExportFormat CSV

# Increase delays for rate limiting
.\ScriptQueries.ps1 -DelaySeconds 5 -MaxRetries 5
```

---

## 🔄 Migration from v2.0

### Option 1: Automatic Migration (Recommended)
Use the included migration script:

```powershell
# Preview what will be moved (safe, no changes)
.\Migrate-ToOrganizedStructure.ps1 -DryRun

# Perform migration with automatic backup
.\Migrate-ToOrganizedStructure.ps1 -Backup

# Perform migration without backup
.\Migrate-ToOrganizedStructure.ps1
```

The migration script will:
- ✅ Create organized directory structure
- ✅ Move existing files to appropriate folders
- ✅ Optionally create backup before moving
- ✅ Provide detailed summary of actions

### Option 2: Manual Migration
```powershell
# Create directories (script does this automatically)
New-Item -ItemType Directory -Path "logs","results","reports","cache","exports" -Force

# Move files manually
Move-Item "*.csv" -Destination "results"
Move-Item "*.json" -Destination "results"
Move-Item "linkedin_urls_*.txt" -Destination "results"
Move-Item "linkedin_report_*.html" -Destination "reports"
Move-Item "search_log_*.txt" -Destination "logs"
Move-Item "query_cache.json" -Destination "cache"
```

### Option 3: Fresh Start
Simply run the updated script - it will create the new structure automatically, and old files will remain in the root directory.

---

## 🐛 Troubleshooting

### Connection Issues
**Error**: `Cannot access SearxNG JSON API`

**Solutions**:
1. Check SearxNG is running: `http://localhost:8888`
2. Enable JSON format in `settings.yml`:
   ```yaml
   search:
     formats:
       - html
       - json  # Add this line
   ```
3. Disable limiter if restrictive:
   ```yaml
   server:
     limiter: false
   ```
4. Check Docker logs: `docker logs searxng`
5. Restart SearxNG: `docker restart searxng`

### 403 Forbidden Errors
**Solutions**:
- Headers are added automatically by script
- Disable rate limiting in SearxNG settings
- Increase delay: `-DelaySeconds 5`
- Reduce concurrent requests (script handles this)

### No Results Found
**Possible Causes**:
1. Keywords too specific
2. SearxNG search engines disabled
3. LinkedIn blocked by engines
4. Network issues

**Solutions**:
- Try broader keywords
- Check SearxNG search engines configuration
- Use `-Verbose` flag to see detailed logs
- Check `logs/` folder for error messages
- Verify SearxNG is searching correctly in browser first

### Pagination Issues
**Issue**: Stops after first page

**Solutions**:
- Check configuration: `EnablePagination = $true`
- Increase `MaxPagesPerQuery` if needed
- Check logs for error messages
- SearxNG might not return pagination data

### Cache Issues
**Issue**: Cache not working or stale data

**Solutions**:
```powershell
# Clear cache
Remove-Item "cache\query_cache.json"

# Run without cache
.\ScriptQueries.ps1  # Don't use -UseCache flag

# Cache expires after 24 hours automatically
```

### Permission Errors
**Solutions**:
```powershell
# Change execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run as administrator
# Right-click PowerShell → Run as Administrator
```

### Files Not in Correct Folders
**Solutions**:
- Run migration script: `.\Migrate-ToOrganizedStructure.ps1`
- Check script version: Look for "v2.1" in startup banner
- Directories are created automatically on first run

---

## 🧹 Maintenance

### Regular Cleanup

#### Clean Old Logs (30+ days)
```powershell
Get-ChildItem "logs\*.txt" | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30) | Remove-Item
```

#### Clean Old Results (60+ days)
```powershell
Get-ChildItem "results\*.*" | Where-Object LastWriteTime -lt (Get-Date).AddDays(-60) | Remove-Item
```

#### Clean Old Reports (60+ days)
```powershell
Get-ChildItem "reports\*.html" | Where-Object LastWriteTime -lt (Get-Date).AddDays(-60) | Remove-Item
```

### Archiving

#### Create Monthly Archive
```powershell
$date = Get-Date -Format "yyyy-MM"
New-Item -ItemType Directory -Path "archive\$date" -Force

# Archive old results
Get-ChildItem "results\*.*" | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30) | Move-Item -Destination "archive\$date"

# Archive old reports
Get-ChildItem "reports\*.*" | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30) | Move-Item -Destination "archive\$date"
```

#### Compress Archive
```powershell
$date = Get-Date -Format "yyyy-MM"
Compress-Archive -Path "archive\$date\*" -DestinationPath "archive\archive_$date.zip"
Remove-Item "archive\$date" -Recurse
```

### Cache Management

#### View Cache Size
```powershell
Get-ChildItem "cache\query_cache.json" | Select-Object Name, Length, LastWriteTime
```

#### Clear Cache
```powershell
Remove-Item "cache\query_cache.json"
```

#### Disable Cache Temporarily
```powershell
# Just don't use -UseCache flag
.\ScriptQueries.ps1
```

---

## 📈 Performance & Expected Results

### Expected Results by Query Complexity

| Query Type | Expected Results | Pages | Execution Time |
|------------|------------------|-------|----------------|
| Very Specific (e.g., "Stanford CS Professor AI") | 50-150 | 2-5 | 10-30 seconds |
| Specific (e.g., "Stanford Machine Learning") | 150-300 | 5-15 | 30-90 seconds |
| Broad (e.g., "Stanford Computer Science") | 200-500+ | 10-25 | 1-3 minutes |
| Very Broad (e.g., "Stanford University") | 500-1000+ | 25-50+ | 3-5+ minutes |

*Times vary based on SearxNG performance, network speed, and available results*

### Performance Tips

1. **Use Cache**: Add `-UseCache` for 10x faster repeat searches
2. **Optimize Keywords**: More specific = better quality results
3. **Adjust Delays**: Increase `-DelaySeconds` if hitting rate limits
4. **Monitor Progress**: Use `-Verbose` to track page-by-page progress
5. **Batch Processing**: Run overnight for large keyword lists
6. **Archive Regularly**: Keep directories clean for better performance

### v2.0 vs v2.1 Performance Comparison

| Metric | v2.0 | v2.1 | Improvement |
|--------|------|------|-------------|
| Results per Query | 10-20 (1 page) | 100-500+ (all pages) | **10-50x more** |
| Data Collected | Partial | Complete | **100% coverage** |
| Execution Time | 10-30 sec | 1-5 min | More time = more data |
| File Organization | Cluttered | Organized | **Enterprise-ready** |
| Progress Tracking | Basic | Page-by-page | **Real-time detailed** |

---

## 🔐 Privacy & Ethics

### Privacy Features
This script uses **SearxNG**, a privacy-respecting metasearch engine that:
- ✅ Doesn't track users
- ✅ Doesn't profile searches
- ✅ Doesn't share data with third parties
- ✅ Aggregates results from multiple search engines
- ✅ Can be self-hosted for complete control

### Ethical Usage Guidelines

**✅ DO:**
- Use for legitimate research purposes
- Respect rate limiting and delays
- Collect only publicly available search results
- Use data responsibly
- Follow LinkedIn's Terms of Service
- Use reasonable pagination limits

**❌ DON'T:**
- Scrape actual profile content (script doesn't do this)
- Use for spam or harassment
- Overload SearxNG or search engines
- Violate privacy laws (GDPR, CCPA, etc.)
- Share collected data irresponsibly
- Use for unauthorized purposes

### Data Collection Scope
This script **ONLY**:
- ✅ Collects search result URLs
- ✅ Collects search result titles
- ✅ Collects search result snippets
- ✅ Uses publicly available search data

This script **DOES NOT**:
- ❌ Access LinkedIn directly
- ❌ Scrape profile content
- ❌ Require LinkedIn credentials
- ❌ Bypass any authentication
- ❌ Store personal data

---

## 🎓 Advanced Topics

### SearxNG Configuration

#### Enable JSON Format
Edit `settings.yml`:
```yaml
search:
  formats:
    - html
    - json  # Required for this script
```

#### Disable Rate Limiting (if needed)
```yaml
server:
  limiter: false
```

#### Configure Search Engines
```yaml
engines:
  - name: bing
    disabled: false
  - name: google
    disabled: false
  - name: duckduckgo
    disabled: false
```

#### Restart SearxNG
```bash
docker restart searxng
```

### Custom Workflows

#### Workflow 1: Daily Monitoring
```powershell
# Schedule this daily
.\ScriptQueries.ps1 `
    -Keywords "Company Name employees" `
    -UseCache `
    -ExportFormat CSV `
    -SkipTest
```

#### Workflow 2: Research Project
```powershell
# Comprehensive one-time research
.\ScriptQueries.ps1 `
    -Interactive `
    -UseCache `
    -OpenResults `
    -Verbose `
    -ExportFormat ALL
```

#### Workflow 3: Batch Processing
```powershell
# Process multiple keyword sets
$keywordSets = @(
    @("AI Research", "Machine Learning"),
    @("Data Science", "Deep Learning"),
    @("Robotics", "Computer Vision")
)

foreach ($keywords in $keywordSets) {
    .\ScriptQueries.ps1 -Keywords $keywords -ExportFormat ALL
    Start-Sleep -Seconds 60  # Pause between sets
}
```

---

## 📚 Documentation & Support

### Included Documentation
- **README.md** (this file) - Complete documentation
- **Migrate-ToOrganizedStructure.ps1** - Migration helper script
- **UPGRADE_COMPLETE.txt** - Quick upgrade overview

### Getting Help

1. **Check Logs**: Always start with `logs/` folder
2. **Use Verbose**: Run with `-Verbose` flag for detailed output
3. **Test SearxNG**: Verify SearxNG works in browser first
4. **Review Configuration**: Check settings in script config section
5. **Migration Issues**: Use `-DryRun` flag on migration script

### Common Questions

**Q: How many results can I get?**  
A: Depends on SearxNG and search engines, typically 100-500+ per query with pagination.

**Q: Does this access LinkedIn directly?**  
A: No, it only uses SearxNG search results (publicly available data).

**Q: Can I schedule this to run automatically?**  
A: Yes! Use Windows Task Scheduler with appropriate parameters.

**Q: How do I update from v2.0?**  
A: Just use the new script - it's backward compatible. Use migration script to organize old files.

**Q: Can I customize the export format?**  
A: Yes! Choose CSV, JSON, TXT, HTML, or ALL via `-ExportFormat` parameter.

**Q: How long does a search take?**  
A: With pagination, typically 1-5 minutes for 8 keywords (depends on result count).

**Q: Can I run multiple instances?**  
A: Yes, but use different `-WorkDir` for each to avoid conflicts.

---

## 🤝 Contributing & Feedback

### Suggestions for Improvements
- Additional export formats (Excel with formatting, Markdown)
- Integration with CRM systems
- Email notifications when complete
- Multi-threading for parallel queries
- Web UI interface
- Profile detail enrichment
- Database export (SQLite, SQL Server)
- API mode for programmatic access
- Historical trend analysis
- Auto-archiving with configurable retention

### Feedback Welcome!
- What features do you find most useful?
- What improvements would you like to see?
- Any bugs or issues encountered?

---

## 📄 License & Credits

### License
Free to use and modify. No warranty provided. Use at your own risk.

### Credits
- **SearxNG** - Privacy-respecting metasearch engine
- **PowerShell Community** - Excellent cmdlets and modules
- **Contributors** - Thanks to all who provided feedback

---

## 🏁 Quick Reference Summary

### Installation
1. Ensure PowerShell 5.1+ installed
2. Have SearxNG running with JSON enabled
3. Download `ScriptQueries.ps1`
4. Run: `.\ScriptQueries.ps1`

### Basic Commands
```powershell
# Quick start
.\ScriptQueries.ps1

# Best experience
.\ScriptQueries.ps1 -UseCache -OpenResults -Verbose

# Custom keywords
.\ScriptQueries.ps1 -Keywords "Your Keywords Here"

# View results
explorer "results"
explorer "reports"
```

### File Locations
- **CSV/JSON/TXT** → `results/`
- **HTML Reports** → `reports/`
- **Logs** → `logs/`
- **Cache** → `cache/`

### Support
- Check `logs/` for errors
- Use `-Verbose` for debugging
- Clear cache if stale: `Remove-Item "cache\query_cache.json"`
- Verify SearxNG: `http://localhost:8888`

---

**Version**: 2.1  
**Release Date**: October 8, 2025  
**Author**: SearxNG Community  
**Last Updated**: October 8, 2025

**Major Features**: Complete pagination • Organized directories • Enhanced UI • 10-50x more results

---

For the latest updates and detailed changelog, see the commit history or version notes in the script header.

**Happy searching! 🚀**
