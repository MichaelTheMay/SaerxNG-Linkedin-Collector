# GitHub Repository Setup Guide

This guide documents the GitHub-optimized structure of the SearxNG LinkedIn Collector repository.

## 📁 Repository Structure

```
SearxQueries/
├── .github/                      # GitHub-specific files
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   │   ├── bug_report.md        # Bug report template
│   │   └── feature_request.md   # Feature request template
│   ├── workflows/               # GitHub Actions
│   │   ├── lint.yml            # PowerShell linting
│   │   └── test.yml            # Automated tests
│   ├── CODE_OF_CONDUCT.md      # Community guidelines
│   ├── FUNDING.yml             # Sponsorship options
│   ├── PULL_REQUEST_TEMPLATE.md # PR template
│   └── SECURITY.md             # Security policy
│
├── cache/                       # Query cache (gitignored)
├── exports/                     # Custom exports (gitignored)
├── logs/                        # Search logs (gitignored)
├── reports/                     # HTML reports (gitignored)
├── results/                     # CSV/JSON results (gitignored)
│
├── ScriptQueries.ps1           # Main sequential script
├── ScriptQueriesParallel.ps1   # Parallel execution script
├── SearxQueriesUI.ps1          # Graphical interface
├── SearxHelpers.psm1           # Helper module
│
├── .gitattributes              # Git file attributes
├── .gitignore                  # Git ignore rules
├── CHANGELOG.md                # Version history
├── CONTRIBUTING.md             # Contribution guide
├── FILES_OVERVIEW.md           # File documentation
├── GITHUB_SETUP.md             # This file
├── LICENSE                     # MIT License
├── PARALLEL_EXECUTION_GUIDE.md # Parallel execution docs
└── README.md                   # Main documentation
```

## 🚀 Quick Setup for GitHub

### 1. Create Repository

```bash
# Initialize repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: SearxNG LinkedIn Collector v2.2"

# Add remote (replace with your URL)
git remote add origin https://github.com/yourusername/SearxQueries.git

# Push to GitHub
git push -u origin main
```

### 2. Configure Repository Settings

#### General Settings
- ✅ **Description:** "PowerShell tool for collecting LinkedIn profiles via SearxNG"
- ✅ **Topics:** `powershell`, `searxng`, `linkedin`, `web-scraping`, `data-collection`
- ✅ **Website:** Add documentation link if available

#### Features
- ✅ **Issues:** Enable
- ✅ **Projects:** Enable (optional)
- ✅ **Wiki:** Enable (optional)
- ✅ **Discussions:** Enable for community support

#### Security
- ✅ **Dependency graph:** Enable
- ✅ **Dependabot alerts:** Enable
- ✅ **Dependabot security updates:** Enable
- ✅ **Secret scanning:** Enable

#### Branches
- ✅ **Default branch:** `main`
- ✅ **Branch protection rules:**
  - Require pull request reviews (1 approver)
  - Require status checks to pass
  - Require branches to be up to date
  - Include administrators

### 3. Setup GitHub Actions

The repository includes two workflows:

#### Linting Workflow (`.github/workflows/lint.yml`)
- Runs PSScriptAnalyzer on all PowerShell scripts
- Checks for syntax errors
- Triggers on push and PR to main/develop

#### Testing Workflow (`.github/workflows/test.yml`)
- Tests on PowerShell 5.1 and 7.x
- Validates script syntax
- Checks module imports
- Verifies directory structure

**No additional setup required** - workflows run automatically!

### 4. Configure Labels

Add these labels for better issue management:

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | `#d73a4a` | Something isn't working |
| `enhancement` | `#a2eeef` | New feature or request |
| `documentation` | `#0075ca` | Documentation improvements |
| `good first issue` | `#7057ff` | Good for newcomers |
| `help wanted` | `#008672` | Extra attention needed |
| `performance` | `#fbca04` | Performance improvements |
| `ui` | `#d4c5f9` | User interface related |
| `parallel` | `#bfdadc` | Parallel execution related |

### 5. Update README Badges

Replace placeholder URLs in README.md:

```markdown
[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/YOURUSERNAME/SearxQueries)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/YOURUSERNAME/SearxQueries?style=social)](https://github.com/YOURUSERNAME/SearxQueries)
```

## 📝 Issue and PR Templates

### Bug Reports
Pre-filled template includes:
- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs section

### Feature Requests
Pre-filled template includes:
- Feature description
- Problem it solves
- Proposed solution
- Use case examples

### Pull Requests
PR template includes:
- Change description
- Type of change checklist
- Testing checklist
- Related issues

## 🔒 Security

### Security Policy
- Supported versions documented
- Private vulnerability reporting instructions
- Response timeline commitments
- Security best practices

### .gitignore Protection
Prevents committing:
- Search results and logs
- Cache files
- API keys and secrets
- User configurations
- IDE settings
- Temporary files

## 🤝 Contributing

### Setup Development Environment

```powershell
# Clone repository
git clone https://github.com/yourusername/SearxQueries.git
cd SearxQueries

# Create feature branch
git checkout -b feature/my-feature

# Make changes and test
.\SearxQueriesUI.ps1

# Lint your code
Invoke-ScriptAnalyzer -Path . -Recurse

# Commit with descriptive message
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

### Commit Message Convention

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Build/tooling changes

**Examples:**
```
feat(ui): add real-time progress bar
fix(parallel): resolve variable interpolation error
docs(readme): update installation instructions
perf(search): optimize URL deduplication
```

## 🎯 Release Process

### 1. Update Version
```powershell
# Update version in:
# - README.md (badge and title)
# - CHANGELOG.md (new version entry)
# - Script headers
```

### 2. Create Release
```bash
# Tag the release
git tag -a v2.2.0 -m "Release v2.2.0: Parallel execution & progress tracking"

# Push tag
git push origin v2.2.0
```

### 3. GitHub Release
1. Go to Releases → Draft a new release
2. Choose the tag (v2.2.0)
3. Title: "v2.2.0 - Parallel Execution & Progress Tracking"
4. Description: Copy from CHANGELOG.md
5. Attach any binaries (if applicable)
6. Publish release

## 📊 GitHub Actions Status

Check workflow status:
- **Linting:** [![Lint](https://github.com/YOURUSERNAME/SearxQueries/workflows/PowerShell%20Lint/badge.svg)](https://github.com/YOURUSERNAME/SearxQueries/actions)
- **Tests:** [![Tests](https://github.com/YOURUSERNAME/SearxQueries/workflows/Tests/badge.svg)](https://github.com/YOURUSERNAME/SearxQueries/actions)

## 🌟 Best Practices

### Code Quality
- ✅ Use PSScriptAnalyzer before committing
- ✅ Test on PowerShell 5.1 and 7.x
- ✅ Follow PowerShell coding standards
- ✅ Add comments for complex logic

### Documentation
- ✅ Update CHANGELOG.md for all changes
- ✅ Keep README.md current
- ✅ Document breaking changes
- ✅ Add examples for new features

### Git Workflow
- ✅ Create feature branches
- ✅ Write descriptive commit messages
- ✅ Keep commits focused and atomic
- ✅ Squash commits before merging

### Testing
- ✅ Test all features before PR
- ✅ Include test cases in description
- ✅ Verify on clean environment
- ✅ Check for regressions

## 🔧 Maintenance

### Regular Tasks
- [ ] Review and merge PRs weekly
- [ ] Triage issues monthly
- [ ] Update dependencies quarterly
- [ ] Review security advisories
- [ ] Update documentation as needed

### Monitoring
- Watch GitHub Actions for failures
- Monitor issue/PR backlog
- Review star/fork trends
- Check for security alerts

## 📞 Support Channels

- **Issues:** For bug reports and feature requests
- **Discussions:** For questions and community support
- **Email:** For security concerns (see SECURITY.md)

## 🎉 Recognition

### Contributors
All contributors are listed in the GitHub contributors page and release notes.

### Hall of Fame
Security researchers recognized in SECURITY.md.

---

For more information, see:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md) - Community standards
- [SECURITY.md](.github/SECURITY.md) - Security policy
- [LICENSE](LICENSE) - MIT License

Happy contributing! 🚀

