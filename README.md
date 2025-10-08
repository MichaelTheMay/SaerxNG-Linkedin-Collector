# 🚀 SearxNG LinkedIn Collector

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/yourusername/SearxQueries)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PowerShell](https://img.shields.io/badge/PowerShell-5.1+-blue.svg)](https://github.com/PowerShell/PowerShell)
[![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)](https://www.microsoft.com/windows)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/PULL_REQUEST_TEMPLATE.md)

> Powerful PowerShell tool for collecting LinkedIn profiles via SearxNG's privacy-focused metasearch engine.
**✨ NEW in v3.0:** React UI with Interactive Wizard & Advanced Query Builder!  
**Previous (v2.2):** Parallel execution & real-time progress tracking

## 🧭 Quick Links

- **First time?** → [USAGE_GUIDE.md](USAGE_GUIDE.md) | **[Launch Interactive Wizard](searx-ui/)** 🧙‍♂️
- **React UI?** → [searx-ui/](searx-ui/) | [Wizard Guide](searx-ui/WIZARD_GUIDE.md)
- **Query Builder?** → [Query Examples](example-queries/)
- **PowerShell UI?** → [UI_GUIDE.md](UI_GUIDE.md)
- **Parallel execution?** → [PARALLEL_EXECUTION_GUIDE.md](PARALLEL_EXECUTION_GUIDE.md)
- **What's new?** → [CHANGELOG.md](CHANGELOG.md)

## ⚡ Quick Start

### React UI (Modern Web Interface)

**Easy Launch (Recommended):**
```powershell
# Start everything at once
.\Start-All.ps1

# Or start individual components:
.\Start-API.ps1     # Start just the API server
.\Start-UI.ps1      # Start just the React UI
```

**Manual Launch:**
```bash
# Install all dependencies
npm run install:all

# Start API server in one terminal
npm run dev:api

# Start UI in another terminal
npm run dev:ui

# Or start both simultaneously
npm start
```

## ✨ Key Features

### UI Editions

#### PowerShell UI (v2.2)
- 🎨 **Visual keyword editor** - Add, edit, delete, filter keywords
- 📂 **File management** - Load/save keyword sets
- 🔄 **Permutation generator** - Create 500+ keyword variations
- ⚙️ **Visual config** - All settings in one panel
- 📊 **Real-time progress bar** - Visual progress tracking with percentage
- ⚡ **Parallel execution** - Run multiple searches simultaneously (3-5x faster!)
- 🚀 **Background execution** - UI stays responsive
- 🎛️ **Throttle control** - Configure max concurrent threads

#### React UI (Modern Web Interface)
- 🌐 **Web-based interface** - Access from any browser
- 📱 **Responsive design** - Works on desktop and mobile
- 🎯 **Material-UI components** - Modern, professional appearance
- 🔄 **Real-time updates** - Live progress and status updates
- 📊 **Interactive results viewer** - Clickable links and export options
- ⚙️ **Advanced configuration** - Comprehensive settings panel
- 🚀 **Fast development** - Built with Vite for rapid iteration
- 🔌 **API-ready** - Designed for backend integration

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

### Graphical Interfaces

**React UI (Recommended):**
```powershell
.\Start-All.ps1
# Opens http://localhost:5173 in your browser
```

**PowerShell UI (Legacy):**
```powershell
.\packages\scripts\SearxQueriesUI.ps1
```

1. Load keywords (file/generate/add manually)
2. Configure settings in right panel
3. Test connection
4. Run search
5. View results

### Command Line

```powershell
# Default search
.\packages\scripts\ScriptQueries.ps1

# Interactive mode
.\packages\scripts\ScriptQueries.ps1 -Interactive

# Custom keywords with options
.\packages\scripts\ScriptQueries.ps1 -Keywords "Stanford AI","Stanford ML" -UseCache -OpenResults

# Parallel execution
.\packages\scripts\ScriptQueriesParallel.ps1 -Keywords "test" -Parallel -ThrottleLimit 5

# Generate keyword permutations
.\packages\scripts\Generate-KeywordPermutations.ps1 -ExportToFile .\data\keywords.txt
```

## 📁 Output Structure

```
C:\SearxQueries\
├── data/
│   ├── results/      ← CSV, JSON, TXT files
│   ├── reports/      ← HTML reports
│   ├── logs/         ← Search logs
│   ├── cache/        ← Query cache
│   └── exports/      ← Custom exports
├── packages/
│   ├── api/          ← Node.js Express API server
│   ├── ui/           ← React + TypeScript frontend
│   └── scripts/      ← PowerShell automation scripts
├── shared/           ← Shared types and utilities
└── docs/             ← Documentation and examples
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
- **[docs/USAGE_GUIDE.md](docs/USAGE_GUIDE.md)** - Complete usage guide
- **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** - Quick reference
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** - Version history
- **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Contribution guide
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Migration from v2.x to v3.x
- **[NEW-STRUCTURE.md](NEW-STRUCTURE.md)** - New monorepo structure guide

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

### For React UI
- OS: Windows 10/11, macOS, Linux
- Node.js: 14 or higher
- npm: 6 or higher
- Modern web browser (Chrome, Firefox, Edge)
- SearxNG: Running instance with JSON enabled

## 🔧 Troubleshooting

### React UI - Network Connection Issues

If you're experiencing "Network Failure" or connection test failures:

**Quick Fix:**
```bash
# Navigate to React UI folder
cd searx-ui

# Run the launcher script
.\Start-ReactUI.ps1  # Windows PowerShell
# or
./Start-ReactUI.bat  # Windows Batch
```

**Common Issues:**

1. **"Connection test failed"**
   - **Cause**: SearxNG is not running
   - **Fix**: Ensure SearxNG is accessible at http://localhost:8888
   - **Test**: Open http://localhost:8888/search?q=test&format=json in your browser

2. **"Module not found" errors**
   - **Cause**: Dependencies not installed
   - **Fix**:
     ```bash
     cd searx-ui
     npm install
     ```

3. **Port conflicts (5173)**
   - **Cause**: Another service is using port 5173
   - **Fix**: Kill the conflicting process or the port will auto-increment

4. **CORS errors**
   - **Cause**: SearxNG doesn't allow cross-origin requests
   - **Fix**: Ensure SearxNG is configured with proper CORS headers

### Search Issues

- **No results found**: Check that SearxNG can access search engines (DuckDuckGo, Bing, Google)
- **Empty LinkedIn results**: Verify LinkedIn profiles are being indexed by your search engines
- **Slow searches**: Increase the delay between requests in settings

### General Issues

- **Browser compatibility**: Use a modern browser (Chrome, Firefox, Edge)
- **Node.js version**: Ensure you're using Node.js 14 or higher
- **Network connectivity**: Ensure your internet connection is stable

## 🤝 Contributing

We welcome contributions! Please see:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md) - Community standards
- [GITHUB_SETUP.md](GITHUB_SETUP.md) - Repository setup guide

## 🔒 Security

Found a security issue? Please see [SECURITY.md](.github/SECURITY.md) for responsible disclosure.

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/SearxQueries/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/SearxQueries/discussions)

---

**Version**: 2.2.0  
**Release**: October 8, 2025  
**License**: MIT  
**Performance**: ⚡ 3-5x faster with parallel execution

Made with ❤️ by the SearxNG LinkedIn Collector community
