# X Unfollow Tool

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/cpeaigkbonkmgamcdeoflbalglkffeag?label=Chrome%20Web%20Store&color=4285F4)](https://chromewebstore.google.com/detail/cpeaigkbonkmgamcdeoflbalglkffeag)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)]()

Smart bulk unfollow tool for X/Twitter. Clean up your following list with 6 different modes, advanced filters, and full privacy — 100% local, no data ever leaves your browser.

## Features

| Feature | Description |
|---------|-------------|
| **6 Modes** | Non-Followers, Unfollow All, Inactive Accounts, Overactive, Bio Filter, Follow All |
| **Whitelist** | Protect important accounts from being unfollowed |
| **Smart Speed Control** | Slow, Normal & Fast modes with built-in rate limit protection |
| **Bio Keyword Filter** | Unfollow or keep accounts based on bio keywords |
| **Inactive Detection** | Find accounts inactive for 30/60/90/180/365 days |
| **Overactive Detection** | Find accounts tweeting 30+ times per day |
| **Rate Limit Handling** | Auto-detects rate limits, waits 30 min, then resumes |
| **Dark & Light Theme** | Glassmorphism UI with auto theme detection |
| **17 Languages** | EN, TR, ES, DE, FR, AR, JA, PT, ZH, ZH_TW, KO, HI, TH, ID, PL, IT, NL |
| **Activity Log** | Track every action in real time |
| **History & Export** | Full unfollow history with JSON/CSV export |
| **Keyboard Shortcuts** | Alt+Shift+S (Start/Stop), Alt+Shift+P (Pause) |

## Install

**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/cpeaigkbonkmgamcdeoflbalglkffeag)**

## How to Use

1. Go to `x.com/yourusername/following`
2. Click the extension icon
3. Choose a mode
4. Adjust speed, limit, and filters if needed
5. Click **Start**

## Privacy

- All data processed locally on your device
- No external servers or APIs
- No data collection or tracking
- Open source & transparent

See [Privacy Policy](PRIVACY_POLICY.md) for details.

## Tech Stack

- Chrome Extension Manifest V3
- Service Worker background script
- Content Scripts (ISOLATED + MAIN world)
- Custom i18n engine (17 languages, 175+ keys each)
- CSS Custom Properties theming
- Zero dependencies

## Safe Usage Tips

- Keep the tab in the foreground for best results
- X/Twitter has daily limits (~400 unfollows/day)
- Use Slow speed mode for maximum safety
- Add important accounts to your whitelist before starting
- The extension auto-pauses for 30 min if rate limited

## Project Structure

```
├── manifest.json          # Extension manifest (MV3)
├── popup.html/css/js      # Extension popup UI
├── content.js             # Content script (ISOLATED world)
├── content-bridge.js      # Bridge script (MAIN world)
├── background.js          # Service worker
├── i18n.js                # Translations (17 languages)
├── _locales/              # Chrome i18n manifests
│   ├── en/messages.json
│   ├── tr/messages.json
│   ├── es/messages.json
│   ├── de/messages.json
│   ├── fr/messages.json
│   ├── ar/messages.json
│   ├── ja/messages.json
│   ├── pt_BR/messages.json
│   ├── zh/messages.json
│   ├── zh_TW/messages.json
│   ├── ko/messages.json
│   ├── hi/messages.json
│   ├── th/messages.json
│   ├── id/messages.json
│   ├── pl/messages.json
│   ├── it/messages.json
│   └── nl/messages.json
└── icons/                 # Extension icons
```

## Disclaimer

This extension is an independent tool and is not affiliated with, endorsed by, or associated with X Corp. or Twitter Inc. Use at your own risk. Always follow X/Twitter's Terms of Service.

## License

[MIT](LICENSE) - Mahsum Aktas
