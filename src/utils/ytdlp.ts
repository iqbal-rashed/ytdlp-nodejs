import * as fs from 'fs';
import * as path from 'path';
import { downloadFile } from '../utils/request';
import { BIN_DIR } from '..';

const DOWNLOAD_BASE_URL =
  'https://github.com/yt-dlp/yt-dlp/releases/latest/download';

const PLATFORM_MAPPINGS: Record<string, Record<string, string>> = {
  win32: {
    x64: 'yt-dlp.exe',
    ia32: 'yt-dlp_x86.exe',
  },
  linux: {
    x64: 'yt-dlp',
    armv7l: 'yt-dlp_linux_armv7l',
    aarch64: 'yt-dlp_linux_aarch64',
    arm64: 'yt-dlp',
  },
  darwin: {
    x64: 'yt-dlp_macos',
    arm64: 'yt-dlp_macos',
  },
  android: {
    arm64: 'yt-dlp',
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

export async function downloadYtDlp(out?: string): Promise<string> {
  const OUT_DIR = out || BIN_DIR;

  const fileName = getYtdlpFilename();
  const downloadUrl: string = `${DOWNLOAD_BASE_URL}/${fileName}`;

  const outputPath = path.join(OUT_DIR, fileName);

  const isExists = fs.existsSync(outputPath);
  if (isExists) return outputPath;

  console.log(`Downloading yt-dlp...`, downloadUrl);

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
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

export function findYtdlpBinary() {
  const platform = process.platform as string;
  const arch = process.arch as string;

  try {
    const binaryName: string = PLATFORM_MAPPINGS[platform][arch];

    const ytdlpPath = path.join(BIN_DIR, binaryName);

    if (!fs.existsSync(ytdlpPath)) {
      throw new Error('Ytdlp binary not found. Please download it first.');
    }
    return ytdlpPath;
  } catch {
    return undefined;
  }
}
