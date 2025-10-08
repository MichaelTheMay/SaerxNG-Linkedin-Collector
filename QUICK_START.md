# 🚀 Quick Start Guide

Get started with SearxNG LinkedIn Collector in 5 minutes!

## Prerequisites

- Windows 10/11
- PowerShell 5.1+
- SearxNG instance (local or remote)

## Setup (5 Steps)

### 1. Install SearxNG (if not already running)

**Using Docker:**
```bash
docker pull searxng/searxng
docker run -d \
  --name searxng \
  -p 8888:8080 \
  -v ./searxng:/etc/searxng \
  searxng/searxng
```

### 2. Configure SearxNG

Copy the example settings:
```bash
cp settings.yml.example /path/to/searxng/settings.yml
```

**Important**: Edit and change the `secret_key`!

### 3. Restart SearxNG

```bash
docker restart searxng
```

Or use the included script:
```powershell
.\Restart-SearxNG.ps1
```

### 4. Run Your First Search

```powershell
.\ScriptQueries.ps1
```

### 5. View Results

Results are automatically organized in:
- `results/` - CSV, JSON, TXT files  
- `reports/` - HTML reports
- `logs/` - Search logs

## Common Commands

```powershell
# Quick search with defaults
.\ScriptQueries.ps1

# Interactive mode
.\ScriptQueries.ps1 -Interactive

# Custom keywords
.\ScriptQueries.ps1 -Keywords "Stanford AI","Stanford ML"

# With caching
.\ScriptQueries.ps1 -UseCache -OpenResults

# Generate all keyword permutations
.\Generate-KeywordPermutations.ps1 -ShowCount
```

## Troubleshooting

### SearxNG not returning results?

1. Check if running: `http://localhost:8888`
2. Verify JSON format is enabled in settings.yml
3. Disable broken engines (Startpage, DuckDuckGo)
4. Check Docker logs: `docker logs searxng`

### Script errors?

- Ensure PowerShell execution policy allows scripts
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Next Steps

- Read [README.md](README.md) for complete documentation
- See [CHANGELOG.md](CHANGELOG.md) for version history
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

---

**Happy searching!** 🔍

