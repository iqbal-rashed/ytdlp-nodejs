# Format Options

You can specify format options using a structured object or a string.

## Structure

```typescript
interface FormatOptions {
  filter?: 'videoonly' | 'audioonly' | 'audioandvideo' | 'mergevideo';
  quality?: string | number;
  type?: string;
  // ... other standard options like output, onProgress
}
```

## Filters

### `videoonly`

Downloads video stream only.

- **Quality**: `'2160p'`, `'1440p'`, `'1080p'`, `'720p'`, `'480p'`, `'360p'`, `'highest'`, `'lowest'`
- **Type**: `'mp4'`, `'webm'`

### `audioonly`

Downloads audio stream only.

- **Quality**: `0` (best) to `10` (worst)
- **Type**: `'mp3'`, `'aac'`, `'flac'`, `'m4a'`, `'opus'`, `'wav'`

### `audioandvideo`

Downloads a single file containing both audio and video (no merging required).

- **Quality**: `'highest'`, `'lowest'`
- **Type**: `'mp4'`, `'webm'`

### `mergevideo`

Downloads best video and best audio separately and merges them using FFmpeg.

- **Quality**: same as `videoonly`
- **Type**: `'mkv'`, `'mp4'`, `'webm'`

## Examples

```typescript
// Best quality video+audio
{ filter: 'mergevideo', quality: 'highest', type: 'mp4' }

// Audio only (MP3)
{ filter: 'audioonly', type: 'mp3', quality: 5 }

// Specific resolution
{ filter: 'videoonly', quality: '1080p', type: 'webm' }
```
