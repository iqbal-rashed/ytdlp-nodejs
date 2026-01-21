import { YtDlp, helpers } from '../src/index';

const ytdlp = new YtDlp();

async function getVideoFile() {
  try {
    await helpers.downloadYtDlp();
    await helpers.downloadFFmpeg();
    const videoFile = await ytdlp.getFileAsync(
      'https://www.youtube.com/watch?v=_AL4IwHuHlY',
      {
        onProgress: (progress) => {
          console.log(progress);
        },
        jsRuntime: 'node',
      },
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

getVideoFile();
