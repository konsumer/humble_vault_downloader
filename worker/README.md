# Humble Vault Downloader - Cloudflare Worker

Web version of the Humble Vault Downloader that runs on Cloudflare Workers.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your Humble Bundle session token as a secret:

   ```bash
   npx wrangler secret put HUMBLE_TOKEN
   ```

   When prompted, paste your `_simpleauth_sess` cookie value.

   **To get your token:**
   - Open your browser and go to https://www.humblebundle.com
   - Log in to your account
   - Open Developer Tools (F12)
   - Go to Application/Storage → Cookies → https://www.humblebundle.com
   - Find the `_simpleauth_sess` cookie
   - Copy its value (without quotes)

3. Test locally:
   - put your token in .env as `HUMBLE_TOKEN=XXX`

   ```bash
   npm run dev
   ```

   Open http://localhost:8787

4. Deploy to Cloudflare:
   ```bash
   npm run deploy
   ```

## Features

- Browse all your Humble Bundle vault games
- View game details with screenshots and videos
- Get download links for any platform
- No login required - uses your token stored securely on the backend
- Dark mode support

## API Endpoints

- `GET /` - Frontend HTML
- `GET /api/games` - Fetch all vault games
- `POST /api/download` - Get signed download URL
  ```json
  {
    "machineName": "game_identifier",
    "filename": "path/to/file.zip"
  }
  ```

## Security

Your Humble Bundle session token is stored as a Cloudflare Worker secret and never exposed to the client. It's only used server-side to authenticate with Humble Bundle's API.

## Note

The session token will eventually expire. When it does, you'll need to get a new one and update the secret:

```bash
npx wrangler secret put HUMBLE_TOKEN
```
