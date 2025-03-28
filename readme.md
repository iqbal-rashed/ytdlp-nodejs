> Important Note: Version 2 is finally here! 🎉 This is still in beta, so please feel free to submit feature requests.

# ytdlp-nodejs

This Node.js module is a wrapper for `yt-dlp`, a powerful video downloader, that allows you to download, stream, and fetch metadata for videos from various websites. The wrapper automatically downloads the `yt-dlp` binary and provides a simple interface for using its features directly within a Node.js environment.

## Installation

To install the `yt-dlp` Node.js wrapper, run:

```bash
npm i ytdlp-nodejs@2.0.3-beta
```

This package will automatically download the `yt-dlp` binary for you, eliminating the need for manual installation.

## Usage

### Importing the Package

```javascript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();
```

### Downloading a Video

```javascript
async function downloadVideo() {
  try {
    const output = await ytdlp.download(
      'https://www.youtube.com/watch?v=_AL4IwHuHlY',
      {
        onProgress: (progress) => {
          console.log(progress);
        },
        // others args
      }
    );
    console.log('Download completed:', output);
  } catch (error) {
    console.error('Error:', error);
  }
}

downloadVideo();
```

### Streaming a Video

```javascript
import { createWriteStream } from 'fs';

async function streamVideo() {
  try {
    const st = createWriteStream('video.mp4');

    const ytdlpStream = ytdlp.stream(
      'https://www.youtube.com/watch?v=_AL4IwHuHlY',
      {
        onProgress: (progress) => {
          console.log(progress);
        },
        // others args
      }
    );

    await ytdlpStream.pipeAsync(st);

    console.log('Download completed');
  } catch (error) {
    console.error('Error:', error);
  }
}

streamVideo();
```

## Class: `YtDlp`

### `constructor(opt?)`

The constructor initializes the `YtDlp` object.

#### Parameters:

- `opt` (optional): Options to configure the paths for `yt-dlp` and `ffmpeg`.
  - `binaryPath`: Path to the `yt-dlp` binary (optional).
  - `ffmpegPath`: Path to the `ffmpeg` binary (optional).

#### Example:

```typescript
const ytDlp = new YtDlp({
  binaryPath: 'path-to-yt-dlp',
  ffmpegPath: 'path-to-ffmpeg',
});
```

### `checkInstallationAsync(options?): Promise<boolean>`

Asynchronously checks if both `yt-dlp` and optionally `ffmpeg` binaries are installed and available.

#### Parameters:

- `options` (optional): An object to specify if `ffmpeg` should also be checked.
  - `ffmpeg`: If set to `true`, it checks if `ffmpeg` is installed.

#### Returns:

- `Promise<boolean>`: Resolves to `true` if both `yt-dlp` and `ffmpeg` are installed (if required), otherwise `false`.

#### Example:

```typescript
const isInstalled = await ytDlp.checkInstallationAsync({ ffmpeg: true });
```

### `checkInstallation(options?): boolean`

Synchronously checks if both `yt-dlp` and optionally `ffmpeg` binaries are installed and available.

#### Parameters:

- `options` (optional): An object to specify if `ffmpeg` should also be checked.
  - `ffmpeg`: If set to `true`, it checks if `ffmpeg` is installed.

#### Returns:

- `boolean`: `true` if both `yt-dlp` and `ffmpeg` are installed (if required), otherwise `false`.

#### Example:

```typescript
const isInstalled = ytDlp.checkInstallation({ ffmpeg: true });
```

### `execAsync(url, options?): Promise<string>`

Asynchronously executes `yt-dlp` with the provided URL and options.

#### Parameters:

- `url`: The URL of the video to download or stream.
- `options` (optional): Additional options to pass to `yt-dlp`:
  - `onData`: A callback that is triggered when data is received from `yt-dlp`.
  - `onProgress`: An callback function to track progess of downloading.

#### Returns:

- `Promise<string>`: Resolves to the output of the `yt-dlp` command.

#### Example:

```typescript
const result = await ytDlp.execAsync(
  'https://www.youtube.com/watch?v=exampleVideoID'
);
```

### `exec(url, options?): ChildProcess `

Synchronously executes `yt-dlp` with the provided URL and options.

#### Parameters:

- `url`: The URL of the video to download or stream.
- `options` (optional): Additional options to pass to `yt-dlp`.

#### Returns:

- `ChildProcess`: The spawned child process running `yt-dlp`.
  - `on('progress')`: An event to track progess of downloading.

#### Example:

```typescript
const ytDlpProcess = ytDlp.exec(
  'https://www.youtube.com/watch?v=exampleVideoID'
);
```

### `download(url, options?): ChildProcess`

Downloads a video from the given URL.

#### Parameters:

- `url`: The URL of the video to download.
- `options` (optional): Additional options for downloading, such as video format.
  - `format`: String | [Format Options](#format-for-download).

#### Returns:

- `ChildProcess`: The spawned child process running `yt-dlp`.
  - `on('progress')`: An event to track progess of downloading.

#### Example:

```typescript
ytDlp.download('https://www.youtube.com/watch?v=exampleVideoID', {
  format: 'bestvideo+bestaudio',
});
```

### `downloadAsync(url, options?): Promise<string>`

Asynchronously downloads a video from the given URL.

#### Parameters:

- `url`: The URL of the video to download.
- `options` (optional): Additional options for downloading, such as video format and a progress callback.
  - `format`: String | [Format Options](#format-for-download).
  - `onProgress`: An callback function to track progess of downloading.

#### Returns:

- `Promise<string>`: Resolves to the output of the `yt-dlp` command.

#### Example:

```typescript
const result = await ytDlp.downloadAsync(
  'https://www.youtube.com/watch?v=exampleVideoID',
  {
    format: 'bestvideo+bestaudio',
  }
);
```

### `stream(url, options?): PipeResponse`

Streams a video from the given URL.

#### Parameters:

- `url`: The URL of the video to stream.
- `options` (optional): Additional options for streaming, such as video format and a progress callback.
  - `format`: String | [Format Options](#format-for-stream).
  - `onProgress`: An callback function to track progess of downloading.

#### Returns:

- `pipe`: A function that pipes the stream to a writable stream.
- `pipeAsync`: A function that pipes the stream asynchronously to a writable stream.

#### Example:

```typescript
const ytdlpStream = ytDlp.stream(
  'https://www.youtube.com/watch?v=exampleVideoID'
);
ytdlpStream.pipe(destinationStream);
```

### `getInfoAsync(url): Promise<VideoInfo>`

Fetches detailed information about a video asynchronously.

#### Parameters:

- `url`: The URL of the video.

#### Returns:

- `Promise<VideoInfo>`: Resolves to a `VideoInfo` object containing metadata about the video.

#### Example:

```typescript
const info = await ytDlp.getInfoAsync(
  'https://www.youtube.com/watch?v=exampleVideoID'
);
```

### `getThumbnailsAsync(url): Promise<VideoThumbnail[]>`

Fetches all available thumbnails for a video asynchronously.

#### Parameters:

- `url`: The URL of the video.

#### Returns:

- `Promise<VideoThumbnail[]>`: Resolves to an array of `VideoThumbnail` objects.

#### Example:

```typescript
const thumbnails = await ytDlp.getThumbnailsAsync(
  'https://www.youtube.com/watch?v=exampleVideoID'
);
```

### `downloadFFmpeg(): Promise<void>`

Downloads `ffmpeg` using a predefined method.

#### Returns:

- `Promise<void>`: Resolves once the download is complete.

#### Example:

```typescript
await ytDlp.downloadFFmpeg();
```

# Format Options

### `format` for Download

`filter:` "videoonly" | "audioonly" | "audioandvideo" | "mergevideo"

- `filter: "videoonly"`

  - `quality:` "2160p" |
    "1440p" |
    "1080p" |
    "720p" |
    "480p" |
    "360p" |
    "240p" |
    "144p" |
    "highest" |
    "lowest" (default: 'highest')
  - `type:` "mp4" | "webm" (default:'mp4')

- `filter: "audioonly"`

  - `quality:` "highest" | "lowest" (default:'highest')

- `filter: "audioandvideo"`

  - `quality:` "highest" | "lowest" (default:'highest')
  - `type:` "mp4" | "webm" (default:'mp4')

- `filter: "audioonly"`

  - `quality:` 0 to 10 (default:5)
  - `type:` "aac" | "flac" | "mp3" | "m4a" | "opus" | "vorbis" | "wav" | "alac" (default:'mp3')

- `filter: "mergevideo"`
  - `quality:` "2160p" |
    "1440p" |
    "1080p" |
    "720p" |
    "480p" |
    "360p" |
    "240p" |
    "144p" |
    "highest" |
    "lowest" (default: 'highest')
  - `format:` "mkv" | "mp4" | "ogg" | "webm" | "flv" (default:'mp4')

### `format` for Stream

`filter:` "videoonly" | "audioonly" | "audioandvideo"

- `filter: "videoonly"`

  - `quality:` "2160p" |
    "1440p" |
    "1080p" |
    "720p" |
    "480p" |
    "360p" |
    "240p" |
    "144p" |
    "highest" |
    "lowest" (default: 'highest')

- `filter: "audioonly"`

  - `quality:` "highest" | "lowest" (default:'highest')

- `filter: "audioandvideo"`

  - `quality:` "highest" | "lowest" (default:'highest')

- `filter: "extractaudio"`
  - `quality:` 0 to 10 (default:5)
  - `type:` "aac" | "flac" | "mp3" | "m4a" | "opus" | "vorbis" | "wav" | "alac" (default:'mp3')

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue on GitHub.
