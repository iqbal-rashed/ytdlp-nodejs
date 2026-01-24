import { createWriteStream } from 'fs';
import { YtDlp } from '../src/index';

const ytdlp = new YtDlp();

// Method 1: Fluent builder API with awaitable .pipe()
async function streamWithFluentAPI() {
  try {
    const result = await ytdlp
      .stream('https://www.youtube.com/watch?v=_AL4IwHuHlY')
      .format({ filter: 'mergevideo', quality: '720p', type: 'mp4' })
      .on('progress', (progress) => {
        console.log(
          `Streaming: ${progress.percentage_str} at ${progress.speed_str}`,
        );
      })
      .pipe(createWriteStream('video.mp4'));

    console.log('Stream complete!');
    console.log(`Total bytes: ${result.bytes}`);
    console.log(`Duration: ${result.duration}ms`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Method 2: Stream to buffer
async function streamToBuffer() {
  try {
    const buffer = await ytdlp
      .stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      .format({ filter: 'audioonly', type: 'mp3' })

      .on('progress', (p) => console.log(`${p.percentage_str}`))
      .toBuffer();

    console.log('Buffer size:', buffer.length, 'bytes');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Method 3: With initial format options
async function streamWithOptions() {
  try {
    const result = await ytdlp
      .stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
        format: { filter: 'audioandvideo', quality: 'highest', type: 'mp4' },
      })
      .on('progress', (p) => console.log(p.percentage_str))
      .pipeAsync(createWriteStream('video2.mp4'));

    console.log('Done! Bytes:', result.bytes);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run examples
streamWithFluentAPI().then(() => {
  streamToBuffer().then(() => {
    streamWithOptions();
  });
});
