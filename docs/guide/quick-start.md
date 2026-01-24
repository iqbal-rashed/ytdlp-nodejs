# Quick Start

This guide will help you get started with the basics of `ytdlp-nodejs`.

## Basic Setup

First, import and initialize the library:

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();
```

## Downloading a Video

Download a video using the fluent builder API:

```typescript
const result = await ytdlp
  .download('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  .filter('mergevideo')
  .quality('1080p')
  .type('mp4')
  .on('progress', (progress) => {
    console.log(`Downloading: ${progress.percentage_str}`);
    console.log(`Speed: ${progress.speed_str}`);
    console.log(`ETA: ${progress.eta_str}`);
  })
  .run();

console.log('Downloaded files:', result.filePaths);
```

Or use `downloadAsync` with callback-style progress:

```typescript
await ytdlp.downloadAsync('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
  format: { filter: 'mergevideo', quality: '1080p', type: 'mp4' },
  onProgress: (progress) => console.log(`${progress.percentage_str}`),
});
```

## Getting Video Info

Fetch metadata without downloading:

```typescript
const info = await ytdlp.getInfoAsync(
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
);

console.log('Title:', info.title);
console.log('Duration:', info.duration);
console.log('Views:', info.view_count);
```

## Streaming

Stream video directly to a file or another output stream:

```typescript
import { createWriteStream } from 'fs';

const ytdlpStream = ytdlp.stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
const fileStream = createWriteStream('video.mp4');

// Using async pipe
await ytdlpStream.pipeAsync(fileStream);
console.log('Stream finished!');
```

## Downloading Audio Only

Download and convert to MP3:

```typescript
await ytdlp.downloadAudio('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'mp3');
```
