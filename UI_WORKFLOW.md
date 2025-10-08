# 📊 UI Workflow Diagram

Visual guide to using the SearxNG LinkedIn Collector UI

---

## 🎯 Main Window Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔍 SearxNG LinkedIn Collector                      Keywords: 8 | Selected: 2│
│  Professional Edition v2.1 - Graphical Interface                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬───────────────────────────────────────────┐
│  📋 Keyword List                 │  ⚙️ Configuration                         │
│  ┌─────────────────────────────┐│  ┌─────────────────────────────────────┐ │
│  │ 🔍 Search keywords...        ││  │ 📁 File Operations                  │ │
│  └─────────────────────────────┘│  │  📂 Load from File                  │ │
│  ┌─────────────────────────────┐│  │  💾 Save to File                    │ │
│  │ ☑️ Stanford AI               ││  │  🔄 Generate Permutations           │ │
│  │ ☑️ Stanford Machine Learning ││  └─────────────────────────────────────┘ │
│  │ ☐ Stanford Computer Science  ││  ┌─────────────────────────────────────┐ │
│  │ ☐ Stanford PhD CS            ││  │ 🔧 SearxNG Settings                 │ │
│  │ ☐ Stanford Deep Learning     ││  │  URL: http://localhost:8888         │ │
│  │ ☐ Stanford NLP               ││  │  Dir: C:\SearxQueries               │ │
│  │ ☐ Stanford Robotics          ││  └─────────────────────────────────────┘ │
│  │ ☐ Stanford Data Science      ││  ┌─────────────────────────────────────┐ │
│  └─────────────────────────────┘│  │ 🎯 Search Options                   │ │
│  ┌─────────────────────────────┐│  │  ☑️ Use Cache                        │ │
│  │ ➕ Add  ✏️ Edit  🗑️ Delete  ││  │  ☑️ Auto-open Results                │ │
│  │ Clear All  Select All        ││  │  ☐ Verbose Output                   │ │
│  └─────────────────────────────┘│  │  Format: [ALL ▼]                    │ │
│                                  │  │  Delay: 2 | Retries: 3              │ │
│                                  │  └─────────────────────────────────────┘ │
│                                  │  ┌─────────────────────────────────────┐ │
│                                  │  │ ⚡ Quick Actions                     │ │
│                                  │  │  📂 Results Folder                  │ │
│                                  │  │  📊 Reports Folder                  │ │
│                                  │  │  📝 Logs Folder                     │ │
│                                  │  └─────────────────────────────────────┘ │
└─────────────────────────────────┴───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Status: Ready                         🔌 Test  ▶️ Run Search    ⏹️ Stop   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  📺 Output Console                                                   [Clear] │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [03:45:16] Loaded 8 default keywords                                    ││
│  │ [03:45:23] Loaded 504 keywords from: stanford_keywords_all.txt          ││
│  │ [03:45:30] Testing connection to SearxNG...                             ││
│  │ [03:45:31] ✓ Connection successful! SearxNG is accessible.             ││
│  │ [03:45:35] Starting search with 8 keywords...                           ││
│  │ [03:45:36] Executing query: site:linkedin.com Stanford AI               ││
│  │ [03:45:38] ✓ Added: 45 from 3 page(s)                                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Typical Workflows

### Workflow 1: Quick Search with Defaults

```
Start
  ↓
Launch UI (double-click Launch-UI.bat)
  ↓
UI opens with 8 default keywords
  ↓
Click "Test Connection" → ✓ Success
  ↓
Click "Run Search"
  ↓
Confirm: "Run search with 8 keywords?" → Yes
  ↓
Watch progress in console
  ↓
Search completes → HTML report opens automatically
  ↓
Done!
```

### Workflow 2: Load Keywords and Search

```
Start
  ↓
Launch UI
  ↓
Click "Load from File"
  ↓
Select stanford_keywords_all.txt (504 keywords)
  ↓
Keywords loaded and displayed
  ↓
Optional: Filter keywords (type "PhD" in search)
  ↓
Optional: Select specific keywords (Ctrl+Click)
  ↓
Click "Run Search"
  ↓
Search runs with selected (or all) keywords
  ↓
Results saved to organized folders
  ↓
View results in auto-opened HTML report
  ↓
Done!
```

### Workflow 3: Generate and Search Custom Keywords

```
Start
  ↓
Launch UI
  ↓
Click "Generate Permutations"
  ↓
504 keyword permutations generated and loaded
  ↓
Filter keywords (e.g., type "Professor")
  ↓
Select All filtered keywords
  ↓
Configure settings:
  - Enable "Use Cache"
  - Set Delay to 3 seconds
  - Choose export format
  ↓
Click "Run Search"
  ↓
Search executes in background
  ↓
Monitor progress in Output Console
  ↓
Results auto-open when complete
  ↓
Click "Results Folder" to browse files
  ↓
Done!
```

### Workflow 4: Build Custom Keyword Set

```
Start
  ↓
Launch UI
  ↓
Click "Clear All" (remove defaults)
  ↓
Click "Add" → Enter "Stanford AI" → Add
  ↓
Click "Add" → Enter "Stanford ML" → Add
  ↓
Click "Add" → Enter "Stanford NLP" → Add
  ↓
(Repeat for each keyword)
  ↓
Click "Save to File"
  ↓
Save as "my_custom_keywords.txt"
  ↓
Click "Run Search"
  ↓
Search executes with custom keywords
  ↓
Done!
```

---

## 🎨 Color Coding

The UI uses consistent color coding:

| Color | Meaning | Examples |
|-------|---------|----------|
| 🔵 Blue | Primary actions | Run Search, Load File |
| 🟢 Green | Success/Add | Add button, success messages |
| 🔴 Red | Delete/Stop | Delete, Stop, Clear All |
| ⚫ Gray | Secondary | Folder buttons, Deselect |
| 🟡 Yellow | Generate/Warning | Generate Permutations |
| 🟦 Cyan | Info | Test Connection, Save |

---

## 📱 UI Components

### Keyword List Panel

```
Function: Manage and view all keywords
Actions:
  - Click to select
  - Ctrl+Click for multi-select
  - Shift+Click for range select
  - Type to filter in real-time
```

### Configuration Panel

```
Function: Configure search settings
Sections:
  1. File Operations (Load/Save/Generate)
  2. SearxNG Settings (URL, Directory)
  3. Search Options (Cache, Output, Format)
  4. Quick Actions (Open folders)
```

### Action Bar

```
Function: Control search execution
Buttons:
  - Test Connection: Verify SearxNG
  - Run Search: Execute search
  - Stop: Cancel running search
Status: Shows current state
```

### Output Console

```
Function: Real-time operation logs
Features:
  - Timestamped messages
  - Color-coded output
  - Auto-scroll
  - Clear button
```

---

## 🔑 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+A | Select all keywords |
| Delete | Delete selected keywords |
| Enter (in Add/Edit dialog) | Confirm |
| Escape (in dialog) | Cancel |
| Ctrl+F | Focus filter box |

---

## 💡 Pro Tips

### Tip 1: Fast Filtering
Instead of scrolling through 504 keywords, just type:
- "PhD" → See only PhD keywords
- "Professor" → See only professor keywords
- "AI" → See only AI keywords

### Tip 2: Batch Selection
To search specific category:
1. Filter keywords (e.g., "PhD")
2. Click "Select All"
3. Run search with just those

### Tip 3: Save Time with Cache
Enable "Use Cache" to:
- Speed up repeat searches
- Test different export formats
- Avoid hitting rate limits

### Tip 4: Test Connection First
Always click "Test Connection" before searching:
- Verifies SearxNG is running
- Checks JSON format is enabled
- Saves time if there's an issue

### Tip 5: Monitor Progress
Watch the Output Console during searches:
- See which query is running
- Check how many results per page
- Spot errors immediately

---

## 🎯 Use Cases

### Research Project
```
Goal: Comprehensive faculty directory
Keywords: All professor variations (filter: "Professor")
Settings: Cache enabled, ALL formats
Time: 20-30 minutes for complete search
Output: Full faculty list with profiles
```

### Recruitment Search
```
Goal: Find PhD candidates in ML
Keywords: PhD + ML combinations (filter: "PhD ML")
Settings: Cache enabled, CSV format
Time: 5-10 minutes
Output: Targeted candidate list
```

### Quick Lookup
```
Goal: Check specific research area
Keywords: 3-5 custom keywords
Settings: Default settings
Time: 2-3 minutes
Output: Quick results in HTML report
```

---

## 🚀 Getting Started Checklist

- [ ] Ensure SearxNG is running (http://localhost:8888)
- [ ] JSON format enabled in SearxNG settings
- [ ] Launch UI (double-click Launch-UI.bat)
- [ ] Test connection (click "Test Connection")
- [ ] Load or add keywords
- [ ] Configure search settings
- [ ] Run your first search
- [ ] Review results in auto-opened report
- [ ] Explore results/reports/logs folders

---

**Ready to start? Launch the UI and follow the visual guide!**

