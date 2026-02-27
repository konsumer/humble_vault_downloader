# Humble Vault Downloader

A cross-platform desktop application to browse and download games from your Humble Bundle vault.

## Features

- 🔐 Secure login via Humble Bundle's official login page
- 📦 Browse all your vault games
- ⬇️ Download games for Windows, macOS, and Linux
- 💾 Files saved directly to your Downloads folder

## Installation

### Download Pre-built Releases

Go to the [Releases](https://github.com/konsumer/humble_vault_downloader/releases) page and download the appropriate file for your platform:

#### macOS
- **Apple Silicon (M1/M2/M3)**: Download `Humble.Vault.Downloader_*_aarch64.dmg`
- **Intel**: Download `Humble.Vault.Downloader_*_x64.dmg`

Open the DMG file and drag the app to your Applications folder.

#### Linux
- **AppImage**: Download `humble-vault-downloader_*_amd64.AppImage`
  - Make it executable: `chmod +x humble-vault-downloader_*.AppImage`
  - Run it: `./humble-vault-downloader_*.AppImage`
- **Debian/Ubuntu**: Download `humble-vault-downloader_*_amd64.deb`
  - Install: `sudo dpkg -i humble-vault-downloader_*.deb`

## Usage

1. Launch the application
2. Log in with your Humble Bundle credentials
3. Browse your vault games
4. Click on any platform/file to download it
5. Files will be saved to your Downloads folder

## Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version)
- [Rust](https://rustup.rs/)
- Platform-specific dependencies:
  - **Linux**: `sudo apt-get install libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf`
  - **macOS**: Xcode Command Line Tools

### Build Steps

```bash
# Clone the repository
git clone https://github.com/konsumer/humble_vault_downloader.git
cd humble_vault_downloader

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run tauri build
```

## How It Works

1. Opens Humble Bundle's login page in a webview
2. Detects when you successfully log in
3. Extracts your session cookie securely
4. Uses Humble Bundle's API to fetch your vault games
5. Downloads selected games using signed URLs

## Privacy & Security

- No credentials are stored or transmitted to any third party
- Uses official Humble Bundle login page and APIs
- Session cookie stays local on your machine
- All network requests go directly to Humble Bundle servers

## License

MIT

## Credits

Inspired by [Slashbunny/humble-vault-downloader](https://github.com/Slashbunny/humble-vault-downloader)
