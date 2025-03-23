> Important Note: This is currently on beta. If someone can help me to create this docs.

# ytdlp-nodejs

A TypeScript wrapper for the yt-dlp executable that supports both ESM and CommonJS.

## Installation

Before installing, ensure you have yt-dlp installed and available in your PATH. You can download it from [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp).

To install the package, run:

```bash
npm install ytdlp-nodejs
```

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

    await ytdlpStream.promisePipe(st);

    console.log('Download completed');
  } catch (error) {
    console.error('Error:', error);
  }
}

streamVideo();
```

## API

### `new YtDlp(options?: YtDlpOptions)`

Creates a new instance of `YtDlp`.

#### Parameters:

- `options.binaryPath` (optional): Custom path to the `yt-dlp` binary.
- `options.ffmpegPath` (optional): Custom path to the `ffmpeg` binary.

---

### `checkInstallation(): Promise<boolean>`

Checks if `yt-dlp` is installed and accessible.

```javascript
const isInstalled = await ytdlp.checkInstallation();
console.log(isInstalled ? 'yt-dlp is installed' : 'yt-dlp is not installed');
```

---

### `download(url: string, options?: DownloadOptions): Promise<string>`

Downloads a video from the given URL.

#### Options: All the options are available https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#usage-and-options

- `onProgress` (optional): Callback function to monitor download progress.

```javascript
await ytdlp.download('https://www.youtube.com/watch?v=example');
```

---

### `stream(url: string, options?: StreamOptions): PipeResponse`

Streams a video and pipes the output.

#### Options: All the options are available https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#usage-and-options

- `onProgress` (optional): Callback function to monitor stream progress.

```javascript
const st = createWriteStream('video.mp4');
const ytdlpStream = ytdlp.stream('https://www.youtube.com/watch?v=example');
await ytdlpStream.promisePipe(st);
```

---

### `getInfo(url: string): Promise<VideoInfo>`

Fetches metadata of the given video.

```javascript
const info = await ytdlp.getInfo('https://www.youtube.com/watch?v=example');
console.log(info);
```

---

### `getThumbnails(url: string): Promise<VideoThumbnail[]>`

Retrieves available thumbnails for the given video.

```javascript
const thumbnails = await ytdlp.getThumbnails(
  'https://www.youtube.com/watch?v=example'
);
console.log(thumbnails);
```

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue on GitHub.

## License

This project is licensed under the MIT License.
