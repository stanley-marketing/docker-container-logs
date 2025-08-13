# Security Policy

## Reporting Security Vulnerabilities

Report vulnerabilities to security@progressus-software.com. Do not file public issues for suspected vulnerabilities.

We acknowledge within 2 business days. Supported versions: latest two minor releases.

## Data Security

This tool processes Docker logs locally and may send log content to AI services for summarization. 

**Important:**
- Do not process logs containing PII, secrets, or confidential information
- Ensure your AI service provider's terms of service align with your data usage requirements
- Configure appropriate log filtering to exclude sensitive data
- Use environment variables for API keys - never commit them to version control

## Supported Versions

We actively support security updates for the latest two minor versions. 

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Updates

Security fixes are released as patch versions and communicated through:
- GitHub Security Advisories
- Release notes with [SECURITY] prefix
- Email notifications for critical vulnerabilities