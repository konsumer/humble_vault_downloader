# Humble Vault Downloader

A simple desktop app to download games from your Humble Bundle vault.

This is not affiliated with Humble Bundle, and is totally unofficial.

## Installation

Download the latest version for your system from the [Releases page](https://github.com/konsumer/humble_vault_downloader/releases).

### macOS

- **Apple Silicon (M1/M2/M3)**: Download the `aarch64.dmg` file
- **Intel Mac**: Download the `x64.dmg` file

Open the DMG and drag the app to your Applications folder.

### Linux

**Easy Install (Recommended for Steam Deck):**

```bash
curl -sSL https://raw.githubusercontent.com/konsumer/humble_vault_downloader/main/install-desktop.sh | bash
```

This downloads the latest AppImage and adds it to your application menu.

**Manual Installation:**

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

- **Tarball** (manual installation):
  ```bash
  tar -xzf humble-vault-downloader_*.tar.gz
  cd humble-vault-downloader
  ./humble-vault-downloader
  ```

### Steam Deck

1. Switch to Desktop Mode
2. Open Konsole (terminal)
3. Run:
   ```bash
   curl -sSL https://raw.githubusercontent.com/konsumer/humble_vault_downloader/main/install-desktop.sh | bash
   ```
4. Find "Humble Vault Downloader" in your application menu

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
