# 📖 SearxNG LinkedIn Collector - Complete Usage Guide

## 🎯 Table of Contents

1. [Getting Started](#getting-started)
2. [Interactive Wizard](#interactive-wizard)
3. [Manual Mode](#manual-mode)
4. [Query Builder](#query-builder)
5. [Search Configuration](#search-configuration)
6. [Viewing Results](#viewing-results)
7. [Advanced Features](#advanced-features)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- ✅ **SearxNG** running (default: `http://localhost:8888`)
- ✅ **Node.js** installed (for API server and React UI)
- ✅ **PowerShell** scripts in project directory

### Quick Start (3 Steps)

```bash
# Step 1: Start SearxNG (if not running)
# Your SearxNG instance should be accessible

# Step 2: Start API Server
node api-server.js
# Runs on port 3001

# Step 3: Start React UI
cd searx-ui
npm run dev
# Opens at http://localhost:5174
```

### First-Time Setup

1. Open `http://localhost:5174` in your browser
2. Click **"Launch Wizard"** in the top navigation
3. Follow the 4-step guided setup
4. Your first search will run automatically!

---

## 🧙‍♂️ Interactive Wizard

The Interactive Wizard is the **easiest way** to get started. It guides you through the entire process step-by-step.

### How to Access

Click **"Launch Wizard"** button in the top toolbar (next to the search icon)

### Wizard Steps

#### Step 1: Choose Mode

Select from three modes:

**🎯 Simple Mode**
- Add keywords one at a time
- Best for: Straightforward searches with 5-20 keywords
- Example: "Stanford AI", "MIT Robotics", "Harvard CS"

**⚡ Advanced Mode**
- Load keywords from file or use presets
- Best for: Bulk searches with 50+ keywords
- Includes preset templates (Stanford, Tech Roles, Research)

**🔧 Query Builder Mode**
- Create Boolean AND/OR combinations
- Best for: Complex targeted searches
- Example: Find "Stanford OR MIT" students in "AI OR ML"

#### Step 2: Configure Keywords

Based on your selected mode:

**Simple Mode:**
- Type keyword and press Enter or click Add
- Keywords appear as chips
- Remove any keyword with the X button
- Minimum 1 keyword required

**Advanced Mode:**
- Choose from preset templates:
  - Stanford Keywords (4 defaults)
  - Tech Roles (4 job titles)
  - Research Positions (4 academic roles)
- Or paste keywords (one per line) in text area
- Bulk import hundreds of keywords

**Query Builder Mode:**
- Preview how Query Builder works
- Actual builder opens after wizard completes
- Create complex multi-group queries

#### Step 3: Search Settings

Configure your search parameters:

**SearxNG Connection:**
- URL where SearxNG is running
- Work directory for saving results
- Default values work for most users

**Performance Options:**
- ⚡ **Parallel Execution**: Run multiple searches at once (3-5x faster)
  - Threads: 1-10 (recommended: 5)
- 💾 **Use Cache**: Save results for 24 hours
- 📝 **Verbose Logging**: Detailed console output

**Export & Timing:**
- **Export Format**: ALL (recommended), CSV, JSON, TXT, or HTML
- **Delay**: Seconds between requests (1-10, recommended: 2-3)
- **Max Retries**: Retry failed requests (1-5, recommended: 3)

#### Step 4: Review & Run

Final review before search:

- ✅ See complete configuration summary
- ✅ View all keywords
- ✅ Estimated time calculation
- ✅ One-click "Start Search" button

After clicking **"Start Search"**:
- Wizard closes automatically
- Search begins immediately (or Query Builder opens if that mode)
- Progress tracked in real-time
- Results appear in Results tab when complete

---

## 🎯 Manual Mode

For users who prefer direct control, use the Search tab interface.

### Keyword Management

**Add Keywords:**
1. Click **"+ Add"** button
2. Enter keyword in dialog
3. Click OK or press Enter

**Edit Keywords:**
1. Select ONE keyword from list
2. Click **"✏️ Edit"** button
3. Modify keyword
4. Click Save

**Delete Keywords:**
1. Select one or more keywords
2. Click **"🗑️ Delete"** button
3. Confirm deletion

**Bulk Operations:**
- **Select All**: Check all filtered keywords
- **Deselect**: Uncheck all keywords
- **Clear All**: Remove all keywords (with confirmation)

### Filtering

Use the search box at top of keyword list:
- Type to filter keywords in real-time
- Case-insensitive matching
- Filter applies to display only (original list unchanged)

### Selection Behavior

- Click checkbox or row to select keyword
- Multi-select with Ctrl+Click (standard behavior)
- Selected keywords tracked separately from filtered view
- Search uses selected keywords (or all if none selected)

---

## 🔧 Query Builder

Create complex Boolean search queries with automatic combination generation.

### Accessing Query Builder

Click green **"Query Builder"** button in keyword panel

### How It Works

1. **Create Groups**: Each group holds related keywords
2. **Choose Operator**: AND or OR for each group
3. **Add Keywords**: Type and press Enter or click Add
4. **Generate**: Click "Generate Queries" button
5. **Auto-Load**: Generated queries added to keyword list

### Example Walkthrough

**Goal**: Find CS PhDs at top universities

**Step 1 - Universities (OR):**
- Add "Stanford"
- Add "MIT"
- Add "Harvard"
- Set operator to OR (any university)

**Step 2 - Field (AND):**
- Add "Computer Science"
- Set operator to AND (must have)

**Step 3 - Status (OR):**
- Add "PhD"
- Add "PhD student"
- Add "Doctoral"
- Set operator to OR (any status)

**Result**: 3 × 1 × 3 = **9 queries generated**

### Generated Queries Preview

```
1. Stanford OR "Computer Science" AND PhD
2. Stanford OR "Computer Science" AND "PhD student"
3. Stanford OR "Computer Science" AND Doctoral
4. MIT OR "Computer Science" AND PhD
5. MIT OR "Computer Science" AND "PhD student"
6. MIT OR "Computer Science" AND Doctoral
7. Harvard OR "Computer Science" AND PhD
8. Harvard OR "Computer Science" AND "PhD student"
9. Harvard OR "Computer Science" AND Doctoral
```

### Query Builder Features

- ✅ **Unlimited Groups**: Add as many groups as needed
- ✅ **Live Counter**: See query count update in real-time
- ✅ **Copy All**: Export queries to clipboard
- ✅ **Validation**: Can't generate with empty groups
- ✅ **Auto-Quoting**: Multi-word terms wrapped in quotes

### Complex Example

**Find tech workers in multiple cities:**

```
Group 1 (OR): San Francisco, Seattle, Austin, Boston
Group 2 (OR): Software Engineer, DevOps, Data Scientist
Group 3 (AND): Senior, Staff, Principal
Group 4 (OR): Python, Go, Rust

Result: 4 × 3 × 3 × 3 = 108 queries
```

---

## ⚙️ Search Configuration

### SearxNG Settings

**SearxNG URL:**
- Default: `http://localhost:8888`
- Change if running on different host/port
- Must include `http://` or `https://`

**Work Directory:**
- Where results/reports/logs are saved
- Default: `C:\SearxQueries`
- Creates subdirectories automatically:
  - `results/` - CSV, JSON, TXT files
  - `reports/` - HTML reports
  - `logs/` - Search logs
  - `cache/` - Cached results

### Performance Options

**⚡ Parallel Execution:**
- **ON**: Run multiple searches simultaneously
- **OFF**: Run searches one at a time
- **Threads**: 1-10 concurrent searches
  - 1-3: Conservative (low system impact)
  - 4-5: Balanced (recommended)
  - 6-10: Aggressive (max speed, higher load)

**💾 Use Cache:**
- Saves search results for 24 hours
- Avoids re-scraping same queries
- Speeds up repeated searches
- Recommended: Always ON

**📝 Verbose Output:**
- Detailed progress logging
- Shows each step of search process
- Helpful for debugging
- Recommended: ON for first-time users

### Export Formats

| Format | Use Case | File Extension |
|--------|----------|----------------|
| **CSV** | Excel, Google Sheets, data analysis | `.csv` |
| **JSON** | Programming, API integration | `.json` |
| **TXT** | Simple URL list | `.txt` |
| **HTML** | Professional reports with stats | `.html` |
| **ALL** | Generate all formats at once | All above |

### Timing Settings

**Delay (seconds):**
- Pause between search requests
- Range: 1-10 seconds
- Recommended: 2-3 seconds
- Higher delay = more polite to servers

**Max Retries:**
- Retry failed requests
- Range: 1-5 attempts
- Recommended: 3 retries
- Exponential backoff between retries

---

## 📊 Viewing Results

### Results Tab

After search completes, results automatically open in the Results tab.

**Features:**
- 📄 **Recent Reports Dropdown**: Select from up to 10 recent searches
- 🔄 **Refresh**: Reload reports list
- 🌐 **Open in Browser**: View full HTML report
- 💾 **Export**: Save report to custom location

### Result Display

Each result shows:
- **Profile Title**: Name and position
- **LinkedIn URL**: Clickable link to profile
- **Keyword**: Which search found this profile
- **Engine**: Which search engine returned result

### Statistics

HTML reports include:
- Total profiles found
- Unique profiles (after deduplication)
- Keywords searched
- Execution time
- Results per keyword

---

## 🎓 Advanced Features

### Connection Testing

Click **"🔌 Test Connection"** before searching:
- Verifies SearxNG is accessible
- Tests API server connection (if using)
- Shows detailed error messages if fails

### Console Output

Real-time logging in console panel:
- Timestamps for all events
- Search progress updates
- Error messages and warnings
- Configuration summaries
- Completion statistics

### Progress Tracking

During search, monitor:
- Progress bar (visual percentage)
- Current keyword being searched
- X of Y completion status
- Estimated time remaining

### Snackbar Notifications

Toast-style notifications for:
- ✅ Success messages (green)
- ❌ Error alerts (red)
- ℹ️ Info messages (blue)
- Auto-dismiss after 6 seconds
- Click X to dismiss immediately

---

## 🐛 Troubleshooting

### Connection Failed

**Error**: "Failed to connect to SearxNG"

**Solutions:**
1. Check SearxNG is running: `http://localhost:8888`
2. Verify URL in configuration is correct
3. Check firewall isn't blocking connection
4. Try restarting SearxNG: `.\Restart-SearxNG.ps1`

### Search Not Starting

**Error**: "Backend API not responding"

**Solutions:**
1. Start API server: `node api-server.js`
2. Check port 3001 is not in use
3. Verify PowerShell scripts exist in project root
4. Check Node.js is installed: `node --version`

### No Results Found

**Possible Causes:**
1. Keywords too specific (try broader terms)
2. SearxNG engines not configured for LinkedIn
3. LinkedIn blocking requests (use delays)
4. No matching profiles exist

**Solutions:**
1. Test keywords manually in SearxNG first
2. Enable verbose logging to see detailed errors
3. Increase delay between requests
4. Try different keyword combinations

### Slow Performance

**Issue**: Searches taking too long

**Optimizations:**
1. Enable parallel execution (5 threads)
2. Reduce keywords per batch
3. Enable caching for repeated searches
4. Increase throttle limit to 8
5. Reduce delay to 1-2 seconds

### Query Builder Not Generating

**Issue**: Generate button disabled or no queries

**Fixes:**
1. Ensure all groups have at least one keyword
2. Remove empty groups
3. Check operators are selected
4. Try refreshing page

---

## ✅ Best Practices

### Keyword Strategy

**DO:**
- ✅ Use specific, targeted keywords
- ✅ Include variations ("AI" and "Artificial Intelligence")
- ✅ Test 5-10 keywords before scaling
- ✅ Use Query Builder for combinations

**DON'T:**
- ❌ Use overly generic terms ("engineer")
- ❌ Start with 100+ keywords untested
- ❌ Ignore results quality
- ❌ Skip connection testing

### Performance Optimization

**For Small Searches (1-20 keywords):**
```
Mode: Sequential
Delay: 2 seconds
Cache: ON
Export: ALL
```

**For Medium Searches (20-100 keywords):**
```
Mode: Parallel (5 threads)
Delay: 2-3 seconds
Cache: ON
Export: ALL
Verbose: ON
```

**For Large Searches (100-500 keywords):**
```
Mode: Parallel (5-8 threads)
Delay: 3 seconds
Cache: ON
Export: CSV + JSON (faster than ALL)
Verbose: OFF (reduces console overhead)
Max Retries: 3
```

### Query Building Best Practices

1. **Start Specific**: Begin with narrow queries, broaden if needed
2. **Test Samples**: Generate 5-10 queries, test before full run
3. **Use Presets**: Leverage preset templates in wizard
4. **Monitor Quality**: Check first few results for relevance
5. **Iterate**: Refine queries based on results

### Data Management

**Organization:**
- Use descriptive keyword files
- Export ALL formats for flexibility
- Keep reports organized by date
- Review logs for errors

**Efficiency:**
- Enable caching for repeated searches
- Delete old cache files periodically
- Export results to external storage
- Clean up logs folder monthly

---

## 🎬 Common Workflows

### Workflow 1: Find University Students

1. **Launch Wizard** → Choose Simple Mode
2. **Add Keywords**:
   - "Stanford Computer Science student"
   - "MIT Computer Science PhD"
   - "Harvard CS graduate"
3. **Configure**: Parallel ON, Cache ON
4. **Run Search**: Auto-starts after wizard
5. **View Results**: Switch to Results tab
6. **Export**: Click Export button for CSV

**Expected Time**: 30-60 seconds  
**Expected Results**: 20-50 profiles

### Workflow 2: Complex Boolean Search

1. **Launch Wizard** → Choose Query Builder Mode
2. **Complete Wizard**: Set basic settings
3. **Query Builder Opens**: Automatically after wizard
4. **Create Groups**:
   - Group 1 (OR): Stanford, MIT, Caltech
   - Group 2 (AND): Computer Science
   - Group 3 (OR): PhD, Professor, Researcher
5. **Generate**: 3 × 1 × 3 = 9 queries
6. **Search Runs**: Automatically with generated queries
7. **View Results**: Monitor progress in console

**Expected Time**: 1-2 minutes  
**Expected Results**: 30-100 profiles

### Workflow 3: Tech Recruiting

1. **Manual Mode**: Add keywords directly
2. **Keywords**:
   - "Senior Software Engineer San Francisco"
   - "Tech Lead Python AWS"
   - "Engineering Manager startup"
3. **Settings**: Sequential, 3s delay (polite)
4. **Run**: Click Run Search
5. **Export**: Download CSV for ATS system

**Expected Time**: 2-3 minutes  
**Expected Results**: 50-150 profiles

---

## 📈 Performance Guidelines

### Query Count Recommendations

| Queries | Mode | Threads | Delay | Est. Time |
|---------|------|---------|-------|-----------|
| 1-5 | Sequential | 1 | 2s | 10-25s |
| 5-20 | Sequential | 1 | 2s | 40-120s |
| 20-50 | Parallel | 3-5 | 2s | 80-200s |
| 50-100 | Parallel | 5 | 3s | 300-600s |
| 100-200 | Parallel | 5-8 | 3s | 600-1200s |
| 200+ | Batch | 5-8 | 3s | Run in batches |

### System Resource Usage

**Low (1-3 threads):**
- CPU: 10-20%
- Memory: 200-500 MB
- Network: Moderate

**Medium (4-5 threads):**
- CPU: 20-40%
- Memory: 500-800 MB
- Network: High

**High (6-10 threads):**
- CPU: 40-60%
- Memory: 800-1200 MB
- Network: Very High

---

## 🎓 Advanced Usage Tips

### Combining Features

**Wizard + Query Builder:**
1. Start wizard in Query Builder mode
2. Configure basic settings
3. Query Builder opens automatically
4. Generate complex queries
5. Search runs with wizard settings

**Manual + Presets:**
1. Use Advanced Mode in wizard
2. Load preset keywords
3. Close wizard
4. Manually refine in Search tab
5. Add/remove specific keywords
6. Run search when ready

### Keyboard Shortcuts

- **Enter**: Add keyword (in input fields)
- **Esc**: Close dialogs
- **Ctrl+A**: Select all (in keyword list)

### Result Analysis

**Quality Check:**
1. Sample 10 random results
2. Verify relevance to keywords
3. Check for false positives
4. Refine keywords if needed

**Export Strategy:**
- **CSV**: For Excel analysis and filtering
- **JSON**: For custom scripts or databases
- **HTML**: For presentations or reports
- **TXT**: For quick URL extraction

---

## 📚 Usage Scenarios

### Scenario 1: Academic Research

**Goal**: Find AI researchers at top universities

**Approach:**
1. Launch Wizard → Query Builder Mode
2. Group 1 (OR): Stanford, MIT, UC Berkeley, CMU
3. Group 2 (AND): Artificial Intelligence, Machine Learning
4. Group 3 (OR): Professor, Research Scientist, Postdoc
5. Generate: 4 × 2 × 3 = 24 queries
6. Enable cache, parallel (5 threads)
7. Run and export to JSON for database import

### Scenario 2: Talent Acquisition

**Goal**: Find senior engineers in Bay Area

**Approach:**
1. Manual Mode
2. Keywords:
   - "Senior Software Engineer San Francisco"
   - "Staff Engineer Bay Area"
   - "Principal Engineer Silicon Valley"
3. Sequential mode (polite to LinkedIn)
4. 3-second delay
5. Export to CSV for ATS import

### Scenario 3: Market Research

**Goal**: Analyze startup founders in AI space

**Approach:**
1. Query Builder
2. Group 1 (OR): Founder, Co-Founder, CEO
3. Group 2 (AND): AI, Artificial Intelligence, Machine Learning
4. Group 3 (AND): startup, company
5. Generate: 3 × 3 × 2 = 18 queries
6. Parallel (3 threads), cache ON
7. Export ALL formats for comprehensive analysis

---

## 🎯 Tips for Maximum Success

### Before Searching

1. ✅ Test SearxNG connection
2. ✅ Start with 5-10 test keywords
3. ✅ Review generated queries (Query Builder)
4. ✅ Enable verbose logging first time
5. ✅ Check disk space for results

### During Search

1. 📊 Monitor progress bar
2. 📝 Watch console for errors
3. ⏸️ Use Stop button if issues arise
4. 🔍 Check first few results for quality

### After Search

1. 📄 Review HTML report statistics
2. 📊 Open CSV in Excel for analysis
3. 🔗 Verify profile URLs are accessible
4. 🗂️ Archive results if needed
5. 🧹 Clear old cache files

---

## 🆘 Getting Help

### Check Console Output

The console shows detailed information:
- Connection status
- Search progress
- Error messages
- Completion statistics

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Connection refused" | SearxNG not running | Start SearxNG |
| "404 Not Found" | Wrong URL | Check SearxNG URL |
| "Timeout" | Request too slow | Increase timeout |
| "No results" | No matches | Try broader keywords |

### Support Resources

- **FEATURES.md**: Detailed feature documentation
- **example-queries/**: Sample configurations
- **REACT_CONVERSION_SUMMARY.md**: Technical details
- **Console Output**: Real-time debugging info

---

## 🎉 Success Checklist

After completing this guide, you should be able to:

- ✅ Use the Interactive Wizard to run searches
- ✅ Manage keywords (add, edit, delete, filter)
- ✅ Create complex queries with Query Builder
- ✅ Configure search settings appropriately
- ✅ Monitor search progress in real-time
- ✅ View and export results in multiple formats
- ✅ Troubleshoot common issues
- ✅ Optimize performance for your needs

---

## 🚀 Next Steps

Now that you've mastered the basics:

1. **Try the Wizard**: Launch it and complete a search
2. **Experiment with Query Builder**: Create complex queries
3. **Review Example Queries**: See `example-queries/` directory
4. **Optimize Settings**: Fine-tune for your use case
5. **Scale Up**: Run larger batches with confidence

Happy searching! 🎯

