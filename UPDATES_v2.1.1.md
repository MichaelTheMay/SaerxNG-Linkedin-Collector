# Updates v2.1.1 - Bug Fixes & Optimizations

## 🐛 Bug Fixes

### SearxQueriesUI.ps1
Fixed critical issues in the graphical interface:

1. **Timer Null Reference Error**
   - Changed `$timer` to `$script:timer` for proper scope
   - Initialized timer in global state section
   - Fixed timer cleanup in stop button handler

2. **Parameter Passing Error**
   - Fixed argument passing to background job
   - Changed from string concatenation to hashtable splatting
   - Keywords now properly passed as array
   - Export format correctly passed as string

3. **Type Conversion**
   - Added proper type casting for DelaySeconds and MaxRetries
   - Ensured ComboBox content is converted to string

**Before:**
```powershell
$args = @(
    "-Keywords", ($keywordsToSearch -join '","'),  # Wrong!
    ...
)
```

**After:**
```powershell
$searchParams = @{
    Keywords = $keywordsToSearch  # Correct - array
    ExportFormat = $exportFormatCombo.SelectedItem.Content.ToString()
    ...
}
```

## 📝 Documentation Optimizations

Simplified all documentation for better GitHub readability:

### README.md (880 → 350 lines)
- Condensed to essential information
- Better structure with quick links at top
- Removed redundant examples
- Focused on key features

### UI_GUIDE.md (850 → 180 lines)
- Streamlined to common tasks
- Removed verbose explanations
- Quick reference format
- Links to UI_WORKFLOW for details

### QUICK_START.md (120 → 75 lines)
- Essential setup only
- Removed redundant info
- Clear troubleshooting section
- Fast-track getting started

### CHANGELOG.md (99 → 70 lines)
- Cleaner format
- Grouped changes logically
- Removed verbose descriptions

### FILES_OVERVIEW.md (440 → 150 lines)
- Quick reference format
- Table-based layout
- Essential navigation only

### UI_WORKFLOW.md (335 → 180 lines)
- Visual ASCII art layout
- Common workflows only
- Quick tips section

## 🔧 New Files

### .gitignore
- Ignores output directories (results, reports, logs, cache)
- Keeps .gitkeep files for structure
- Windows-specific ignores
- IDE ignores

## ✅ Benefits

### For Users
- **UI works correctly** - No more crashes
- **Faster reading** - Concise documentation
- **Better navigation** - Quick links everywhere
- **GitHub-friendly** - Proper markdown formatting

### For Developers
- **Clean repo** - Output files not tracked
- **Better structure** - Organized documentation
- **Easy maintenance** - Shorter files
- **Quick reference** - Easy to find info

## 📊 Documentation Size Comparison

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| README.md | 880 | 350 | 60% |
| UI_GUIDE.md | 850 | 180 | 79% |
| QUICK_START.md | 120 | 75 | 38% |
| CHANGELOG.md | 99 | 70 | 29% |
| FILES_OVERVIEW.md | 440 | 150 | 66% |
| UI_WORKFLOW.md | 335 | 180 | 46% |
| **Total** | **2,724** | **1,005** | **63%** |

## 🚀 Testing

To test the fixes:

```powershell
# Test UI
.\SearxQueriesUI.ps1

# Or double-click
Launch-UI.bat

# Try these actions:
1. Load keywords
2. Test connection
3. Run search with 2-3 keywords
4. Stop search (test stop button)
5. Check results open automatically
```

## 📝 Migration Notes

No user action required. Changes are backward compatible:
- Existing keyword files work
- CLI unchanged
- Output format unchanged
- Same folder structure

## 🎯 Next Steps

1. Test UI thoroughly
2. Report any issues
3. Enjoy faster, more stable experience!

---

**Version**: 2.1.1  
**Date**: October 8, 2025  
**Type**: Bug fix & optimization release

