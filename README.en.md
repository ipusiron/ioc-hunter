# IOC Hunter - Extract Indicators of Compromise from logs

English · [日本語](README.md)

[![Stars](https://img.shields.io/github/stars/ipusiron/ioc-hunter)](https://github.com/ipusiron/ioc-hunter/stargazers)
[![Forks](https://img.shields.io/github/forks/ipusiron/ioc-hunter)](https://github.com/ipusiron/ioc-hunter/forks)
[![Last commit](https://img.shields.io/github/last-commit/ipusiron/ioc-hunter)](https://github.com/ipusiron/ioc-hunter/commits/main)
[![License](https://img.shields.io/github/license/ipusiron/ioc-hunter)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-demo-blue)](https://ipusiron.github.io/ioc-hunter/)

**Day016 - Security Tools 100 with Generative AI**

**IOC Hunter** pulls Indicators of Compromise out of a log file or any block of text and
highlights them by type, right in your browser.

It detects 12 IOC types and colour-codes each one. On top of that it correlates indicators,
builds a timeline and reports detailed statistics, so it goes further than a plain extractor.

## 🌐 Demo

👉 [https://ipusiron.github.io/ioc-hunter/](https://ipusiron.github.io/ioc-hunter/)

---

## 📸 Screenshots

![Overview of an Apache log](assets/screenshot.png)
> *Overview tab in light mode: statistics and the chart for an Apache log.*

![Details of an Apache log](assets/screenshot3.png)
> *Details tab in light mode: the original log with the IOCs highlighted in place.*

![Details in dark mode](assets/screenshot4.png)
> *Details tab in dark mode, with the palette adjusted for text-on-background contrast.*

---

## ✨ Features

### The basics
- **12 IOC types**: IPv4/IPv6, domain, email, hash, URL, file path, registry key, Bitcoin address,
  CVE ID, MITRE ATT&CK technique ID and CTF flag
- **In-place highlighting**: every hit is coloured by type inside the original text
- **Statistics**: a total and a unique count for each type, deduplicated by the refanged value
- **Nothing leaves the browser**: no install, no upload, no telemetry

### Deeper analysis
- **Correlation**: co-occurrence on the same line, domain-IP pairs and file-hash pairs
- **Timeline**: events grouped by time, each group scored for severity
- **Detailed statistics**: distribution, repeated indicators and a risk assessment
- **Four tabs**: overview, correlation, timeline and details

### Interface
- **Dark mode** for long sessions
- **Whitelist** for indicators you already know are safe (kept in this browser)
- **Export** to JSON, CSV or plain text
- **Help dialog** describing each IOC type with an example
- **Japanese and English**: switch with the button at the top right. Your choice is kept in this
  browser, and `?lang=ja` / `?lang=en` selects a language directly
- **Responsive** down to a phone-sized screen

---

## 🎯 Who it is for

- People learning how to read logs
- CTF players working on forensics and OSINT challenges
- SOC operators
- Incident response teams
- Anyone preparing security training material
- Threat hunters

---

## 📋 IOC types it detects

| IOC type | What it is | Example |
|---------|------|-----|
| IPv4 | IPv4 address | `192.168.1.1` |
| IPv6 | IPv6 address | `2001:db8::1` |
| Domain | Domain name | `example.com` |
| Email | Email address | `user@example.com` |
| Hash | MD5 / SHA-1 / SHA-256 / SHA-512 | `d41d8cd98f00b204e9800998ecf8427e` |
| URL | Web URL | `https://example.com/path` |
| FilePath | File path | `C:\Windows\System32\cmd.exe` |
| RegistryKey | Windows registry key | `HKLM\SOFTWARE\Microsoft` |
| Bitcoin | Bitcoin address | `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` |
| CVE | CVE identifier | `CVE-2021-44228` |
| MITRE | MITRE ATT&CK technique ID | `T1059.001` |
| Flag | CTF flag | `flag{example_flag}` `CTF{another_flag}` |

---

## 🎯 Use cases

### In a CTF

IOC Hunter is most useful on forensics and log-analysis challenges.

- **Finding a flag buried in a large log**
    - `flag{}`, `CTF{}`, `picoCTF{}` and the other common wrappers are all detected
    - Hashes and IP addresses that act as hints are highlighted in the same pass
- **Spotting the attacker IP or a suspicious domain**
    - An address that keeps reappearing in `auth.log` or `access.log` stands out
- **Reconstructing the attack from the timeline**
    - Entries from several places are lined up in time order
- **Following a correlation to a hidden clue**
    - Related indicators hint at the infrastructure behind the attack

#### 🚩 About CTF flag detection

**Wrappers it knows**
- Common: `flag{content}`, `FLAG{CONTENT}`
- Platform-specific: `CTF{}`, `picoCTF{}`, `hacktheBox{}`, `TryHackMe{}`
- Short: `HTB{}`, `THM{}`

**Examples**
```
flag{this_is_a_sample_flag}
CTF{another_example_flag}
picoCTF{pico_flag_example}
hacktheBox{htb_challenge_flag}
TryHackMe{thm_room_flag}
HTB{short_format}
THM{short_format}
```

Flags are highlighted in red and counted in the statistics and the analysis like any other type.

### At work (SOC and incident response)

**Threat hunting**
- Reading a CVE ID together with the MITRE ATT&CK technique next to it
- Identifying the attacker's TTPs
- Seeing the shape of the attack infrastructure through the correlations

**Investigating an incident**
- Rebuilding the attack flow from the timeline
- Cutting false positives with the whitelist
- Putting a number on the affected scope from the detailed statistics

**Managing indicators**
- Pulling IOCs out of several log sources in one go
- Handing the export to another tool such as VirusTotal or AbuseIPDB
- Finding persistent activity through the repeated-indicator list

### As training material

**Courses and workshops**
- Hand out a log file and ask the class to extract the indicators
- Practise flag hunting, or study each IOC type through the help dialog
- Teach how to read and interpret the results

**Closed environments**
- Edit `samples/list.txt` to add your own exercise logs
- Everything works offline, so it fits an air-gapped classroom
- Results appear immediately, which keeps the exercise moving

---

## 📖 How to use it

### The basics
1. **Load a file**: drag and drop a log file, or pick one
2. **Run it**: press the Analyse button
3. **Read the results**: four tabs hold the output

## 📐 The screen
- **Overview tab**: the basic statistics, the chart and the detailed statistics
- **Correlation tab**: relationships between indicators
- **Timeline tab**: events in time order
- **Details tab**: the original input with the hits highlighted in place

### Whitelist
- **Add**: type an indicator you want excluded
- **Manage**: review and remove what you have added
- **Kept**: the list lives in this browser's localStorage

### Export
- **JSON**: structured data for another tool
- **CSV**: for a spreadsheet
- **TXT**: a plain report

---

## 🔬 How it works

### Architecture
- **Front end**: plain JavaScript in ES6 modules
- **Storage**: localStorage, for the settings only
- **Chart**: drawn with the Canvas API
- **Style**: CSS Grid and Flexbox

### Performance and limits
- **File size**: 20MB. Start with about 200 lines; split a long log
- **A measurement**: on Chromium under Windows, 200 lines (an Apache log repeated 20 times)
  took 13ms for statistics, highlighting, correlation, timeline and the screen update.
  It varies with the machine and the log, so treat it as an indication rather than a guarantee
- **Throughput**: correlation shares one line index and stops after 20,000 pairs, so a log of
  tens of thousands of lines shows only part of the result
- **Privacy**: everything runs locally; nothing is sent anywhere
- **Browser**: any modern browser with ES6 modules (Chrome, Firefox, Safari, Edge)

---

### From detection to display

`scan()` runs once and its result is shared by the statistics, the highlighting and the
correlation. After the per-type candidates are collected, overlaps are resolved by start
position, then length, then type priority. The generated HTML is never searched again, so no
character appears that was not in the input and no highlight nests inside another.

Timestamps are read in five shapes: ISO 8601, Apache, BIND, a simple form and syslog. A value
without an offset is compared as UTC, a yearless syslog line is compared as 1970, and the
original spelling is what appears on screen. The result does not depend on the reader's
time zone.

### Customising it
- **A new IOC pattern**: edit the regular expressions in `js/config.js`
- **A new flag wrapper**: extend the `flag` pattern in `config.js`
- **A new sample log**: drop the file into `samples/` and add a line to `samples/list.txt`
  (three columns: `filename:Japanese label:English label`)
- **Wording**: add the same key to `ja` and `en` in `js/i18n.js`; the tests fail if one is missing
- **Colours**: `css/style.css`

---

## 🔒 Security and privacy

Parsing, defanging and refanging, and the exports all happen inside the browser. Nothing is
sent anywhere. The only requests are for files served from the same origin as the page itself
and for the sample logs. localStorage holds the theme, the whitelist and the language you
chose. The input log and the results are never stored.

The CSP limits script, style and font to `self`, sets `object-src` to `none` and `connect-src`
to `self`. Inline scripts and inline styles are not allowed and the referrer policy is
`no-referrer`. A meta element cannot enforce `frame-ancestors`, so this configuration alone
does not stop the page from being framed.

Every CSV cell is quoted and inner quotes are doubled. A cell that starts with a character a
spreadsheet would read as a formula is prefixed with a single quote. The JSON export adds the
host alongside each URL.

### Defanged spellings

The original spelling stays on screen, and duplicates are counted by the refanged value.

| Input | Type | Refanged |
|---|---|---|
| `192[.]168[.]1[.]1` | ipv4 | `192.168.1.1` |
| `evil[.]com` | domain | `evil.com` |
| `evil(.)com` | domain | `evil.com` |
| `evil{.}com` | domain | `evil.com` |
| `user[@]example[.]com` | email | `user@example.com` |
| `hxxp://evil.com/a` | url | `http://evil.com/a` |
| `hxxps://evil[.]com/payload.exe` | url | `https://evil.com/payload.exe` |
| `sub[.]evil[.]co[.]jp` | domain | `sub.evil.co.jp` |

`(@)` and `[at]` also count as an email separator, and `[://]` and `[:]//` as a URL separator.
Tick "Defang the output" and the network indicators in the JSON, CSV or TXT export are written
back in the harmless spelling. File paths, registry keys, hashes, CVE IDs, MITRE technique IDs
and flags are left alone.

## ⚠️ Known limits

- Domains are validated against the bundled IANA TLD list (version 2026092000, 1,438 entries).
  Internal names such as `internal.local` and `hidden.service` are therefore not detected
- `.sh`, `.md`, `.py` and `.zip` are real TLDs, so a bare file name can look like a domain
- A host inside a URL counts as one URL and is not also counted as a domain (this changed from
  the earlier version)
- IPv6 covers compression, embedded IPv4 and zone IDs. Times and MAC addresses are excluded
- A Bitcoin address is matched on its shape only; the checksum is not verified
- The correlations and the risk level are leads for an investigation, not a verdict on whether
  something is malicious
- The whitelist stays on the machine, so clear it after using a shared one

## ❓ FAQ

### Why does it not work when I open it with file://

ES modules are subject to the browser's CORS rules. Serve the directory over HTTP as described
under **Running it locally**.

### How do I update the TLD list

An administrator fetches the
[TLD list](https://data.iana.org/TLD/tlds-alpha-by-domain.txt) from IANA by hand and checks the
version and date in the leading comment. Every non-empty line that is not a comment becomes an
uppercase entry in the `TLDS` array in `data/tlds.js`, and `TLD_LIST_VERSION`,
`TLD_LIST_UPDATED` and the count test are updated with it. Nothing is fetched at runtime.

## 🔗 References

- [IANA Root Zone Database](https://www.iana.org/domains/root/db)
- [IPv6 Addressing Architecture (RFC 4291)](https://www.rfc-editor.org/rfc/rfc4291)
- [Common Format for CSV Files (RFC 4180)](https://www.rfc-editor.org/rfc/rfc4180)

## 🧪 Tests

Run `npm test` with Node 22 or later. There is nothing to install. GitHub Actions runs the same
command on every push and pull request, checking the tables and examples in the README, that
the result is identical in five time zones, the contrast of the palette, the counts in the
samples, and that the Japanese and English dictionaries line up.

## 📁 Layout

```text
ioc-hunter/
├── .github/workflows/test.yml
├── .gitignore
├── .nojekyll
├── assets/                   # screenshots, old and new
├── css/style.css
├── data/tlds.js               # the bundled IANA TLD data
├── js/
│   ├── analysisEngine.js
│   ├── chartRenderer.js
│   ├── config.js
│   ├── darkModeHandler.js
│   ├── exportHandler.js
│   ├── fileHandler.js
│   ├── helpModal.js
│   ├── i18n.js                # the Japanese and English dictionaries, and how they reach the DOM
│   ├── iocAnalyzer.js
│   ├── scanner.js
│   ├── script.js
│   ├── tabManager.js
│   ├── timeline.js
│   ├── uiController.js
│   └── whitelistManager.js
├── samples/                  # six logs and list.txt
├── test/                     # patterns, display, timestamps, export, docs, contrast, i18n
├── index.html
├── package.json
├── CLAUDE.md
├── LICENSE
├── README.en.md
└── README.md
```

## 💻 Running it locally

Use a modern browser with ES module support (Chrome, Firefox, Safari, Edge). From the root of
the repository, run the following and open the port it prints.

```sh
python -m http.server 8000 --bind 127.0.0.1
```

The address is `http://127.0.0.1:8000/`. Node is only needed for the tests, not for the tool.

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🛠️ About this tool

This tool was built as part of **Security Tools 100 with Generative AI**, a project that
produces and publishes one security-related tool a day for 100 days, with AI as a partner.

For the project itself and the other tools, see the page below.

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
