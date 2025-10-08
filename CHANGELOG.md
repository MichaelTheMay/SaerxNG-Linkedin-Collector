# Changelog

All notable changes to this project.

## [2.1.2] - 2025-10-08

### Added

**Shared Module**
- SearxHelpers.psm1 with 10 optimized functions
- Format-LinkedInURL, Test-URLValid, Import/Export-KeywordFile
- Invoke-RetryableWebRequest, Show-OptimizedProgress
- Write-OptimizedLog, New-FastHashSet, Initialize-WorkspaceStructure

**Documentation**
- OPTIMIZATIONS.md - Comprehensive optimization guide
- UPDATES_v2.1.2.md - Detailed performance report
- Benchmark results and before/after comparisons
- Migration guide and best practices

### Changed

**Performance (35% faster overall)**
- HashSet-based deduplication (85% faster)
- Direct .NET file I/O (40-50% faster)
- StringBuilder for HTML export (85% faster)
- IndexOf string operations (50-70% faster)
- Generic collections (33% less memory)
- Optimized URL processing and validation
- Reduced string allocations throughout

**Code Quality**
- Consolidated 120+ lines of duplicate UI code
- Created reusable Show-InputDialog function
- Simplified XAML (25% reduction)
- Removed redundant style properties
- Optimized event handlers
- Better code organization

### Fixed
- Improved filter performance in UI
- Faster keyword list operations
- More efficient progress bar rendering
- Optimized date/time generation

### Performance Results
- 35% faster overall execution
- 33% less memory usage
- 85% faster URL deduplication
- 64% faster URL processing
- 63% faster file exports
- 85% faster HTML generation

## [2.1.0] - 2025-10-08

### Added

**Graphical User Interface**
- Modern WPF-based UI for keyword management
- Visual keyword editor (add, edit, delete, filter)
- Load/save keyword sets
- Integrated permutation generator
- Visual configuration panel
- Background search execution
- Live output console
- Quick folder access buttons
- Connection testing
- Start/stop controls

**Complete Pagination**
- Scrape all results per query (not just first page)
- Automatic pagination through all pages
- Smart stopping on no new results
- Configurable max pages (default: 100)
- Real-time page progress
- 10-50x more results per query

**Organized Directory Structure**
- Auto-organized folders: `logs/`, `results/`, `reports/`, `cache/`, `exports/`
- Automatic directory creation
- Clean, professional organization

**Enhanced Keywords**
- 500+ keyword permutations via generator
- 65 built-in default keywords
- All degree variations (PhD, Ph.D., MS, etc.)
- Research area abbreviations (AI, ML, NLP, etc.)

**Migration Tools**
- Migrate-ToOrganizedStructure.ps1
- Dry-run mode
- Automatic backup option

**Enhanced UI**
- Directory structure overview
- Page-by-page progress tracking
- Organized file summaries
- Quick access commands

### Fixed
- SearxNG compatibility with broken engines
- Timeout handling (3s → 10s)
- Rate limiting improvements
- Engine configuration warnings

### Changed
- Updated to v2.1
- Consolidated documentation
- Export paths use organized structure
- Cache/logs moved to dedicated folders

## [2.0.0] - 2025-10-07

### Added
- Command-line parameters
- Interactive mode
- Smart caching (24hr)
- HTML reports with statistics
- Progress bars
- File logging
- Data analysis and grouping
- Top performers ranking
- Auto-open results
- Colored output
- Retry logic with backoff
- URL cleaning and deduplication
- Multiple export formats

### Changed
- Complete rewrite
- Professional error handling
- Improved configuration

## [1.0.0] - 2025-10-06

### Added
- Initial release
- Basic SearxNG queries
- LinkedIn profile collection
- CSV export

---

**Note**: This project follows [Semantic Versioning](https://semver.org/).
