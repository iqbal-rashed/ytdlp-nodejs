# Quick Start

This guide will help you get started with the basics of `ytdlp-nodejs`.

## Basic Setup

First, import and initialize the library:

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();
```

## Downloading a Video

Download a video with default settings (best quality):

```typescript
await ytdlp.downloadAsync('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
```

To track progress and handle the output:

```typescript
await ytdlp.downloadAsync('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
  onProgress: (progress) => {
    console.log(`Downloading: ${progress.percent}%`);
    console.log(`Speed: ${progress.currentSpeed}`);
    console.log(`ETA: ${progress.eta}`);
  },
  printPaths: true,
  onPaths: (paths) => console.log('Saved files:', paths),
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
