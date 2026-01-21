# Installation

To install `ytdlp-nodejs` in your project, run:

```bash npm2yarn
npm install ytdlp-nodejs
```

## System Requirements

- **Node.js**: Version 14 or higher.
- **Python**: Required by `yt-dlp` (usually pre-installed on most systems).
- **FFmpeg** (Recommended): Required for merging audio/video and format conversion.

## Installing FFmpeg

While `ytdlp-nodejs` handles the `yt-dlp` binary automatically, you may need to install FFmpeg manually if it's not already on your system.

### Option A: Using the built-in helper

You can download a static FFmpeg build directly using the library:

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();
await ytdlp.downloadFFmpeg();
```

### Option B: Manual Installation

- **Windows**: Download from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/), extract, and add to PATH.
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg`

## Configuration

When instantiating `YtDlp`, you can specify custom paths to the binaries if needed:

```typescript
const ytdlp = new YtDlp({
  binaryPath: '/usr/local/bin/yt-dlp',
  ffmpegPath: '/usr/local/bin/ffmpeg',
});
```
