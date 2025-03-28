import * as fs from 'fs';
import * as path from 'path';
import { downloadFile } from '../utils/request';

const DOWNLOAD_BASE_URL =
  'https://github.com/yt-dlp/yt-dlp/releases/download/latest';

const PLATFORM_MAPPINGS: Record<string, Record<string, string>> = {
  win32: {
    x64: 'yt-dlp.exe',
    ia32: 'yt-dlp_x86.exe',
  },
  linux: {
    x64: 'yt-dlp',
    armv7l: 'yt-dlp_linux_armv7l',
    aarch64: 'yt-dlp_linux_aarch64',
  },
  darwin: {
    x64: 'dlp_macos',
    arm64: 'dlp_macos',
  },
};

function getYtdlpFilename(): string {
  const platform = process.platform as string;
  const arch = process.arch as string;

  if (!PLATFORM_MAPPINGS[platform] || !PLATFORM_MAPPINGS[platform][arch]) {
    throw new Error(`No FFmpeg build available for ${platform} ${arch}`);
  }

  const filename = PLATFORM_MAPPINGS[platform][arch];

  return filename;
}

async function downloadYtDlp(): Promise<string> {
  const fileName = getYtdlpFilename();
  const downloadUrl: string = `${DOWNLOAD_BASE_URL}/${fileName}`;

  const binDir = path.join(__dirname, '..', '..', 'bin');
  const outputPath = path.join(binDir, fileName);

  console.log(`Downloading yt-dlp...`);

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  try {
    await downloadFile(downloadUrl, outputPath);
    console.log(`yt-dlp downloaded successfully to: ${outputPath}`);
    try {
      fs.chmodSync(outputPath, 0o755);
    } catch {
      console.log('Error while chmod');
    }

    return outputPath;
  } catch (error) {
    console.error(`Download failed: ${error}`);
    throw error;
  }
}

downloadYtDlp().catch((err) => {
  console.error('Failed to download yt-dlp:', err);
  process.exit(1);
});
