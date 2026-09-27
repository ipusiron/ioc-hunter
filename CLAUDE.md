# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IOC Hunter (IOCハンター) is a client-side web application for detecting and highlighting Indicators of Compromise (IOCs) in log files. It identifies 12 IOC types through validated candidates, including defanged network indicators.

## Development

This is a vanilla JavaScript application with no build process:
- Serve files directly with any web server
- Use ES6 modules (requires `type="module"` in script tags)
- No dependencies; Node 22 or later runs `npm test` with the built-in test runner
- Serve locally with `python -m http.server 8000 --bind 127.0.0.1`; file:// is not supported

## Architecture

The application uses a modular ES6 architecture:

1. **IOCHunterApp** (`script.js`) - Main controller that orchestrates all components
2. **IOCAnalyzer** (`iocAnalyzer.js`) - Shares one scanner result for statistics and position-based escaped highlighting
3. **FileHandler** (`fileHandler.js`) - File validation and reading (20MB limit, .txt/.log only)
4. **UIController** (`uiController.js`) - DOM manipulation and event handling
5. **CONFIG** (`config.js`) - Centralized patterns and constants

6. **Scanner** (`scanner.js`) - DOM-free scan/refang/defang/validation, ordered non-overlapping ranges
7. **Timeline** (`timeline.js`) - DOM-free parsing of five timestamp formats using UTC comparison keys
8. **AnalysisEngine** (`analysisEngine.js`) - Shared line index for cooccurrence/proximity, capped at 20,000 pairs
9. **TLD data** (`data/tlds.js`) - IANA Version 2026092000 (2026-09-20), 1,438 uppercase entries
10. **ExportHandler** (`exportHandler.js`) - Quoted CSV with formula protection; JSON URL host and optional network defang

## IOC Detection Patterns

Located in `config.js`:
- IPv4: Octets 0-255, no partial dotted numeric matches
- IPv6: Eight groups or valid compression, embedded IPv4 and zone IDs; no times or MAC addresses
- Domain: Valid labels and a suffix in the bundled IANA set; internal names are excluded
- Email and URL: Validate the domain or IP host; recognize defanged spelling
- Hash: MD5 (32 chars), SHA-1 (40 chars), SHA-256 (64 chars), SHA-512 (128 chars)
- Other types: bounded paths, registry keys, Bitcoin format only, CVE, MITRE technique IDs, case-insensitive CTF flags
- Resolve overlap by start ascending, length descending, then type priority in scanner.js
- Preserve raw text and offsets; aggregate refanged values. Do not replace patterns in generated HTML

## Testing

Run `npm test` (no installation). Tests cover six samples, golden examples, defang round trips,
HTML text preservation, exports, README metadata/examples, contrast, and five timezone subprocesses.
GitHub Actions runs the same command on push and pull_request with Node 22.

Manual testing using sample files in `samples/`:
- Toggle "テストログを使う" (Use test log) in UI
- Sample files listed in `samples/list.txt`

## Key Constraints

- File size limit: 20MB
- Supported formats: .txt, .log
- All processing is client-side (privacy-focused)
- Japanese UI with some English variable names
- Timestamp display preserves source spelling; offset-free values compare as UTC and yearless syslog uses 1970
- No external APIs, dependencies, checksum classification, or runtime TLD downloads
- Do not modify old screenshots or sample fixtures to make tests pass
- Preserve README metadata structure and identity values
- Strict meta CSP: no inline scripts/styles; meta frame-ancestors is not effective
- Store only theme and whitelist locally; never store or transmit input logs
