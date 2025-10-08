# 🚀 Quick Start Guide

Get started in 5 minutes!

## Prerequisites

- Windows 10/11
- PowerShell 5.1+
- SearxNG instance

## Setup

### 1. Install SearxNG

**Docker (Recommended):**
```bash
docker pull searxng/searxng
docker run -d --name searxng -p 8888:8080 searxng/searxng
```

### 2. Configure SearxNG

Enable JSON format in `settings.yml`:
```yaml
search:
  formats:
    - html
    - json  # Add this
```

**Important:** Change the `secret_key`!

### 3. Restart SearxNG

```bash
docker restart searxng
```

Or use included script:
```powershell
.\Restart-SearxNG.ps1
```

### 4. Run Your First Search

**Graphical Interface (Recommended):**
```powershell
.\SearxQueriesUI.ps1
# Or double-click: Launch-UI.bat
```

**Command Line:**
```powershell
.\ScriptQueries.ps1
```

### 5. View Results

Files auto-organized in:
- `results/` - CSV, JSON, TXT
- `reports/` - HTML reports
- `logs/` - Search logs

## Common Commands

### Graphical Interface
```powershell
.\SearxQueriesUI.ps1    # Launch UI
Launch-UI.bat           # Or double-click this
```

### Command Line
```powershell
# Quick search
.\ScriptQueries.ps1

# Interactive mode
.\ScriptQueries.ps1 -Interactive

# Custom keywords
.\ScriptQueries.ps1 -Keywords "Stanford AI","Stanford ML"

# With options
.\ScriptQueries.ps1 -UseCache -OpenResults

# Generate permutations
.\Generate-KeywordPermutations.ps1 -ShowCount
```

## Troubleshooting

### SearxNG Connection Failed
1. Check: `http://localhost:8888`
2. Enable JSON in settings.yml
3. Restart: `docker restart searxng`
4. Check logs: `docker logs searxng`

### Script Won't Run
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### No Results
- Use broader keywords
- Check SearxNG search engines enabled
- Try `-Verbose` flag
- Review `logs/` folder

## Next Steps

- [UI_GUIDE.md](UI_GUIDE.md) - Complete UI documentation
- [README.md](README.md) - Full feature list
- [CHANGELOG.md](CHANGELOG.md) - What's new

---

**Happy searching!** 🔍
