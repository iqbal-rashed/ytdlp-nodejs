import path from 'path';
import fs from 'fs';

import { downloadFile } from './request';
import AdmZip from 'adm-zip';
import tar from 'tar';

const DOWNLOAD_BASE_URL =
  'https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest';

const PLATFORM_MAPPINGS: Record<string, Record<string, string>> = {
  win32: {
    x64: 'ffmpeg-master-latest-win64-gpl.zip',
    ia32: 'ffmpeg-master-latest-win32-gpl.zip',
    arm64: 'ffmpeg-master-latest-winarm64-gpl.zip',
  },
  linux: {
    x64: 'ffmpeg-master-latest-linux64-gpl.tar.xz',
    arm64: 'ffmpeg-master-latest-linuxarm64-gpl.tar.xz',
  },
  darwin: {
    x64: 'ffmpeg-master-latest-macos64-gpl.zip',
    arm64: 'ffmpeg-master-latest-macosarm64-gpl.zip',
  },
};

const BIN_DIR = path.join(__dirname, '..', '..', 'bin');

function getFFmpegFileName(): string {
  const platform = process.platform as string;
  const arch = process.arch as string;

  if (!PLATFORM_MAPPINGS[platform] || !PLATFORM_MAPPINGS[platform][arch]) {
    throw new Error(`No FFmpeg build available for ${platform} ${arch}`);
  }

  const filename = PLATFORM_MAPPINGS[platform][arch];

  return filename;
}

export async function downloadFFmpeg() {
  const ffmpegBinary = findFFmpegBinary();

  if (ffmpegBinary) {
    return ffmpegBinary;
  }

  const fileName = getFFmpegFileName();

  const downloadUrl: string = `${DOWNLOAD_BASE_URL}/${fileName}`;

  const outputPath = path.join(BIN_DIR, fileName);

  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }

  console.log(`Downloading ffmpeg...`);

  try {
    await downloadFile(downloadUrl, outputPath);
    console.log(`ffmpeg downloaded successfully to: ${outputPath}`);
    try {
      fs.chmodSync(outputPath, 0o755);
    } catch {
      console.log('Error while chmod');
    }

    if (fileName.endsWith('.zip')) {
      await unzipFile(outputPath, BIN_DIR);
    }
    if (fileName.endsWith('.tar.xz')) {
      await untarFile(outputPath, BIN_DIR);
    }

    fs.unlinkSync(outputPath);

    return findFFmpegBinary();
  } catch (error) {
    console.error(`Download failed: ${error}`);
    throw error;
  }
}

export function findFFmpegBinary() {
  try {
    const platform = process.platform;
    const fileName = getFFmpegFileName();

    const ffmpegFileName = platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

    const folderName = path.basename(fileName, path.extname(fileName));

    const ffmpegPath = path.join(BIN_DIR, folderName, 'bin', ffmpegFileName);
    if (fs.existsSync(ffmpegPath)) {
      return ffmpegPath;
    } else {
      throw new Error('FFmpeg binary not found. Please download it first.');
    }
  } catch {
    return undefined;
  }
}

function unzipFile(zipPath: string, targetPath: string) {
  const zip = new AdmZip(zipPath);
  return zip.extractAllToAsync(targetPath, true);
}

function untarFile(tarPath: string, targetPath: string) {
  return tar.x({
    file: tarPath,
    C: targetPath,
  });
}
