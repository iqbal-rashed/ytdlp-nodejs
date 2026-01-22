# Troubleshooting

Common issues and how to resolve them.

## Ytdlp binary not found

**Error**: `Error: Ytdlp binary not found`

**Solution**:
The library tries to download `yt-dlp` automatically. If it fails, you can run the download manually:

```typescript
import { YtDlp } from 'ytdlp-nodejs';
const ytdlp = new YtDlp();
await ytdlp.downloadYtDlp(); // Downloads to local ./bin folder
```

Or set `binaryPath` in the constructor to point to your system's `yt-dlp`.

## FFmpeg not found

**Error**: `ERROR: ffmpeg not found. Please install or provide the path using --ffmpeg-location`

**Solution**:
FFmpeg is required for merging audio/video and format conversion.

1. Install it via your OS package manager (`brew install ffmpeg` / `apt install ffmpeg`).
2. Or use the built-in helper: `await ytdlp.downloadFFmpeg()`.

## Video downloads without audio (separate files)

**Problem**: When using `mergevideo`, you get a video file without audio or two separate files.

**Cause**: FFmpeg is required to merge video and audio streams into a single file.

**Solution**:

1. **Verify FFmpeg is installed**:

```typescript
const isInstalled = await ytdlp.checkInstallationAsync({ ffmpeg: true });
console.log('FFmpeg installed:', isInstalled);
```

2. **Download FFmpeg using the library**:

```typescript
await ytdlp.downloadFFmpeg();
```

3. **Specify FFmpeg path explicitly**:

```typescript
const ytdlp = new YtDlp({
  ffmpegPath: '/path/to/ffmpeg',
});
```

4. **Use verbose mode to debug**:

```typescript
await ytdlp.downloadAsync(url, {
  format: { filter: 'mergevideo', type: 'mp4', quality: '720p' },
  verbose: true,
  debugPrintCommandLine: true,
});
```

## HTTP 429: Too Many Requests

**Error**: `HTTP Error 429: Too Many Requests`

**Solution**:
YouTube is rate-limiting your IP.

- Use cookies (`cookies` or `cookiesFromBrowser` option).
- Use a proxy (`proxy` option).
- Wait for some time before trying again.

## Signature extraction failed

**Error**: `Unable to extract signature`

**Solution**:
This usually means `yt-dlp` is outdated or the JS runtime is missing.

1. Update `yt-dlp`: `await ytdlp.updateYtDlpAsync()`.
2. Ensure you are using a JS runtime: `jsRuntime: 'node'`.

## Sign in to confirm you’re not a bot

**Error**: `Sign in to confirm you’re not a bot`

**Solution**:
YouTube is blocking automated requests.

- Use `cookiesFromBrowser: 'chrome'` (or your browser).
- This uses your logged-in session cookies to authenticate.
