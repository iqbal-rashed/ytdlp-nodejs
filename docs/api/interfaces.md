# Interfaces

Key TypeScript interfaces used in the library.

## VideoInfo

The main object returned by `getInfoAsync`.

```typescript
interface VideoInfo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  description: string;
  uploader: string;
  uploader_id: string;
  uploader_url: string;
  duration: number;
  view_count: number;
  like_count: number;
  upload_date: string;

  // Format details
  formats: VideoFormat[];

  // Subtitles
  subtitles?: Record<string, SubtitleInfo[]>;
  automatic_captions?: Record<string, SubtitleInfo[]>;

  // Chapters
  chapters?: ChapterInfo[];
}
```

## VideoFormat

Details about a specific audio/video format.

```typescript
interface VideoFormat {
  format_id: string;
  url: string;
  ext: string;
  format: string; // e.g., "137 - 1920x1080 (1080p60)"

  // Video details
  resolution?: string;
  width?: number;
  height?: number;
  fps?: number;
  vcodec?: string;

  // Audio details
  acodec?: string;
  audio_channels?: number;

  filesize?: number;
}
```

## VideoThumbnail

```typescript
interface VideoThumbnail {
  id: string;
  url: string;
  height?: number;
  width?: number;
  resolution?: string;
}
```

## VideoProgress

Progress information returned during download/stream operations.

```typescript
interface VideoProgress {
  filename: string;
  status: 'downloading' | 'finished';
  downloaded?: number;
  downloaded_str?: string;
  total?: number;
  total_str?: string;
  speed?: number;
  speed_str?: string;
  eta?: number;
  eta_str?: string;
  percentage?: number;
  percentage_str?: string;
}
```

## DownloadFinishResult

Result returned by download builder's `run()` method.

```typescript
interface DownloadFinishResult {
  output: string;
  filePaths: string[];
  info: DownloadedVideoInfo[];
  stderr: string;
}
```

## YtDlpContext

Shared context interface for internal operations.

```typescript
interface YtDlpContext {
  binaryPath: string;
  ffmpegPath?: string;
}
```
