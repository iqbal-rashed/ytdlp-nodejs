import { YtDlp } from '../src/index';

const ytdlp = new YtDlp();

import * as fs from 'fs';
import * as path from 'path';

const downloadsDir = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Method 1: Traditional downloadAsync with callback
async function downloadWithCallback() {
  try {
    const output = await ytdlp.downloadAsync(
      'https://www.youtube.com/watch?v=gICjCjpSg6M',
      {
        format: {
          filter: 'mergevideo',
          type: 'mp4',
          quality: '720p',
        },
        beforeDownload: (info) => {
          console.log(info);
        },
        onProgress: (progress) => {
          console.log(progress);
        },
        output: path.join(downloadsDir, '%(title)s.%(ext)s'),
      },
    );

    console.log('Download completed!');
    console.log('Video info:', output);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Method 2: Fluent builder API with .download(url)
async function downloadWithFluentAPI() {
  try {
    // Chain methods like FFmpeg - .download(url) returns a builder
    const result = await ytdlp
      .download('https://www.youtube.com/watch?v=_AL4IwHuHlY')
      .format({
        filter: 'mergevideo',
        type: 'mp4',
        quality: '720p',
      })
      .output(downloadsDir)
      .embedThumbnail()
      .on('progress', (progress) => {
        console.log(
          `Downloading: ${progress.percentage_str} at ${progress.speed_str}`,
        );
      })
      .on('error', (error) => {
        console.error('Download failed:', error.message);
      });

    console.log('Download Finished!');
    console.log('Files:', result.filePaths);
    console.log('Video Info:', result.info);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Method 3: Audio-only download
async function downloadAudio() {
  try {
    const result = await ytdlp
      .download('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      .format({ filter: 'audioonly', type: 'mp3', quality: 0 })
      .output(downloadsDir)
      .on('progress', (p) => console.log(`${p.percentage_str}`))
      .run();

    console.log('Audio downloaded:', result.filePaths);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Method 4: Stream to file
async function streamToFile() {
  const { createWriteStream } = await import('fs');

  try {
    const result = await ytdlp
      .stream('https://www.youtube.com/watch?v=bXUsb57dHU0')
      .format({ filter: 'mergevideo', type: 'mp4', quality: '1080p' })
      .on('beforeDownload', (info) => {
        console.log(info.title);
      })
      .on('progress', (p) => console.log(`Streaming: ${p.percentage_str}`))
      .pipeAsync(
        createWriteStream(path.join(downloadsDir, 'streamed-video.mp4')),
      );

    console.log('Stream complete!');
    console.log(`Bytes: ${result.bytes}, Duration: ${result.duration}ms`);
  } catch (error) {
    console.error('Stream error:', error);
  }
}

// Run examples
downloadWithCallback().then(() => {
  downloadWithFluentAPI().then(() => {
    downloadAudio().then(() => {
      streamToFile();
    });
  });
});
