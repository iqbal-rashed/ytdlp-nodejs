import * as path from 'path';
import { YtDlp } from '../src/index';

const ytdlp = new YtDlp();
const downloadsDir = path.join(__dirname, '..', 'downloads');

async function execVideo() {
  const s = ytdlp
    .download('https://www.youtube.com/watch?v=_AL4IwHuHlY')
    .output(downloadsDir);

  s.on('progress', (d) => {
    console.log(d);
  });

  await s.run();
}

execVideo();
