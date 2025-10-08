# 🎨 SearxNG LinkedIn Collector - UI Guide

Modern graphical interface for keyword management and search execution.

**Visual workflows:** [UI_WORKFLOW.md](UI_WORKFLOW.md)

## 🚀 Quick Start

```powershell
.\SearxQueriesUI.ps1
# Or double-click: Launch-UI.bat
```

## 📋 Interface Overview

### Main Sections

**1. Header Bar**
- Keyword count display
- Selected keywords count

**2. Keyword List (Left Panel)**
- Search box for real-time filtering
- Keyword list with multi-select
- Management buttons: Add, Edit, Delete, Clear All, Select All, Deselect

**3. Configuration Panel (Right)**
- **File Operations**: Load, Save, Generate Permutations
- **SearxNG Settings**: URL, Work Directory
- **Search Options**: Cache, Auto-open, Verbose, Format, Delay, Retries
- **Quick Actions**: Open Results/Reports/Logs folders

**4. Action Bar**
- Status indicator
- Test Connection button
- Run Search button
- Stop button

**5. Output Console (Bottom)**
- Real-time logs
- Clear button

## 📖 Common Tasks

### Load Keywords

**Option A: From File**
1. Click "Load from File"
2. Select `.txt` file (e.g., `stanford_keywords_all.txt`)
3. Keywords loaded

**Option B: Generate Permutations**
1. Click "Generate Permutations"
2. 504 keywords auto-generated

**Option C: Add Manually**
1. Click "Add"
2. Enter keyword
3. Click Add

### Manage Keywords

- **Filter**: Type in search box (e.g., "PhD", "Professor")
- **Edit**: Select one → Edit → Modify → Save
- **Delete**: Select keyword(s) → Delete → Confirm
- **Select**: Ctrl+Click (multi), Shift+Click (range)

### Run Search

1. Optional: Select specific keywords (or use all)
2. Configure settings in right panel
3. Click "Test Connection" (optional but recommended)
4. Click "Run Search"
5. Confirm keyword count
6. Watch progress in console
7. Results auto-open when done

## 💡 Tips & Tricks

### Quick Filtering
Type to filter instantly:
- `PhD` - Only PhD-related
- `AI` - Only AI keywords
- `Professor` - Only professor titles

### Batch Operations
1. Filter keywords
2. Click "Select All"
3. Run search with filtered subset

### Use Cache
Enable "Use Cache" for:
- Faster repeat searches
- Testing export formats
- Avoiding rate limits

### Test First
Always click "Test Connection" before searches to verify SearxNG is running.

## ⚙️ Configuration Reference

### Search Options

| Option | Default | Description |
|--------|---------|-------------|
| Use Cache | ☑️ | Cache results 24hr |
| Auto-open | ☑️ | Open HTML when done |
| Verbose | ☐ | Detailed progress |
| Format | ALL | Export formats |
| Delay | 2s | Between queries |
| Retries | 3 | On failure |

### Export Formats

| Format | Use Case |
|--------|----------|
| ALL | Recommended |
| CSV | Spreadsheets |
| JSON | Programming |
| TXT | URL lists |
| HTML | Viewing |

## 🐛 Troubleshooting

### UI Won't Start
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "ScriptQueries.ps1 not found"
Ensure UI is in same directory as `ScriptQueries.ps1`

### Connection Test Fails
1. Check SearxNG running: `http://localhost:8888`
2. Enable JSON in settings.yml
3. Restart SearxNG: `docker restart searxng`

### Search Hangs
- Click Stop
- Check Output Console for errors
- Reduce keyword count
- Increase delay

### No Results Open
- Click "Reports Folder" button
- Open latest `linkedin_report_*.html`

## 📚 Advanced Features

### Keyboard Shortcuts
- Ctrl+A: Select all
- Delete: Delete selected
- Enter: Confirm dialog
- Escape: Cancel dialog

### Background Execution
- Searches run in background
- UI remains responsive
- Can stop anytime
- Monitor via Output Console

### Multiple Selections
- Single click: Select one
- Ctrl+Click: Add to selection
- Shift+Click: Range select

## 🎯 Example Workflows

### Academic Research
```
1. Generate Permutations
2. Filter: "PhD AI"
3. Select filtered
4. Run search
```

### Faculty Directory
```
1. Generate Permutations
2. Filter: "Professor"
3. Select all
4. Enable Cache
5. Run search
```

### Targeted Search
```
1. Add 3-5 custom keywords
2. Save to file for later
3. Run search
```

## 📁 Output Locations

- **Results**: `results/` (CSV, JSON, TXT)
- **Reports**: `reports/` (HTML)
- **Logs**: `logs/` (execution logs)
- **Cache**: `cache/` (24hr cache)

Access via Quick Actions buttons!

## ⏱️ Search Times

- 10 keywords: ~1-2 minutes
- 50 keywords: ~5-10 minutes
- 100 keywords: ~10-20 minutes
- 500 keywords: ~40-90 minutes

## 🔗 Integration

UI uses same `ScriptQueries.ps1` as CLI:
- Same features and output
- Share keyword files
- Mix UI and CLI workflows

---

**Need more help?** See [UI_WORKFLOW.md](UI_WORKFLOW.md) for visual guides and detailed workflows.
