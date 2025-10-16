import { YtDlp } from '../src/index';

const ytdlp = new YtDlp();

async function execVideo() {
    const s = ytdlp.download('https://www.youtube.com/watch?v=_AL4IwHuHlY');

    s.on('progress', (d) => {
        console.log(d);
    });
}


execVideo()