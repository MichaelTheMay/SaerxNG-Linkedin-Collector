# Contributing to SearxNG LinkedIn Collector

Thank you for your interest in contributing! This project welcomes contributions of all kinds.

## How to Contribute

### Reporting Issues
- Check if the issue already exists
- Provide clear steps to reproduce
- Include your environment (Windows version, PowerShell version, SearxNG version)
- Include relevant log files from `logs/` folder

### Suggesting Features
- Open an issue with the `enhancement` label
- Describe the feature and use case
- Explain how it would benefit users

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly** with various keywords and configurations
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Code Style

- Follow existing PowerShell conventions
- Use clear, descriptive variable names
- Add comments for complex logic
- Update README.md if adding features
- Keep functions focused and modular

### Testing

Before submitting:
- Test with default keywords
- Test with custom keywords
- Test pagination (verify it fetches multiple pages)
- Test all export formats (CSV, JSON, TXT, HTML)
- Test with `-UseCache` enabled
- Verify no syntax errors: `Get-Content .\ScriptQueries.ps1 -Raw | Out-Null`

## Development Setup

1. Ensure SearxNG is running locally
2. Configure SearxNG with JSON format enabled
3. Test connection: `http://localhost:8888`
4. Run script: `.\ScriptQueries.ps1 -Verbose`

## Questions?

Feel free to open an issue for any questions about contributing!

---

**Thank you for contributing!** 🎉

