# Introduction

**ytdlp-nodejs** is a robust Node.js wrapper for [yt-dlp](https://github.com/yt-dlp/yt-dlp), a highly versatile command-line video downloader. This package makes it easy to integrate video downloading, streaming, and metadata extraction capabilities into your Node.js applications.

## Why ytdlp-nodejs?

- **Simplicity**: Abstracts away the complexity of spawning child processes and parsing output.
- **Type Safety**: Fully typed with TypeScript, providing autocompletion and error checking.
- **Flexibility**: Supports all major yt-dlp features including custom formats, subtitles, and cookies.
- **Reliability**: Handles binary management automatically, ensuring you always have a working yt-dlp executable.
- **Performance**: Streams data directly using Node.js streams for efficiency.

## Key Features

- **Download**: Save videos and audio to disk with a single function call.
- **Stream**: Pipe video/audio data directly to other streams (e.g., Express responses, file streams).
- **Metadata**: Fetch detailed video info, formats, and playlists as typed objects.
- **CLI**: Interactive terminal interface for quick manual downloads.
- **Customization**: Full access to raw yt-dlp arguments for advanced use cases.
