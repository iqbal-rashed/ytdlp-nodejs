# CLI Usage

`ytdlp-nodejs` comes with a powerful Command Line Interface (CLI) that supports both interactive and non-interactive modes.

## Interactive Mode

Simply run the command without arguments to start the interactive menu:

```bash
npx ytdlp-nodejs
# or if installed globally
ytdlp-nodejs
```

This will launch a Text User Interface (TUI) where you can select actions like "Download video", "Get info", "Update yt-dlp", and more.

## Command Mode

You can also run specific commands directly.

### Download

Download a video with specific format:

```bash
ytdlp-nodejs download <url> --format "bestvideo+bestaudio"
```

Download audio only:

```bash
ytdlp-nodejs download <url> --audio-only --audio-format mp3
```

### Get Info

Get video information as JSON:

```bash
ytdlp-nodejs info <url>
```

### List Formats

List all available formats for a video:

```bash
ytdlp-nodejs formats <url>
```

### Direct URLs

Get the direct streaming URLs:

```bash
ytdlp-nodejs urls <url>
```

### Subtitles

Download subtitles:

```bash
ytdlp-nodejs subs <url> --sub-langs en,es --sub-format srt --auto
```

### Update

Update the internal `yt-dlp` binary:

```bash
ytdlp-nodejs update
```

## CLI Configuration

The CLI saves your preferences in a `config.json` file. You can configure settings like default download directory, proxy, and concurrency via the interactive "Settings" menu.
