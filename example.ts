import { createWriteStream } from 'fs';
import { YtDlp } from './src/index';

const ytdlp = new YtDlp();

async function downloadVideo() {
  try {
    const output = await ytdlp.download(
      'https://www.youtube.com/watch?v=_AL4IwHuHlY',
      {
        onProgress: (progress) => {
          console.log(progress);
        },
      }
    );
    console.log(output);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function streamVideo() {
  try {
    const st = createWriteStream('video.mp4');

    const ytdlpStream = ytdlp.stream(
      'https://www.youtube.com/watch?v=_AL4IwHuHlY',
      {
        onProgress: (progress) => {
          console.log(progress);
        },
      }
    );

    await ytdlpStream.promisePipe(st);

    console.log('Downloaded');
  } catch (error) {
    console.error('Error:', error);
  }
}

downloadVideo();
streamVideo();
