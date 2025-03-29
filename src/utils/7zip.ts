import path from 'path';
import { BIN_DIR } from './utils';
import fs from 'fs';
import { downloadFile } from './request';

const DOWNLOAD_BASE_URL =
  'https://github.com/develar/7zip-bin/raw/refs/heads/update-7zip';

const PLATFORM_MAPPINGS: Record<string, Record<string, string[]>> = {
  win32: {
    x64: ['win/x64', '7za.exe'],
    ia32: ['win/ia32', '7za.exe'],
    arm64: ['win/arm64', '7za.exe'],
  },
  linux: {
    x64: ['linux/x64', '7zz'],
    arm64: ['linux/arm64', '7zz'],
    arm: ['linux/arm', '7zz'],
    ia32: ['linux/ia32', '7zz'],
  },
  darwin: {
    x64: ['mac/x64', '7zz'],
    arm64: ['mac/arm64', '7zz'],
  },
};

function get7zipNamePath(): string[] {
  const platform = process.platform as string;
  const arch = process.arch as string;

  if (!PLATFORM_MAPPINGS[platform] || !PLATFORM_MAPPINGS[platform][arch]) {
    throw new Error(`No 7zip build available for ${platform} ${arch}`);
  }

  const namepath = PLATFORM_MAPPINGS[platform][arch];

  return namepath;
}

export async function download7zip() {
  const find7zip = find7zipPath();
  if (find7zip) {
    return find7zip;
  }

  const namepath = get7zipNamePath();
  const downloadUrl: string = `${DOWNLOAD_BASE_URL}/${namepath[0]}/${namepath[1]}`;
  const outputPath = path.join(BIN_DIR, namepath[1]);

  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }

  console.log(`Downloading 7zip...`);

  try {
    await downloadFile(downloadUrl, outputPath);
    console.log(`7zip downloaded successfully to: ${outputPath}`);
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

export function find7zipPath() {
  const namepath = get7zipNamePath();
  const outputPath = path.join(BIN_DIR, namepath[1]);

  return fs.existsSync(outputPath) ? outputPath : undefined;
}
