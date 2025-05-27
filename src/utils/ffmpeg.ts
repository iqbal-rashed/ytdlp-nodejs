import path from 'path';
import fs from 'fs';
import { downloadFile } from './request';
import { download7zip } from './7zip';
import { execSync } from 'child_process';
import { BIN_DIR } from '..';

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

function getFFmpegFileName(): string {
  const platform = process.platform as string;
  const arch = process.arch as string;

  if (!PLATFORM_MAPPINGS[platform] || !PLATFORM_MAPPINGS[platform][arch]) {
    throw new Error(`No FFmpeg build available for ${platform} ${arch}`);
  }

  const filename = PLATFORM_MAPPINGS[platform][arch];

  return filename;
}

export async function downloadFFmpeg(download_path?: string) {
  const dir = download_path || BIN_DIR;
  const ffmpegBinary = findFFmpegBinary(dir);

  if (ffmpegBinary) {
    return ffmpegBinary;
  }

  const fileName = getFFmpegFileName();

  const downloadUrl: string = `${DOWNLOAD_BASE_URL}/${fileName}`;

  const outputPath = path.join(dir, fileName);
  const outputPath = path.join(dir, fileName);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
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

    await extractFile(outputPath, dir);
    await extractFile(outputPath, dir);

    fs.unlinkSync(outputPath);

    return findFFmpegBinary(dir);
    return findFFmpegBinary(dir);
  } catch (error) {
    console.error(`Download failed: ${error}`);
    throw error;
  }
}

export function findFFmpegBinary(custom_path?: string) {
  try {
    const dir = custom_path || BIN_DIR;

    const dir = custom_path || BIN_DIR;

    const platform = process.platform;
    const fileName = getFFmpegFileName();

    const ffmpegFileName = platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

    const folderName = getFolderName(fileName);

    const ffmpegPath = path.join(dir, folderName, 'bin', ffmpegFileName);
    const ffmpegPath = path.join(dir, folderName, 'bin', ffmpegFileName);
    if (fs.existsSync(ffmpegPath)) {
      return ffmpegPath;
    } else {
      throw new Error('FFmpeg binary not found. Please download it first.');
    }
  } catch {
    return undefined;
  }
}

export async function extractFile(filePath: string, targetPath: string) {
  try {
    const path7zip = await download7zip();
    const isTar = filePath.includes('tar.xz');

    if (isTar) {
      execSync(`"${path7zip}" x "${filePath}" -aoa -o"${targetPath}"`);

      execSync(
        `"${path7zip}" x "${path.join(
          targetPath,
          path.basename(filePath, path.extname(filePath))
        )}" -aoa -o"${targetPath}"`
      );
    } else {
      execSync(`"${path7zip}" x "${filePath}" -aoa -o"${targetPath}"`);
    }
  } catch (error) {
    console.error('Error extracting file:', error);
    throw error;
  }
}

function getFolderName(fn: string) {
  let fx = path.basename(fn, path.extname(fn));
  if (path.extname(fx)) {
    fx = getFolderName(fx);
  }
  return fx;
}
