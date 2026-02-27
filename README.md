# Humble Vault Downloader

A simple desktop app to download games from your Humble Bundle vault.

This is not affiliated with Humble Bundle, and is totally unofficial.

## Installation

### Easy Install

**Linux & Steam Deck:**

Download [humble-vault-downloader.desktop](https://github.com/konsumer/humble_vault_downloader/raw/main/humble-vault-downloader.desktop) and double-click it.

On first run, it automatically downloads and installs the app, then adds it to your application menu.

**macOS & Linux (Terminal):**

```bash
curl -sSL https://raw.githubusercontent.com/konsumer/humble_vault_downloader/refs/heads/main/install.sh | bash
```

The installer automatically:
- Detects your OS and CPU architecture
- Downloads the correct version
- Installs to the right location
- On macOS: Installs DMG to ~/Applications
- On Linux: Creates application menu entry

### Manual Installation

Download the latest version from the [Releases page](https://github.com/konsumer/humble_vault_downloader/releases).

#### macOS
- **Apple Silicon (M1/M2/M3)**: Download the `aarch64.dmg` file
- **Intel Mac**: Download the `x64.dmg` file

Open the DMG and drag the app to your Applications folder.

#### Linux
- **AppImage** (works on any distribution):
  ```bash
  chmod +x humble-vault-downloader_*.AppImage
  ./humble-vault-downloader_*.AppImage
  ```

- **Debian/Ubuntu**:
  ```bash
  sudo dpkg -i humble-vault-downloader_*.deb
  ```

- **Fedora/RHEL/CentOS**:
  ```bash
  sudo rpm -i humble-vault-downloader_*.rpm
  ```

## How to Use

1. Open the app
2. Log in with your Humble Bundle account
3. Browse your games
4. Click any game to download it
5. Files save to your Downloads folder

## Note

Windows is not supported as Humble Bundle provides an [official Windows client](https://www.humblebundle.com/app/download).

## Privacy

- Your login credentials never leave your computer
- All downloads come directly from Humble Bundle
- No data is collected or shared with third parties
