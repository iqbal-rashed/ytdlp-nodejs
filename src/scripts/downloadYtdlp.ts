import { downloadYtDlp } from '../utils/ytdlp';

downloadYtDlp().catch((err) => {
  console.error('Failed to download yt-dlp:', err);
  process.exit(1);
});
