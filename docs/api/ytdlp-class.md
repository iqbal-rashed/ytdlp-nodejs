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

### `downloadAsync`

Downloads a video asynchronously.

```typescript
downloadAsync(url: string, options?: FormatOptions): Promise<string>
```

#### Options extended properties:

- `onProgress`: Callback for download progress.
- `printPaths`: Return output file paths.
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
