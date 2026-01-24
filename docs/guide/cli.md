# CLI Usage

`ytdlp-nodejs` comes with a powerful Command Line Interface (CLI) that supports both interactive and non-interactive modes.

## Interactive Mode

Simply run the command without arguments to start the interactive menu:

```bash
npx ytdlp
# or if installed globally
ytdlp
```

This will launch a beautiful interactive menu where you can:

- Download videos with quality selection
- Download audio with format selection
- Get formatted video information
- Update yt-dlp binary
- Download FFmpeg binaries

## Interactive Commands

These commands will prompt you for additional options interactively:

### Download Video

```bash
ytdlp download <url>
```

You'll be prompted to:

1. Select video quality (4K, 1080p, 720p, etc.)
2. Enter optional extra arguments (e.g., `--embed-subs`)

### Download Audio

```bash
ytdlp audio <url>
```

You'll be prompted to:

1. Select audio format (MP3, M4A, WAV, or Best Quality)
2. Enter optional extra arguments

### Get Video Info

```bash
ytdlp info <url>
```

Displays formatted video information including title, uploader, duration, views, and more.

## Direct Commands

These commands run without interactive prompts:

### List Formats

List all available formats for a video:

```bash
ytdlp formats <url>
```

### Download with Specific Quality

Download directly with a specific quality (non-interactive):

```bash
ytdlp video <url> --quality 1080p
```

### Download FFmpeg

Download FFmpeg binaries to the project:

```bash
ytdlp ffmpeg
```

### Update yt-dlp

Update the internal `yt-dlp` binary:

```bash
ytdlp update
```

## Examples

### Quick interactive download

```bash
ytdlp download https://youtube.com/watch?v=dQw4w9WgXcQ
# Select quality from menu → Downloads video
```

### Direct audio download

```bash
ytdlp audio https://youtube.com/watch?v=dQw4w9WgXcQ
# Select MP3 → Downloads as audio
```

### Get video information

```bash
ytdlp info https://youtube.com/watch?v=dQw4w9WgXcQ
# Displays formatted video details
```
