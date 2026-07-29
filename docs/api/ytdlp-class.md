# YtDlp Class

The main entry point for the library.

```typescript
import { YtDlp } from 'ytdlp-nodejs';
```

## Constructor

```typescript
new YtDlp(options?: YtDlpOptions)
```

### Options

- `binaryPath` (string): Custom path to `yt-dlp` executable.
- `ffmpegPath` (string): Custom path to `ffmpeg` executable.

## Methods

### `download`

Returns a fluent builder for downloading videos. Chain methods to configure and call `.run()` to execute.

```typescript
download(url: string, options?: FormatOptions): Download
```

#### Example

```typescript
const result = await ytdlp
  .download('https://youtube.com/watch?v=...')
  .filter('mergevideo')
  .quality('1080p')
  .type('mp4')
  .output('./downloads')
  .embedThumbnail()
  .on('progress', (p) => console.log(p.percentage_str))
  .run();

console.log('Files:', result.filePaths);
```

#### Builder Methods

| Category      | Methods                                                 |
| ------------- | ------------------------------------------------------- |
| **Format**    | `.format()`, `.quality()`, `.type()`                    |
| **Output**    | `.output()`, `.setOutputTemplate()`                     |
| **Audio**     | `.extractAudio()`, `.audioFormat()`, `.audioQuality()`  |
| **Embed**     | `.embedThumbnail()`, `.embedSubs()`, `.embedMetadata()` |
| **Subtitles** | `.writeSubs()`, `.writeAutoSubs()`, `.subLangs()`       |
| **Network**   | `.proxy()`, `.rateLimit()`, `.cookies()`                |
| **Events**    | `.on('progress')`, `.on('error')`, `.on('finish')`      |
| **Execute**   | `.run()` - returns `Promise<DownloadFinishResult>`      |

### `downloadAsync`

Downloads a video asynchronously with callback-style progress.

```typescript
downloadAsync(url: string, options?: FormatOptions): Promise<DownloadResult>
```

#### Options extended properties:

- `onProgress`: Callback for download progress.
- `format`: Format options object.
- `output`: Custom output template.

### `stream`

Creates a readable stream from a video URL.

```typescript
stream(url: string, options?: FormatOptions): PipeResponse
```

Returns an object with `pipe` and `pipeAsync` methods.

### `getInfoAsync`

Fetches metadata for a video or playlist.

```typescript
getInfoAsync(url: string, options?: InfoOptions): Promise<VideoInfo | PlaylistInfo>
```

### `getFormatsAsync`

Gets available formats for a video.

```typescript
getFormatsAsync(url: string, options?: ArgsOptions): Promise<FormatsResult>
```

### `getDirectUrlsAsync`

Gets direct media URLs for a video.

```typescript
getDirectUrlsAsync(url: string, options?: ArgsOptions): Promise<string[]>
```

### `getThumbnailsAsync`

Gets all thumbnails for a video.

```typescript
getThumbnailsAsync(url: string): Promise<VideoThumbnail[]>
```

### `getSubtitles`

Returns the available manual subtitles and automatic captions as normalized
`SubtitleInfo` records.

```typescript
getSubtitles(url: string, options?: ArgsOptions): Promise<SubtitleInfo[]>
```

### `getComments`

Fetches comments exposed by the extractor. `maxComments` limits the requested
number of YouTube comments.

```typescript
getComments(url: string, maxComments?: number, options?: ArgsOptions): Promise<unknown[]>
```

### `getVersionAsync`

Returns the version reported by the configured yt-dlp binary.

```typescript
getVersionAsync(): Promise<string>
```

### `checkInstallationAsync`

Checks if binaries are installed.

```typescript
checkInstallationAsync(options?: { ffmpeg?: boolean }): Promise<boolean>
```

### `updateYtDlpAsync`

Updates the yt-dlp binary.

```typescript
updateYtDlpAsync(): Promise<UpdateResult>
```
