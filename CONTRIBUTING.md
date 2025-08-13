# Contributing to Docker Log Summariser MCP

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Workflow

1. **Fork and Clone**: Fork the repository and clone your fork locally
2. **Install Dependencies**: Run `npm install` 
3. **Create Branch**: Create a feature branch from main
4. **Make Changes**: Implement your changes following the guidelines below
5. **Test**: Run tests with `npm test` and ensure they pass
6. **Commit**: Sign commits with DCO using `git commit -s`
7. **Submit PR**: Open a pull request with a clear description

## Code Guidelines

- **Formatting**: Run `npm run lint:fix` before committing
- **Testing**: Add or update tests for new functionality
- **Documentation**: Update README.md for user-facing changes
- **Security**: No secrets or proprietary data in issues/PRs
- **Semantic Versioning**: Maintainers handle version bumps

## Development Commands

```bash
npm run dev          # Development mode with auto-restart
npm test             # Run test suite
npm run lint         # Check code style
npm run lint:fix     # Fix linting issues
npm run test:coverage # Run tests with coverage
```

## Commit Messages

Use clear, descriptive commit messages. Sign commits with DCO:

```bash
git commit -s -m "feat: add log filtering capability"
```

## Issue Guidelines

- **Bug Reports**: Include reproduction steps, expected vs actual behavior
- **Feature Requests**: Describe use case and proposed solution
- **Security Issues**: Use security@progressus-software.com instead of public issues

## Pull Request Guidelines

- **Description**: Clearly explain what changes are made and why
- **Tests**: Include tests for new functionality
- **Breaking Changes**: Mark clearly and update documentation
- **Size**: Keep PRs focused and reasonably sized

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

Feel free to open an issue for questions about contributing.