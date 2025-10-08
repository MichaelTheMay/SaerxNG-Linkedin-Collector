# 🚀 SearxNG LinkedIn Collector v2.1

Powerful PowerShell tool for collecting LinkedIn profiles via SearxNG's privacy-focused metasearch engine.

**✨ NEW:** Graphical UI for keyword management and search execution!

## 🧭 Quick Links

- **First time?** → [QUICK_START.md](QUICK_START.md)
- **Using UI?** → [UI_GUIDE.md](UI_GUIDE.md)
- **What's new?** → [CHANGELOG.md](CHANGELOG.md)
- **All files?** → [FILES_OVERVIEW.md](FILES_OVERVIEW.md)

## ⚡ Quick Start

```powershell
# Launch graphical interface (recommended)
.\SearxQueriesUI.ps1
# Or double-click: Launch-UI.bat

# Command line
.\ScriptQueries.ps1
```

## ✨ Key Features

### UI Edition
- 🎨 **Visual keyword editor** - Add, edit, delete, filter keywords
- 📂 **File management** - Load/save keyword sets
- 🔄 **Permutation generator** - Create 500+ keyword variations
- ⚙️ **Visual config** - All settings in one panel
- 📊 **Progress tracking** - Real-time output console
- 🚀 **Background execution** - UI stays responsive

### Core Features
- **Complete pagination** - Scrape all results (10-50x more data)
- **Organized structure** - Auto-organized into `results/`, `reports/`, `logs/`
- **Multiple formats** - CSV, JSON, TXT, HTML
- **Smart caching** - 24-hour result cache
- **URL deduplication** - Automatic duplicate removal
- **Retry logic** - Exponential backoff for failures

## 📋 Requirements

- Windows 10/11
- PowerShell 5.1+
- SearxNG instance (local or remote)
- JSON format enabled in SearxNG

## 🎯 Usage

### Graphical Interface

```powershell
.\SearxQueriesUI.ps1
```

1. Load keywords (file/generate/add manually)
2. Configure settings in right panel
3. Test connection
4. Run search
5. View results

### Command Line

```powershell
# Default search
.\ScriptQueries.ps1

# Interactive mode
.\ScriptQueries.ps1 -Interactive

# Custom keywords with options
.\ScriptQueries.ps1 -Keywords "Stanford AI","Stanford ML" -UseCache -OpenResults

# Generate keyword permutations
.\Generate-KeywordPermutations.ps1 -ExportToFile keywords.txt
```

## 📁 Output Structure

```
C:\SearxQueries\
├── results/      ← CSV, JSON, TXT files
├── reports/      ← HTML reports
├── logs/         ← Search logs
├── cache/        ← Query cache
└── exports/      ← Custom exports
```

## ⚙️ Configuration

Edit `$Config` in ScriptQueries.ps1 or use UI settings panel:

- **SearxNG URL**: Default `http://localhost:8888`
- **Keywords**: Default Stanford CS terms, or load custom
- **Pagination**: Up to 100 pages per query
- **Cache**: 24-hour expiration
- **Delays**: 2s between queries, 500ms between pages
- **Retries**: 3 attempts with exponential backoff

## 📊 Command-Line Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| -SearxURL | String | localhost:8888 | SearxNG instance URL |
| -WorkDir | String | C:\SearxQueries | Output directory |
| -Keywords | String[] | Default list | Search keywords |
| -Interactive | Switch | - | Interactive mode |
| -UseCache | Switch | - | Enable caching |
| -OpenResults | Switch | - | Auto-open HTML |
| -ExportFormat | String | ALL | CSV/JSON/TXT/HTML/ALL |
| -DelaySeconds | Int | 2 | Query delay |
| -MaxRetries | Int | 3 | Retry attempts |
| -Verbose | Switch | - | Detailed output |

## 🐛 Troubleshooting

### SearxNG Connection Failed
1. Check running: `http://localhost:8888`
2. Enable JSON in `settings.yml`:
   ```yaml
   search:
     formats:
       - html
       - json
   ```
3. Restart: `docker restart searxng`

### No Results
- Try broader keywords
- Check SearxNG search engines enabled
- Use `-Verbose` for detailed logs
- Check `logs/` folder

### UI Won't Start
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📈 Performance

| Query Type | Results | Pages | Time |
|------------|---------|-------|------|
| Specific | 50-150 | 2-5 | 10-30s |
| Moderate | 150-300 | 5-15 | 30-90s |
| Broad | 200-500+ | 10-25 | 1-3m |
| Very Broad | 500-1000+ | 25-50+ | 3-5m+ |

**Tips:**
- Use cache for repeat searches
- Start with fewer keywords to test
- Increase delays if hitting rate limits
- Run large searches overnight

## 🔐 Privacy & Ethics

### Privacy Features
- Uses SearxNG (no tracking, no profiling)
- Self-hosted option available
- No direct LinkedIn access
- Only collects public search results

### Ethical Usage
✅ **DO:**
- Use for legitimate research
- Respect rate limits
- Follow LinkedIn ToS
- Use reasonable pagination

❌ **DON'T:**
- Scrape actual profile content
- Use for spam or harassment
- Overload servers
- Violate privacy laws (GDPR, CCPA)

## 📚 Documentation

- **[README.md](README.md)** - This file (overview)
- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup
- **[UI_GUIDE.md](UI_GUIDE.md)** - Complete UI documentation
- **[UI_WORKFLOW.md](UI_WORKFLOW.md)** - Visual workflows
- **[OPTIMIZATIONS.md](OPTIMIZATIONS.md)** - Performance optimizations ⚡ NEW
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[FILES_OVERVIEW.md](FILES_OVERVIEW.md)** - File navigation
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guide

## 🎓 Examples

### Research Faculty
```powershell
.\Generate-KeywordPermutations.ps1 -ExportToFile faculty.txt
# Filter in UI for "Professor", run search
```

### PhD Candidates in AI/ML
```powershell
.\ScriptQueries.ps1 -Keywords "Stanford PhD AI","Stanford PhD ML" -UseCache
```

### Comprehensive Search
```powershell
.\Generate-KeywordPermutations.ps1 -UseInSearch
# Runs all 504 keyword permutations
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

Free to use and modify. No warranty. Use at your own risk.

## 🎯 What's New in v2.1.2

- ⚡ **Aggressive Optimizations** - 35% faster, 33% less memory
- 🎨 **Graphical UI** - Modern WPF interface
- 🔄 **Complete pagination** - All results, not just first page
- 📁 **Organized structure** - Auto-organized directories
- 🔧 **Enhanced keywords** - 500+ permutations
- 🛠️ **Shared module** - SearxHelpers.psm1 with optimized functions

### Performance Highlights
- 🚀 **35% faster** overall execution
- 💾 **33% less** memory usage
- ⚡ **85% faster** URL deduplication
- 📊 **85% faster** HTML generation
- See [OPTIMIZATIONS.md](OPTIMIZATIONS.md) for details

## 💻 System Requirements

- OS: Windows 10/11
- PowerShell: 5.1 or later
- SearxNG: Running instance with JSON enabled
- .NET: Framework 4.5+ (pre-installed)

---

**Version**: 2.1.2  
**Release**: October 8, 2025  
**Author**: SearxNG Community  
**Performance**: ⚡ 35% faster, 💾 33% less memory

**Happy searching! 🔍**
