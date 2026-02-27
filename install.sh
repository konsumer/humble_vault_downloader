#!/bin/bash
set -e

# Detect OS and architecture
OS=$(uname -s)
ARCH=$(uname -m)

# Function to show messages (Linux only)
show_info() {
  if command -v zenity &> /dev/null; then
    zenity --info --text="$1" --timeout=3 2>/dev/null &
  elif command -v kdialog &> /dev/null; then
    kdialog --passivepopup "$1" 3 2>/dev/null &
  else
    echo "$1"
  fi
}

show_error() {
  if command -v zenity &> /dev/null; then
    zenity --error --text="$1" 2>/dev/null
  elif command -v kdialog &> /dev/null; then
    kdialog --error "$1" 2>/dev/null
  else
    echo "ERROR: $1" >&2
  fi
}

echo "Detecting system: $OS $ARCH"

if [ "$OS" = "Linux" ]; then
  # ============ Linux Installation ============
  INSTALL_DIR="$HOME/.local/share/humble-vault-downloader"
  DESKTOP_DIR="$HOME/.local/share/applications"
  
  mkdir -p "$INSTALL_DIR"
  mkdir -p "$DESKTOP_DIR"
  cd "$INSTALL_DIR"
  
  show_info "Downloading Humble Vault Downloader...\nThis will only happen once."
  
  echo "Fetching latest release..."
  LATEST_URL=$(curl -sL https://api.github.com/repos/konsumer/humble_vault_downloader/releases/latest | grep '"browser_download_url":' | grep 'amd64\.AppImage"' | cut -d '"' -f 4 | head -n1)
  
  if [ -z "$LATEST_URL" ]; then
    echo "Error: Could not find AppImage in latest release"
    show_error "Could not find AppImage. Please visit:\nhttps://github.com/konsumer/humble_vault_downloader/releases"
    exit 1
  fi
  
  echo "Downloading from: $LATEST_URL"
  
  if ! curl -L -o humble-vault-downloader.AppImage "$LATEST_URL"; then
    echo "Error: Download failed"
    show_error "Download failed. Please check your internet connection."
    exit 1
  fi
  
  chmod +x humble-vault-downloader.AppImage
  
  # Create desktop file
  cat > "$DESKTOP_DIR/humble-vault-downloader.desktop" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Humble Vault Downloader
Comment=Download games from your Humble Bundle vault
Exec=bash -c 'cd "$HOME/.local/share/humble-vault-downloader" && ./humble-vault-downloader.AppImage'
Icon=application-x-executable
Terminal=false
Categories=Game;Utility;
Keywords=humble;bundle;download;games;
X-AppImage-Name=Humble Vault Downloader
EOF
  chmod +x "$DESKTOP_DIR/humble-vault-downloader.desktop"
  
  if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
  fi
  
  echo "Installation complete!"
  show_info "Installation complete!\n\nLaunching Humble Vault Downloader..."
  
  exec ./humble-vault-downloader.AppImage

elif [ "$OS" = "Darwin" ]; then
  # ============ macOS Installation ============
  INSTALL_DIR="$HOME/Applications"
  mkdir -p "$INSTALL_DIR"
  
  echo "Downloading Humble Vault Downloader for macOS..."
  
  # Determine which DMG to download
  if [ "$ARCH" = "arm64" ]; then
    DMG_PATTERN='_aarch64\.dmg"'
    echo "Detected Apple Silicon Mac"
  else
    DMG_PATTERN='_x64\.dmg"'
    echo "Detected Intel Mac"
  fi
  
  # Get DMG URL
  echo "Fetching latest release..."
  LATEST_URL=$(curl -sL https://api.github.com/repos/konsumer/humble_vault_downloader/releases/latest | grep '"browser_download_url":' | grep "$DMG_PATTERN" | cut -d '"' -f 4 | head -n1)
  
  if [ -z "$LATEST_URL" ]; then
    echo "Error: Could not find DMG in latest release"
    exit 1
  fi
  
  echo "Downloading from: $LATEST_URL"
  DMG_FILE="/tmp/HumbleVaultDownloader.dmg"
  
  if ! curl -L -o "$DMG_FILE" "$LATEST_URL"; then
    echo "Error: Download failed"
    exit 1
  fi
  
  echo "Mounting DMG..."
  MOUNT_DIR=$(hdiutil attach "$DMG_FILE" | grep /Volumes/ | sed 's/.*\(\/Volumes\/.*\)/\1/')
  
  if [ -z "$MOUNT_DIR" ]; then
    echo "Error: Failed to mount DMG"
    exit 1
  fi
  
  echo "Copying app..."
  cp -R "$MOUNT_DIR"/*.app "$INSTALL_DIR/" 2>/dev/null
  
  # Unmount and cleanup
  hdiutil detach "$MOUNT_DIR" -quiet
  rm "$DMG_FILE"
  
  APP_PATH=$(ls -d "$INSTALL_DIR"/*.app 2>/dev/null | grep -i humble | head -n1)
  
  echo "Installation complete!"
  echo "Humble Vault Downloader installed to: $APP_PATH"
  echo "Opening Applications folder..."
  
  open "$INSTALL_DIR"

else
  echo "Unsupported operating system: $OS"
  echo "This installer only supports Linux and macOS."
  exit 1
fi
