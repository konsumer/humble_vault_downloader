#!/bin/bash
set -e

echo "Installing Humble Vault Downloader..."

# Create directories
INSTALL_DIR="$HOME/.local/share/humble-vault-downloader"
DESKTOP_DIR="$HOME/.local/share/applications"
mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"

# Download latest AppImage
echo "Downloading latest version..."
cd "$INSTALL_DIR"

LATEST_URL=$(curl -s https://api.github.com/repos/konsumer/humble_vault_downloader/releases/latest | grep "browser_download_url.*AppImage" | cut -d : -f 2,3 | tr -d \" | tr -d " ")

if [ -z "$LATEST_URL" ]; then
  echo "Error: Could not find AppImage in latest release"
  exit 1
fi

echo "Downloading from: $LATEST_URL"
curl -L -o humble-vault-downloader.AppImage "$LATEST_URL"
chmod +x humble-vault-downloader.AppImage

# Create desktop file
echo "Creating desktop entry..."
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
EOF

chmod +x "$DESKTOP_DIR/humble-vault-downloader.desktop"

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
  update-desktop-database "$DESKTOP_DIR"
fi

echo ""
echo "✓ Installation complete!"
echo ""
echo "Humble Vault Downloader has been installed to:"
echo "  $INSTALL_DIR/humble-vault-downloader.AppImage"
echo ""
echo "You can now launch it from your application menu or run:"
echo "  $INSTALL_DIR/humble-vault-downloader.AppImage"
echo ""
echo "To update to the latest version, run this script again."
