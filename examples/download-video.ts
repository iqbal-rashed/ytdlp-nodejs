import { YtDlp } from '../src/index';

const ytdlp = new YtDlp();

async function downloadVideoAsync() {
  try {
    const output = await ytdlp.downloadAsync(
      'https://www.youtube.com/watch?v=_AL4IwHuHlY',
      {
        format: {
          filter: 'mergevideo',
          type: 'mp4',
          quality: '720p',
        },
        onProgress: (progress) => {
          console.log(progress);
        },
      },
    );

    console.log('Download completed!');
    console.log('Video info after post-processing:', output);
  } catch (error) {
    console.error('Error:', error);
  }
}
function downloadVideoSync() {
  try {
    const d = ytdlp.download('https://www.youtube.com/watch?v=_AL4IwHuHlY', {
      format: {
        filter: 'mergevideo',
        type: 'mp4',
        quality: '1080p',
      },
    });

    d.on('progress', (d) => {
      console.log('Testing', d);
    });

    d.on('finish', (d) => {
      console.log('Download Finished', d);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

downloadVideoAsync().then(() => {
  downloadVideoSync();
});
