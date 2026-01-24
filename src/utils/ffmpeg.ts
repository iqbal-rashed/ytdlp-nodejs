import path from 'path';
import fs from 'fs';
import { downloadFile } from './request';
import { BIN_DIR } from './paths';

const DOWNLOAD_BASE_URL =
  'https://github.com/iqbal-rashed/ytdlp-nodejs/releases/download/ffmpeg-latest';

const PLATFORM_MAPPINGS: Record<string, Record<string, string[]>> = {
  win32: {
    x64: ['win-x64-ffmpeg.exe', 'win-x64-ffprobe.exe'],
    ia32: ['win-ia32-ffmpeg.exe', 'win-ia32-ffprobe.exe'],
    arm64: ['win-arm64-ffmpeg.exe', 'win-arm64-ffprobe.exe'],
  },
  linux: {
    x64: ['linux-x64-ffmpeg', 'linux-x64-ffprobe'],
    arm64: ['linux-arm64-ffmpeg', 'linux-arm64-ffprobe'],
  },
  darwin: {
    x64: ['macos-x64-ffmpeg', 'macos-x64-ffprobe'],
    arm64: ['macos-arm64-ffmpeg', 'macos-arm64-ffprobe'],
  },
  android: {
    arm64: ['linux-arm64-ffmpeg', 'linux-arm64-ffprobe'],
  },
};

function getBuildsArray(): string[] {
  const platform = process.platform as string;
  const arch = process.arch as string;

  if (!PLATFORM_MAPPINGS[platform] || !PLATFORM_MAPPINGS[platform][arch]) {
    throw new Error(
      `No FFmpeg build available for platform: ${platform}, architecture: ${arch}`,
    );
  }

  return PLATFORM_MAPPINGS[platform][arch];
}

export async function downloadFFmpeg(out?: string) {
  const OUT_DIR = out || BIN_DIR;

  const ffmpegBinary = findFFmpegBinary();

  if (ffmpegBinary) {
    return ffmpegBinary;
  }

  try {
    const buildsArr = getBuildsArray();

    if (!buildsArr.length) throw new Error();

    const downloadUrls = buildsArr.map((v) => `${DOWNLOAD_BASE_URL}/${v}`);

    const outputPaths = buildsArr.map((v) =>
      path.join(OUT_DIR, String(v.split('-').pop())),
    );

    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    console.log('Downloading FFmpeg and FFprobe...');

    for (let i = 0; i < buildsArr.length; i++) {
      const downloadUrl = downloadUrls[i];
      const outputPath = outputPaths[i];
      console.log('Downloading...', path.basename(downloadUrl));
      await downloadFile(downloadUrl, outputPath);
    }

    // Set executable permissions (Unix-like systems)
    try {
      for (const outputPath of outputPaths) {
        fs.chmodSync(outputPath, 0o755);
      }
    } catch {
      console.log(
        'Note: Could not set executable permissions (likely Windows)',
      );
    }

    return findFFmpegBinary();
  } catch (error) {
    console.error(`Download failed: ${error}`);
    throw error;
  }
}

export function findFFmpegBinary() {
  try {
    const buildsArr = getBuildsArray();

    if (!buildsArr.length) throw new Error();

    const ffmpegPath = path.join(
      BIN_DIR,
      String(buildsArr[0].split('-').pop()),
    );

    if (!fs.existsSync(ffmpegPath)) {
      throw new Error('FFmpeg binary not found. Please download it first.');
    }

    return ffmpegPath;
  } catch {
    return undefined;
  }
}
