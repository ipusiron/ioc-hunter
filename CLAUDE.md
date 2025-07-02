# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IOC Hunter (IOCハンター) is a client-side web application for detecting and highlighting Indicators of Compromise (IOCs) in log files. It identifies IPv4/IPv6 addresses, domains, emails, and hash values through regex patterns.

## Development

This is a vanilla JavaScript application with no build process:
- Serve files directly with any web server
- Use ES6 modules (requires `type="module"` in script tags)
- No dependencies or package manager

## Architecture

The application uses a modular ES6 architecture:

1. **IOCHunterApp** (`script.js`) - Main controller that orchestrates all components
2. **IOCAnalyzer** (`iocAnalyzer.js`) - Core detection engine with regex patterns
3. **FileHandler** (`fileHandler.js`) - File validation and reading (20MB limit, .txt/.log only)
4. **UIController** (`uiController.js`) - DOM manipulation and event handling
5. **CONFIG** (`config.js`) - Centralized patterns and constants

## IOC Detection Patterns

Located in `config.js`:
- IPv4: Basic dotted decimal notation
- IPv6: Colon-separated hexadecimal
- Domain: Multi-level domain names with TLDs
- Email: Standard email format
- Hash: MD5 (32 chars), SHA-1 (40 chars), SHA-256 (64 chars)

## Testing

Manual testing using sample files in `samples/`:
- Toggle "テストログを使う" (Use test log) in UI
- Sample files listed in `samples/list.txt`

## Key Constraints

- File size limit: 20MB
- Supported formats: .txt, .log
- All processing is client-side (privacy-focused)
- Japanese UI with some English variable names