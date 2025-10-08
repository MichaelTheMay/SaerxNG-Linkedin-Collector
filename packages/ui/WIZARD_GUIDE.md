# 🧙‍♂️ Interactive Wizard - Complete Guide

## Overview

The Interactive Wizard is a step-by-step guided interface that makes running LinkedIn searches incredibly easy, even for first-time users.

## ✨ Why Use the Wizard?

- **🎯 No Configuration Needed**: Smart defaults for everything
- **📝 Guided Process**: Clear instructions at each step
- **✅ Validation**: Can't proceed with invalid settings
- **🚀 Auto-Execution**: Search runs automatically after setup
- **💡 Help Text**: Explanations for every option
- **⏱️ Time Estimates**: Know how long search will take

## 🚀 How to Launch

### From React UI
1. Open `http://localhost:5174`
2. Click **"Launch Wizard"** button in top navigation bar
3. Wizard opens in full-screen dialog

### First-Time Users
The wizard is recommended for your first search to understand all options.

## 📖 Step-by-Step Walkthrough

### Step 1: Choose Mode (5 seconds)

Three modes to choose from:

#### 🎯 Simple Mode
**Best for:** 5-20 straightforward keywords

**Features:**
- Add keywords one at a time
- No file imports needed
- Quick and easy
- Perfect for testing

**Example Keywords:**
- "Stanford Computer Science"
- "MIT Artificial Intelligence"
- "Harvard Data Science"

**When to Use:**
- First-time users
- Quick searches
- Testing keywords
- Learning the system

---

#### ⚡ Advanced Mode
**Best for:** 50+ keywords or bulk imports

**Features:**
- Preset keyword templates
- Bulk text input (one per line)
- File import capability
- Faster for large lists

**Preset Templates:**
- **Stanford Keywords**: 4 Stanford-related searches
- **Tech Roles**: 4 common tech job titles
- **Research Positions**: 4 academic roles

**When to Use:**
- Have keyword file ready
- Need 50+ keywords
- Using proven keyword sets
- Batch processing

---

#### 🔧 Query Builder Mode
**Best for:** Complex Boolean logic searches

**Features:**
- AND/OR operator combinations
- Multiple keyword groups
- Automatic query generation
- Cartesian product of all groups

**What Happens:**
1. Wizard completes basic setup
2. Query Builder opens automatically
3. Create complex query groups
4. Generate all combinations
5. Search runs with generated queries

**When to Use:**
- Need Boolean logic (AND/OR)
- Want all combinations of terms
- Targeting specific profiles
- Advanced users

---

### Step 2: Configure Keywords (1-5 minutes)

Content varies by mode selected:

#### Simple Mode Interface

**Add Keywords:**
1. Type keyword in text field
2. Press Enter or click "Add" button
3. Keyword appears as colored chip below
4. Repeat for all keywords

**Remove Keywords:**
- Click X on any chip to remove

**Tips:**
- Add 5-10 keywords to start
- Test quality before adding more
- Use specific, targeted terms

---

#### Advanced Mode Interface

**Quick Presets:**

Click any preset button to load:
- **Stanford Keywords**: Loads 4 Stanford searches
- **Tech Roles**: Loads 4 tech job titles
- **Research Positions**: Loads 4 academic roles

**Bulk Input:**

Use the multi-line text area:
```
Stanford AI
Stanford Machine Learning
MIT Computer Science
Harvard Data Science
```

- One keyword per line
- Blank lines ignored
- Real-time count shown below

**Tips:**
- Paste from existing files
- Use presets as starting point
- Edit bulk text directly
- See count update live

---

#### Query Builder Mode Interface

**Preview Mode:**

Shows what Query Builder does:
- Explains AND/OR logic
- Shows example configuration
- Displays query count formula
- Button to continue wizard

**After Wizard:**
Query Builder will open automatically with:
- Your configured settings pre-loaded
- Ready to create groups
- Generate and auto-search

---

### Step 3: Search Settings (1-2 minutes)

Configure how your search runs:

#### 🔧 SearxNG Connection

**SearxNG URL:**
- Default: `http://localhost:8888`
- Change if custom port/host
- Include `http://` or `https://`

**Work Directory:**
- Default: `C:\SearxQueries`
- Where results are saved
- Auto-creates subdirectories

**Tips:**
- Use defaults unless you have custom setup
- Ensure directory exists and is writable
- Use absolute paths

---

#### ⚡ Performance Options

**Parallel Execution:**
- **Checkbox**: ON = parallel, OFF = sequential
- **Threads Slider**: 1-10 concurrent searches
  - 1-3: Safe, low resource
  - 4-5: Balanced (recommended)
  - 6-10: Fast, high resource

**Explanation Text:**
"Run multiple searches at once (3-5x faster)"

**Use Cache:**
- **Checkbox**: ON (recommended)
- Saves results for 24 hours
- Avoids duplicate work

**Explanation Text:**
"Save results for 24 hours to avoid re-scraping"

**Verbose Logging:**
- **Checkbox**: ON for beginners
- Detailed console output
- Helps with debugging

**Explanation Text:**
"Show detailed progress information"

---

#### 📊 Export & Timing

**Export Format:**
- **Radio Buttons**: ALL, CSV, JSON, TXT, or HTML
- **Recommended**: ALL (generates all formats)

**Delay (seconds):**
- **Number Input**: 1-10
- **Default**: 2
- **Recommended**: 2-3
- Time between requests

**Max Retries:**
- **Number Input**: 1-5
- **Default**: 3
- How many times to retry failures

**Helper Text:**
Each field has explanatory text below

---

### Step 4: Review & Run (30 seconds)

Final confirmation and launch:

#### Summary Display

**Configuration Summary:**
```
✓ Mode: 🎯 Simple Mode
✓ Keywords: 8 keyword(s) configured
✓ SearxNG URL: http://localhost:8888
✓ Performance: ⚡ Parallel (5 threads)
✓ Options: Cache: On | Verbose: On | Export: ALL
✓ Timing: 2s delay, 3 max retries
```

#### Keywords List

Scrollable view of all your keywords:
```
1. Stanford Computer Science
2. MIT Artificial Intelligence
3. Harvard Data Science
... (all keywords shown)
```

#### Time Estimate

```
⚠️ Estimated time: 16 seconds (parallel mode)
```

Calculation:
```
keywords × delay / threads = time
8 × 2 / 5 = 3.2 (rounded up)
```

#### Action Buttons

- **⬅️ Back**: Return to settings
- **▶️ Start Search**: Begin search immediately
- **Cancel**: Close wizard without searching

---

## 🎯 After Wizard Completes

### Simple & Advanced Mode

1. **Wizard Closes**: Dialog dismisses automatically
2. **Configuration Applied**: All settings loaded
3. **Search Starts**: Begins within 0.5 seconds
4. **Progress Shown**: Watch in Search tab
5. **Results Display**: Auto-switch to Results tab when done

### Query Builder Mode

1. **Wizard Closes**: Dialog dismisses
2. **Configuration Saved**: Settings applied
3. **Query Builder Opens**: New dialog appears (0.3s delay)
4. **Create Queries**: Build your AND/OR groups
5. **Generate**: Click generate button
6. **Search Starts**: Immediately with generated queries

---

## 💡 Wizard Tips & Tricks

### For Beginners

1. **Start with Simple Mode**: Learn the basics
2. **Use 5 Keywords**: Test before scaling
3. **Keep Defaults**: They work great
4. **Enable Verbose**: See what's happening
5. **Watch Console**: Learn from output

### For Advanced Users

1. **Skip to Advanced Mode**: Bulk import keywords
2. **Use Presets as Templates**: Modify to fit needs
3. **Query Builder for Precision**: Create exact combinations
4. **Optimize Threads**: 8 for fast machines
5. **Reduce Delay**: 1s if SearxNG can handle it

### Time-Saving Tips

1. **Prepare Keywords First**: Have list ready
2. **Use Presets**: Modify instead of creating from scratch
3. **Enable Cache Always**: Massive time saver
4. **Parallel Everything**: Unless politeness required
5. **Export ALL**: Don't run multiple times for formats

---

## 📊 Wizard Decision Tree

```
START
  │
  ├─ New to tool? → Simple Mode
  │   └─ Add 5-10 keywords → Run
  │
  ├─ Have keyword file? → Advanced Mode
  │   └─ Load preset or paste → Run
  │
  └─ Need AND/OR logic? → Query Builder Mode
      └─ Complete wizard → Build queries → Run
```

---

## 🎓 Example Walkthroughs

### Example 1: Complete Beginner (2 minutes)

**Goal**: Find Stanford AI students

**Steps:**
1. Click "Launch Wizard"
2. Select "🎯 Simple Mode"
3. Click Next
4. Add keywords:
   - Type: "Stanford AI student"
   - Press Enter
   - Type: "Stanford Machine Learning PhD"
   - Press Enter
   - Type: "Stanford Computer Science graduate"
   - Press Enter
5. Click Next (accept default settings)
6. Click Next again (accept search settings)
7. Review summary
8. Click "Start Search"

**Result**: Search runs automatically, ~15 seconds

---

### Example 2: Advanced User (1 minute)

**Goal**: Bulk search tech roles

**Steps:**
1. Click "Launch Wizard"
2. Select "⚡ Advanced Mode"
3. Click Next
4. Click "Tech Roles" preset button
5. Click Next
6. Verify settings (defaults fine)
7. Click Next
8. Review (4 keywords loaded)
9. Click "Start Search"

**Result**: Search completes in ~10 seconds

---

### Example 3: Power User (3 minutes)

**Goal**: Complex Boolean search

**Steps:**
1. Click "Launch Wizard"
2. Select "🔧 Query Builder Mode"
3. Click Next
4. Read preview, click Next
5. Configure settings:
   - Parallel: ON (8 threads)
   - Cache: ON
   - Verbose: OFF (faster)
   - Export: CSV (just need CSV)
6. Click Next
7. Review, Click "Start Search"
8. **Query Builder Opens Automatically**
9. Create groups:
   - Group 1 (OR): Stanford, MIT, Harvard
   - Group 2 (AND): Computer Science
   - Group 3 (OR): PhD, Professor
10. Click "Generate Queries" (9 queries)
11. Search runs automatically

**Result**: 9 targeted searches in ~20 seconds

---

## ⚙️ Wizard Configuration

### Settings Persistence

Currently, wizard settings apply to current session:
- Settings saved when wizard completes
- Used for the search that runs
- Not persisted between browser sessions

**Future Enhancement**: Save preferences in localStorage

### Validation Rules

Wizard enforces these rules:
- ✅ Mode must be selected (Step 1)
- ✅ At least 1 keyword required (Step 2)
- ✅ SearxNG URL cannot be empty (Step 3)
- ✅ Work directory cannot be empty (Step 3)
- ✅ Numbers must be in valid ranges

### Smart Defaults

Wizard uses optimal defaults:
```javascript
searxUrl: 'http://localhost:8888'
workDir: 'C:\\SearxQueries'
useCache: true
parallel: true
verbose: true
exportFormat: 'ALL'
throttleLimit: 5
delay: 2
maxRetries: 3
```

---

## 🎬 Video Tutorial (Conceptual)

If this were a video tutorial:

**0:00-0:30** - Introduction and wizard overview  
**0:30-1:30** - Step 1: Choosing mode (show all 3 options)  
**1:30-3:00** - Step 2: Adding keywords (simple, advanced, QB preview)  
**3:00-4:00** - Step 3: Configuration (explain each option)  
**4:00-5:00** - Step 4: Review and launch  
**5:00-6:00** - Watching search run and view results

## 🎉 Summary

The Interactive Wizard makes SearxNG LinkedIn Collector accessible to everyone:

- **Beginners**: Clear guidance through entire process
- **Intermediate**: Quick presets and templates
- **Advanced**: Direct path to complex features
- **All Users**: Optimized defaults that just work

**Launch it now and see how easy searching LinkedIn can be!** 🚀

