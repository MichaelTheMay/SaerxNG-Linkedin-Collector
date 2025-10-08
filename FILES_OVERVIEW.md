# 📁 Files Overview

Quick reference to all project files.

## 🎯 Quick Navigation

**Want to...**
- Get started? → [QUICK_START.md](QUICK_START.md)
- Use UI? → [UI_GUIDE.md](UI_GUIDE.md) or run `Launch-UI.bat`
- See changes? → [CHANGELOG.md](CHANGELOG.md)
- Full docs? → [README.md](README.md)
- Contribute? → [CONTRIBUTING.md](CONTRIBUTING.md)

## 📂 Core Scripts

| File | Purpose | Usage |
|------|---------|-------|
| **SearxQueriesUI.ps1** | Graphical interface | `.\SearxQueriesUI.ps1` |
| **ScriptQueries.ps1** | CLI search tool | `.\ScriptQueries.ps1` |
| **Generate-KeywordPermutations.ps1** | Keyword generator | Auto-generates 504 keywords |
| **Migrate-ToOrganizedStructure.ps1** | Migration helper | Migrate from v2.0 |
| **Restart-SearxNG.ps1** | SearxNG restart | Quick restart helper |
| **Launch-UI.bat** | UI launcher | Double-click to start |

## 📖 Documentation

| File | Purpose | Audience |
|------|---------|----------|
| **README.md** | Complete docs | All users |
| **QUICK_START.md** | Setup guide | New users |
| **UI_GUIDE.md** | UI manual | UI users |
| **UI_WORKFLOW.md** | Visual workflows | UI users |
| **CHANGELOG.md** | Version history | All users |
| **CONTRIBUTING.md** | Contribution guide | Contributors |
| **FILES_OVERVIEW.md** | This file | Reference |

## 📦 Data Files

| File | Content | Keywords |
|------|---------|----------|
| **stanford_keywords_all.txt** | All permutations | 504 |

## 📁 Output Directories

```
C:\SearxQueries\
├── results/      ← CSV, JSON, TXT files
├── reports/      ← HTML reports
├── logs/         ← Execution logs
├── cache/        ← Query cache (24hr)
└── exports/      ← Custom exports
```

## 🚀 Usage Patterns

### Pattern 1: Graphical (Recommended)
```
1. Double-click Launch-UI.bat
2. Load/manage keywords
3. Configure settings
4. Run search
```

### Pattern 2: CLI - Interactive
```powershell
.\ScriptQueries.ps1 -Interactive
```

### Pattern 3: CLI - Scripted
```powershell
.\ScriptQueries.ps1 -Keywords "AI","ML" -UseCache -ExportFormat ALL
```

### Pattern 4: Generate & Search
```powershell
.\Generate-KeywordPermutations.ps1 -ExportToFile keywords.txt
$keywords = Get-Content keywords.txt | Where-Object {$_ -notmatch '^#'}
.\ScriptQueries.ps1 -Keywords $keywords
```

## 📚 Learning Path

**Beginner:**
1. [QUICK_START.md](QUICK_START.md)
2. Run `Launch-UI.bat`
3. Follow [UI_GUIDE.md](UI_GUIDE.md)

**Intermediate:**
1. [README.md](README.md) features
2. CLI: `.\ScriptQueries.ps1 -Interactive`
3. Generate keywords
4. Customize settings

**Advanced:**
1. Full [README.md](README.md)
2. CLI automation
3. Custom keyword sets
4. Scheduled searches
5. [CONTRIBUTING.md](CONTRIBUTING.md)

## 🎓 Which File Do I Need?

**Start now** → `Launch-UI.bat`  
**What is this?** → `README.md`  
**Setup** → `QUICK_START.md`  
**Use UI** → `UI_GUIDE.md`  
**Automate** → `ScriptQueries.ps1`  
**Keywords** → `Generate-KeywordPermutations.ps1`  
**Changes** → `CHANGELOG.md`  
**Contribute** → `CONTRIBUTING.md`  
**Fix SearxNG** → `Restart-SearxNG.ps1`  
**Migrate** → `Migrate-ToOrganizedStructure.ps1`  
**UI layout** → `UI_WORKFLOW.md`

## 🔗 File Dependencies

```
Launch-UI.bat → SearxQueriesUI.ps1 → ScriptQueries.ps1
                                    ↓
                        stanford_keywords_all.txt
                                    ↑
                Generate-KeywordPermutations.ps1
```

## 📝 Output Files

### Results (results/)
- `linkedin_results_YYYYMMDD_HHMMSS.csv`
- `linkedin_results_YYYYMMDD_HHMMSS.json`
- `linkedin_urls_YYYYMMDD_HHMMSS.txt`

### Reports (reports/)
- `linkedin_report_YYYYMMDD_HHMMSS.html`

### Logs (logs/)
- `search_log_YYYYMMDD_HHMMSS.txt`

### Cache (cache/)
- `query_cache.json`

---

**Need help?** Search this doc with Ctrl+F or check [README.md](README.md).
