# Contribution Guidelines

## Reporting issues

- **Search for existing issues.** Please check to see if someone else has reported the same issue.
- **Share as much information as possible.** Include operating system and version, browser and version. Also, include steps to reproduce the bug.

## Project Setup

Refer to the [README]().

## Code Style

### JavaScript

JS files must pass JSHint using the provided [.jshintrc]() settings.

Additionally, JS files need to be run through [JSBeautify](https://github.com/einars/js-beautify) with the provided [.jsbeautifyrc]().

**TL;DR** Run `npm run beautify` before pushing a commit. It will validate and beautify your JS.

#### Variable Naming

- `lowerCamelCase` General variables
- `UpperCamelCase` Constructor functions

## Pull requests

- Try not to pollute your pull request with unintended changes – keep them simple and small. If possible, squash your commits.
- If your PR resolves an issue, include **closes #ISSUE_NUMBER** in your commit message (or a [synonym](https://help.github.com/articles/closing-issues-via-commit-messages)).
