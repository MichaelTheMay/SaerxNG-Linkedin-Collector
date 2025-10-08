# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2025-10-08

### Added
- **Complete Pagination**: Script now scrapes every single result per query (not just first page)
  - Automatic pagination through all available pages
  - Smart stopping when no new unique results found
  - Configurable `MaxPagesPerQuery` (default: 100)
  - Real-time page progress: `→ Page 2... +15`
  - 10-50x more results per query

- **Organized Directory Structure**: Files automatically organized into logical folders
  - `logs/` - Search execution logs
  - `results/` - CSV, JSON, TXT data files
  - `reports/` - HTML reports
  - `cache/` - Query cache
  - `exports/` - Custom exports

- **Enhanced Keywords**: Comprehensive keyword system with 500+ permutations
  - 65 built-in default keywords with common abbreviations
  - Generate-KeywordPermutations.ps1 utility (creates 504 variations)
  - Covers all degree variations (PhD, Ph.D., MS, M.S., etc.)
  - All research area abbreviations (AI, ML, NLP, CV, DL, etc.)

- **Migration Tools**:
  - Migrate-ToOrganizedStructure.ps1 for easy transition from v2.0
  - Dry-run mode and automatic backup option

- **Enhanced UI**:
  - Directory structure overview on startup
  - Page-by-page progress tracking
  - Organized file summaries
  - Quick access commands for all folders

### Fixed
- SearxNG compatibility issues with broken engines
- Timeout handling (increased from 3s to 10s)
- Rate limiting improvements
- Engine configuration warnings

### Changed
- Updated version banner to v2.1
- Consolidated all documentation into single README.md
- Export paths now use organized folder structure
- Cache file moved to dedicated `cache/` folder
- Logs moved to dedicated `logs/` folder

## [2.0.0] - 2025-10-07

### Added
- Command-line parameters for automation
- Interactive mode for keyword selection
- Smart caching system (24-hour expiration)
- Beautiful HTML reports with statistics
- Progress bars and real-time updates
- Comprehensive logging to file
- Advanced data analysis and grouping
- Top performers ranking
- Auto-open results option
- Professional UI with colored output
- Better retry logic with exponential backoff
- URL cleaning and deduplication
- Multiple export formats

### Changed
- Complete rewrite from basic script
- Added professional error handling
- Improved configuration system

## [1.0.0] - 2025-10-06

### Added
- Initial release
- Basic SearxNG query functionality
- LinkedIn profile collection
- CSV export

---

**Note**: This project follows [Semantic Versioning](https://semver.org/).

