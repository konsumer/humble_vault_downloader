# Contributing

## Making a Release

### Automatic (Recommended)

Use the release script:

```bash
./release.sh
```

This will:
1. Prompt you for a new version number
2. Update `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`
3. Show you the next steps to commit and push

Then:
```bash
git add -A
git commit -m "Release v0.2.0"
git tag v0.2.0
git push && git push --tags
```

GitHub Actions will automatically:
- Build for macOS (Apple Silicon + Intel)
- Build for Linux (AppImage + .deb)
- Create a draft release with all the binaries

Go to the Releases page on GitHub to publish the draft release.

### Manual

1. Update version in:
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`

2. Commit and tag:
   ```bash
   git add -A
   git commit -m "Release v0.2.0"
   git tag v0.2.0
   git push && git push --tags
   ```

## Building Locally

### Development
```bash
npm install
npm start
```

### Production Build
```bash
npm run tauri build
```

Outputs:
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Linux**: `src-tauri/target/release/bundle/appimage/` and `src-tauri/target/release/bundle/deb/`

## Testing

The build test workflow runs on every push to main/master and on pull requests.

To test locally before pushing:
```bash
npm run tauri build
```
