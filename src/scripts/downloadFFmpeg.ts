import { downloadFFmpeg } from '../utils/ffmpeg';

downloadFFmpeg().catch((err) => {
  console.error('Failed to download ffmpeg:', err);
  process.exit(1);
});
