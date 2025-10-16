import { YtDlp } from '../src/index';

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

getVideoFile()