# ytdlp-nodejs

[![npm version](https://img.shields.io/npm/v/ytdlp-nodejs.svg)](https://www.npmjs.com/package/ytdlp-nodejs)
[![License](https://img.shields.io/npm/l/ytdlp-nodejs.svg)](https://github.com/iqbal-rashed/ytdlp-nodejs/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-online-blue)](https://iqbal-rashed.github.io/ytdlp-nodejs)

A powerful Node.js wrapper for [yt-dlp](https://github.com/yt-dlp/yt-dlp) that provides a simple, type-safe interface for downloading, streaming, and fetching metadata from videos across thousands of websites.

📚 **[View Full Documentation](https://iqbal-rashed.github.io/ytdlp-nodejs)**

## Features

- 🚀 **Easy to use** - Simple API with TypeScript support
- 📥 **Download & Stream** - Download videos or stream them directly
- 📊 **Progress tracking** - Real-time download progress callbacks
- 🎵 **Audio extraction** - Extract audio in various formats (MP3, FLAC, etc.)
- 📋 **Metadata fetching** - Get video info, formats, thumbnails, and more
- 🔄 **Auto-updates** - Built-in yt-dlp binary management
- 💻 **CLI included** - Interactive and non-interactive command-line interface
- 🌐 **Node.js runtime** - Uses Node.js as the default JavaScript runtime for yt-dlp

## Installation

```bash
npm install ytdlp-nodejs
```

> **Note**: FFmpeg is recommended for full functionality. Install it manually or use the built-in `downloadFFmpeg()` method.

## Quick Start

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

// Download a video
const result = await ytdlp.downloadAsync(
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  {
    onProgress: (progress) => console.log(`${progress.percent}%`),
  },
);

// Get video info
const info = await ytdlp.getInfoAsync(
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
);
console.log(info.title);

// Stream to file
import { createWriteStream } from 'fs';
const stream = ytdlp.stream('https://youtube.com/watch?v=dQw4w9WgXcQ');
await stream.pipeAsync(createWriteStream('video.mp4'));
```

## CLI Usage

### Interactive Mode

```bash
ytdlp-nodejs
```

### Commands

```bash
# Download video
ytdlp-nodejs download <url> --format "bestvideo+bestaudio"

# Download audio only
ytdlp-nodejs download <url> --audio-only --audio-format mp3

# List available formats
ytdlp-nodejs formats <url>

# Get direct URLs
ytdlp-nodejs urls <url>

# Download subtitles
ytdlp-nodejs subs <url> --sub-langs en,es --sub-format srt

# Update yt-dlp
ytdlp-nodejs update
```

## API Reference

### Constructor

```typescript
const ytdlp = new YtDlp({
  binaryPath?: string,  // Path to yt-dlp binary
  ffmpegPath?: string,  // Path to ffmpeg binary
});
```

### Download Methods

#### `downloadAsync(url, options?)`

Downloads a video asynchronously.

```typescript
const result = await ytdlp.downloadAsync(url, {
  format: 'bestvideo+bestaudio', // or use Format Options
  output: './downloads/%(title)s.%(ext)s',
  onProgress: (progress) => console.log(progress),
  printPaths: true,
  onPaths: (paths) => console.log('Saved to:', paths),
});
```

#### `download(url, options?)`

Downloads synchronously, returning a `ChildProcess` with progress events.

```typescript
const process = ytdlp.download(url, { format: 'best' });
process.on('progress', (p) => console.log(p));
process.on('close', () => console.log('Done'));
```

#### `downloadAudio(url, format?, options?)`

Downloads audio only.

```typescript
await ytdlp.downloadAudio(url, 'mp3'); // 'aac', 'flac', 'mp3', 'm4a', 'opus', 'vorbis', 'wav', 'alac'
```

#### `downloadVideo(url, quality?, options?)`

Downloads video with specific quality.

```typescript
await ytdlp.downloadVideo(url, '1080p'); // 'best', '2160p', '1440p', '1080p', '720p', etc.
```

### Streaming

#### `stream(url, options?)`

Returns a stream for piping.

```typescript
const ytdlpStream = ytdlp.stream(url, {
  format: { filter: 'audioandvideo', type: 'mp4', quality: 'highest' },
  onProgress: (p) => console.log(p),
});

// Sync pipe
ytdlpStream.pipe(writableStream);

// Async pipe
await ytdlpStream.pipeAsync(writableStream);
```

#### `getFileAsync(url, options?)`

Returns a `File` object without saving to disk.

```typescript
const file = await ytdlp.getFileAsync(url, {
  format: { filter: 'audioonly', type: 'mp3' },
  onProgress: (p) => console.log(p),
});
console.log(file.name, file.size);
```

### Information Methods

#### `getInfoAsync(url, options?)`

Fetches video/playlist metadata.

```typescript
const info = await ytdlp.getInfoAsync(url);
console.log(info.title, info.duration, info.formats);
```

#### `getFormatsAsync(url, options?)`

Gets available formats using JSON output.

```typescript
const result = await ytdlp.getFormatsAsync(url);
console.log(`Found ${result.formats.length} formats`);
```

#### `getDirectUrlsAsync(url, options?)`

Returns direct media URLs.

```typescript
const urls = await ytdlp.getDirectUrlsAsync(url);
```

#### `getTitleAsync(url)`

```typescript
const title = await ytdlp.getTitleAsync(url);
```

#### `getThumbnailsAsync(url)`

```typescript
const thumbnails = await ytdlp.getThumbnailsAsync(url);
```

#### `getVersionAsync()`

```typescript
const version = await ytdlp.getVersionAsync();
```

### Utility Methods

#### `checkInstallationAsync(options?)`

```typescript
const installed = await ytdlp.checkInstallationAsync({ ffmpeg: true });
```

#### `downloadFFmpeg()`

```typescript
await ytdlp.downloadFFmpeg();
```

#### `updateYtDlpAsync(options?)`

```typescript
const result = await ytdlp.updateYtDlpAsync();
console.log(`Updated to ${result.version}`);
```

## Format Options

Use structured format options for type-safe configuration:

```typescript
// Video only
{ filter: 'videoonly', type: 'mp4', quality: '1080p' }

// Audio only
{ filter: 'audioonly', type: 'mp3', quality: 5 }

// Audio and video (single file)
{ filter: 'audioandvideo', type: 'mp4', quality: 'highest' }

// Merge video and audio
{ filter: 'mergevideo', type: 'mp4', quality: '1080p' }
```

### Quality Options

| Filter                    | Quality Values                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `videoonly`, `mergevideo` | `'2160p'`, `'1440p'`, `'1080p'`, `'720p'`, `'480p'`, `'360p'`, `'240p'`, `'144p'`, `'highest'`, `'lowest'` |
| `audioandvideo`           | `'highest'`, `'lowest'`                                                                                    |
| `audioonly`               | `0` to `10` (VBR quality)                                                                                  |

### Type Options

| Filter                       | Type Values                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `videoonly`, `audioandvideo` | `'mp4'`, `'webm'`                                                            |
| `audioonly`                  | `'aac'`, `'flac'`, `'mp3'`, `'m4a'`, `'opus'`, `'vorbis'`, `'wav'`, `'alac'` |
| `mergevideo`                 | `'mkv'`, `'mp4'`, `'ogg'`, `'webm'`, `'flv'`                                 |

## Advanced Options

### JavaScript Runtime

Node.js is used as the default JavaScript runtime for yt-dlp extractors:

```typescript
await ytdlp.execAsync(url, {
  jsRuntime: 'node', // default, or 'deno', 'phantomjs'
});
```

### Raw Arguments

Pass any yt-dlp argument directly:

```typescript
await ytdlp.downloadAsync(url, {
  rawArgs: ['--match-filter', 'duration > 60', '--geo-bypass'],
});
```

### Debug Mode

```typescript
await ytdlp.execAsync(url, {
  debugPrintCommandLine: true,
  verbose: true,
});
```

## Configuration

CLI settings are stored in an OS-specific config file:

| OS      | Path                                                     |
| ------- | -------------------------------------------------------- |
| macOS   | `~/Library/Application Support/ytdlp-nodejs/config.json` |
| Linux   | `~/.config/ytdlp-nodejs/config.json`                     |
| Windows | `%APPDATA%\ytdlp-nodejs\config.json`                     |

Set `YTDLP_NODEJS_CONFIG_DIR` environment variable to override.

## Troubleshooting

### Binary not found

```typescript
import { helpers } from 'ytdlp-nodejs';
await helpers.downloadYtDlp();
await helpers.downloadFFmpeg();
```

Or provide custom paths:

```typescript
const ytdlp = new YtDlp({
  binaryPath: '/path/to/yt-dlp',
  ffmpegPath: '/path/to/ffmpeg',
});
```

## Built With ytdlp-nodejs

🚀 **[NextDownloader.com](https://nextdownloader.com/)** - A video downloader I built using this library. Check it out and let me know what you think! Your feedback is greatly appreciated.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue on [GitHub](https://github.com/iqbal-rashed/ytdlp-nodejs).

## License

MIT
