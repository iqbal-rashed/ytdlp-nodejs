# Examples

This page demonstrates common use cases with complete, runnable code examples.

## Download a Video with Progress

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

async function downloadWithProgress() {
  // Fluent builder API
  const result = await ytdlp
    .download('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .filter('mergevideo')
    .quality('1080p')
    .type('mp4')
    .output('./downloads')
    .on('progress', (progress) => {
      console.log(`Downloaded: ${progress.percentage_str}`);
      console.log(`Speed: ${progress.speed_str}`);
      console.log(`ETA: ${progress.eta_str}`);
    })
    .run();

  console.log('Download complete!');
  console.log('Files:', result.filePaths);
}

downloadWithProgress();
```

## Get Video Information

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

async function getVideoInfo() {
  const info = await ytdlp.getInfoAsync(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  );

  console.log('Title:', info.title);
  console.log('Duration:', info.duration, 'seconds');
  console.log('Views:', info.view_count);
  console.log('Uploader:', info.uploader);
  console.log('Available formats:', info.formats?.length);
}

getVideoInfo();
```

## Stream to File

```typescript
import { YtDlp } from 'ytdlp-nodejs';
import { createWriteStream } from 'fs';

const ytdlp = new YtDlp();

async function streamToFile() {
  const stream = ytdlp.stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
    format: { filter: 'audioandvideo', type: 'mp4' },
    onProgress: (p) => console.log(`${p.percentage_str}`),
  });

  const file = createWriteStream('output.mp4');
  await stream.pipeAsync(file);
  console.log('Stream complete!');
}

streamToFile();
```

## Download Audio Only

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

async function downloadAudio() {
  // Method 1: Using fluent builder API
  const result = await ytdlp
    .download('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .filter('audioonly')
    .type('mp3')
    .quality(0) // 0-10, 0 is best
    .on('progress', (p) => console.log(p.percentage_str))
    .run();

  console.log('Audio downloaded:', result.filePaths);

  // Method 2: Using downloadAudio helper
  await ytdlp.downloadAudio(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'mp3',
  );
}

downloadAudio();
```

## Get Direct URLs

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

async function getUrls() {
  // Get direct streaming URLs for all formats
  const urls = await ytdlp.getDirectUrlsAsync(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  );

  console.log(`Found ${urls.length} format URLs`);
  console.log('First URL:', urls[0]);
}

getUrls();
```

## List Available Formats

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

async function listFormats() {
  const result = await ytdlp.getFormatsAsync(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  );

  console.log(`Found ${result.formats.length} formats`);

  // Filter video formats
  const videoFormats = result.formats.filter(
    (f) => f.vcodec !== 'none' && f.acodec === 'none',
  );
  console.log('Video-only formats:', videoFormats.length);

  // Filter audio formats
  const audioFormats = result.formats.filter(
    (f) => f.acodec !== 'none' && f.vcodec === 'none',
  );
  console.log('Audio-only formats:', audioFormats.length);
}

listFormats();
```

## Get Video as File Object

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

async function getVideoFile() {
  const file = await ytdlp.getFileAsync(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    {
      format: { filter: 'audioandvideo', type: 'mp4' },
      onProgress: (p) => console.log(p.percentage_str),
    },
  );

  console.log('File name:', file.name);
  console.log('File size:', file.size, 'bytes');
  console.log('MIME type:', file.type);

  // Use the file object (e.g., upload to cloud storage)
  // const buffer = await file.arrayBuffer();
}

getVideoFile();
```

## Execute Raw Command

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

async function execRawCommand() {
  // Execute with custom arguments
  const output = await ytdlp.execAsync(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    {
      rawArgs: ['--print', 'title', '--print', 'duration'],
    },
  );
  console.log(output);
}

execRawCommand();
```
