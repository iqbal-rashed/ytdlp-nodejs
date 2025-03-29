import { createWriteStream } from 'fs';
import { YtDlp } from './src/index';

const ytdlp = new YtDlp();

async function getVideoFile() {
  try {
    const videoFile = await ytdlp.getFileAsync(
      'https://www.youtube.com/watch?v=_AL4IwHuHlY',
      {
        onProgress: (progress) => {
          console.log(progress);
        },
      }
    );

    console.log('Video File:', {
      name: videoFile.name,
      type: videoFile.type,
      size: videoFile.size,
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
async function downloadVideo() {
  try {
    const output = await ytdlp.downloadAsync(
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

    await ytdlpStream.pipeAsync(st);

    console.log('Downloaded');
  } catch (error) {
    console.error('Error:', error);
  }
}

async function execVideo() {
  const s = ytdlp.download('https://www.youtube.com/watch?v=_AL4IwHuHlY');

  s.on('progress', (d) => {
    console.log(d);
  });
}

async function isInstallation() {
  try {
    const isInstalled = await ytdlp.checkInstallationAsync({ ffmpeg: true });
    console.log(isInstalled);
  } catch (error) {
    console.log('test', error.message);
  }
}

ytdlp.downloadFFmpeg().then(async () => {
  try {
    await isInstallation();
    await downloadVideo();
    await streamVideo();
    await execVideo();
    await getVideoFile();
  } catch (error) {
    console.log(error);
  }
});
