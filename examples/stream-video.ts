
import { createWriteStream } from 'fs';
import { YtDlp } from '../src/index';

const ytdlp = new YtDlp();

async function streamVideo() {
    try {
        const st = createWriteStream('video.mp4');

        const ytdlpStream = ytdlp.stream(
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
            }
        );


        await ytdlpStream.pipeAsync(st);

        console.log('Downloaded');
    } catch (error) {
        console.error('Error:', error);
    }
}

streamVideo()