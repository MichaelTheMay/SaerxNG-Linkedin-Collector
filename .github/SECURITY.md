# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.2.x   | :white_check_mark: |
| 2.1.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **Do NOT** create a public GitHub issue

Security vulnerabilities should be reported privately to protect users.

### 2. Report via GitHub Security Advisory

Use GitHub's [Security Advisory](https://github.com/yourusername/SearxQueries/security/advisories/new) feature to report vulnerabilities privately.

### 3. Email (Alternative)

If you prefer email, send details to:
- **Subject:** `[SECURITY] Brief description`
- Include:
  - Description of the vulnerability
  - Steps to reproduce
  - Potential impact
  - Suggested fix (if any)

### 4. What to Expect

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Updates:** Every 7 days on progress
- **Resolution:** Security patches released ASAP

## Security Best Practices

### For Users

1. **Keep Updated**
   - Always use the latest version
   - Check [CHANGELOG.md](../CHANGELOG.md) regularly

2. **SearxNG Configuration**
   - Use HTTPS for SearxNG connections
   - Restrict SearxNG access to trusted networks
   - Keep SearxNG updated

3. **API Keys & Secrets**
   - Never commit `settings.yml` to Git
   - Use environment variables for sensitive data
   - Regularly rotate credentials

4. **Data Privacy**
   - Review exported data before sharing
   - Be aware of LinkedIn's terms of service
   - Use VPN for additional privacy

### For Contributors

1. **Code Review**
   - All PRs undergo security review
   - Use static analysis tools
   - Follow secure coding practices

2. **Dependencies**
   - Minimize external dependencies
   - Use built-in PowerShell features
   - Audit third-party code

3. **Input Validation**
   - Validate all user inputs
   - Sanitize file paths
   - Escape special characters

## Known Security Considerations

### 1. Web Scraping
- Respect robots.txt and terms of service
- Use reasonable rate limiting
- Don't overload target servers

### 2. Data Storage
- Results contain potentially sensitive information
- Use encryption for sensitive exports
- Secure file permissions on output directories

### 3. Network Security
- All HTTP requests should use HTTPS when possible
- Validate SSL certificates
- Use secure DNS

## Security Features

- ✅ No external API keys required
- ✅ Local data processing
- ✅ No telemetry or tracking
- ✅ Open source and auditable
- ✅ User-controlled data retention

## Vulnerability Disclosure Timeline

1. **Day 0:** Vulnerability reported
2. **Day 1-2:** Acknowledgment and initial triage
3. **Day 3-7:** Vulnerability verification and patch development
4. **Day 8-14:** Testing and validation
5. **Day 15:** Coordinated disclosure and patch release

## Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

<!-- Contributors will be listed here -->
- *Your name could be here!*

## Contact

For non-security issues, use [GitHub Issues](https://github.com/yourusername/SearxQueries/issues).

For security concerns, use the private reporting methods above.

---

Thank you for helping keep SearxNG LinkedIn Collector secure! 🔒

