# ⚡ Quick Reference Card

## 🚀 Getting Started (60 Seconds)

```bash
# Terminal 1: Start API Server
node api-server.js

# Terminal 2: Start React UI
cd searx-ui && npm run dev

# Browser: Open http://localhost:5174
# Click: "Launch Wizard" → Follow 4 steps → Done!
```

---

## 🧙‍♂️ Interactive Wizard Quick Guide

| Step | What To Do | Time |
|------|------------|------|
| 1. Choose Mode | Simple / Advanced / Query Builder | 10s |
| 2. Add Keywords | Type or paste keywords | 30s |
| 3. Configure | Accept defaults or customize | 20s |
| 4. Review & Run | Click "Start Search" | 5s |

**Total Time to First Search: ~1 minute**

---

## 🔧 Query Builder Cheat Sheet

### Basic Structure
```
Group 1 (OPERATOR): keyword1, keyword2, keyword3
Group 2 (OPERATOR): keywordA, keywordB
Group 3 (OPERATOR): term1, term2, term3

Total Queries = 3 × 2 × 3 = 18
```

### Operators
- **AND**: Must have ALL keywords from group
- **OR**: Can have ANY keyword from group

### Quick Examples

**Find students at universities:**
```
Group 1 (OR): Stanford, MIT, Harvard
Group 2 (AND): Computer Science
Group 3 (OR): student, PhD
= 3 × 1 × 2 = 6 queries
```

**Find engineers in cities:**
```
Group 1 (AND): San Francisco, Seattle
Group 2 (OR): Software Engineer, DevOps
= 2 × 2 = 4 queries
```

---

## ⚙️ Configuration Defaults

| Setting | Default | Range | Recommendation |
|---------|---------|-------|----------------|
| Parallel | ON | - | Always ON |
| Threads | 5 | 1-10 | 5 for most, 8 for fast systems |
| Cache | ON | - | Always ON |
| Verbose | ON | - | ON for beginners |
| Export | ALL | - | ALL (get everything) |
| Delay | 2s | 1-10s | 2-3s standard |
| Retries | 3 | 1-5 | 3 is good |

---

## 📊 Performance Guide

| Queries | Mode | Threads | Time Estimate |
|---------|------|---------|---------------|
| 1-10 | Sequential | 1 | 20-100s |
| 10-20 | Parallel | 3 | 40-80s |
| 20-50 | Parallel | 5 | 80-200s |
| 50-100 | Parallel | 5 | 300-600s |
| 100-200 | Parallel | 8 | 400-800s |

---

## 🎯 Common Tasks

### Add Keywords (3 ways)

**Method 1: Wizard**
1. Launch Wizard
2. Simple Mode → Type keywords
3. Advanced Mode → Paste list
4. Query Builder → Generate combinations

**Method 2: Manual**
1. Search tab → "+ Add" button
2. Type keyword → OK

**Method 3: Query Builder**
1. "Query Builder" button
2. Create groups → Generate

### Run a Search

**Quick Way:**
1. Wizard → Follow steps → Auto-runs

**Manual Way:**
1. Add keywords
2. Test Connection
3. Click "Run Search"

### View Results

**After Search:**
- Auto-switches to Results tab
- Select from Recent Reports dropdown
- Click rows to see details
- "Open in Browser" for full HTML
- "Export" to save copy

---

## 🔍 Search Modes Comparison

| Feature | Simple | Advanced | Query Builder |
|---------|--------|----------|---------------|
| Ease of Use | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Speed | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| Flexibility | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| Keywords | 5-20 | 50-500 | 10-100 |
| Best For | Beginners | Bulk | Precision |

---

## 💡 Top 10 Tips

1. **🧙 Start with Wizard**: Easiest path to first search
2. **⚡ Enable Parallel**: 3-5x faster searches
3. **💾 Always Cache**: Avoid duplicate work
4. **🔧 Use Query Builder**: For AND/OR logic
5. **📊 Export ALL**: Get all formats at once
6. **🧪 Test Small**: 5-10 keywords first
7. **📝 Check Console**: Monitor for errors
8. **🔌 Test Connection**: Before every session
9. **📁 Organize Results**: Use descriptive names
10. **📖 Read Guide**: Check USAGE_GUIDE.md

---

## 🐛 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Connection failed | Start SearxNG: check port 8888 |
| Search won't run | Start API: `node api-server.js` |
| No results | Use broader keywords |
| Too slow | Enable parallel (5 threads) |
| Wizard stuck | Ensure fields filled correctly |
| Query Builder empty | Add keywords to each group |

---

## 📋 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Add keyword / Submit |
| Esc | Close dialogs |
| Ctrl+A | Select all (keyword list) |
| Tab | Navigate form fields |

---

## 🎨 UI Navigation

### Top Navigation Bar
- **🧙 Launch Wizard**: Opens step-by-step wizard
- **❓ Guide**: Opens usage guide dialog
- **Keywords Count**: Shows total keywords
- **Selected Count**: Shows selected keywords

### Search Tab
- **Left Panel**: Keyword list with management
- **Right Panel**: Configuration options
- **Bottom**: Console output and controls

### Results Tab
- **Top**: Recent reports dropdown and actions
- **Main**: Results display with clickable links

---

## 📖 Documentation Links

- **[USAGE_GUIDE.md](../USAGE_GUIDE.md)** - Complete usage guide
- **[WIZARD_GUIDE.md](WIZARD_GUIDE.md)** - Interactive Wizard details
- **[FEATURES.md](FEATURES.md)** - All features explained
- **[example-queries/](../example-queries/)** - Query Builder examples

---

## 🎯 Next Steps

1. ✅ Launch the wizard
2. ✅ Complete your first search
3. ✅ Try Query Builder
4. ✅ Read full USAGE_GUIDE.md
5. ✅ Explore example queries

---

## 💬 Quick Help

**Stuck?**
1. Click "Guide" button (top navigation)
2. Read error messages in console
3. Check USAGE_GUIDE.md
4. Verify SearxNG is running

**Want Examples?**
- See `example-queries/` folder
- Use Wizard presets
- Check WIZARD_GUIDE.md

---

**Ready to search? Click "Launch Wizard" now!** 🚀

