import * as fs from 'fs';
import * as path from 'path';
import { downloadFile, fetchText } from '../utils/request';
import { BIN_DIR } from './paths';
import crypto from 'crypto';

const DOWNLOAD_BASE_URL =
  'https://github.com/yt-dlp/yt-dlp/releases/latest/download';

const PLATFORM_MAPPINGS: Record<string, Record<string, string>> = {
  win32: {
    x64: 'yt-dlp.exe',
    ia32: 'yt-dlp_x86.exe',
    arm64: 'yt-dlp_arm64.exe',
  },
  linux: {
    x64: 'yt-dlp_linux',
    armv7l: 'yt-dlp_linux_armv7l',
    aarch64: 'yt-dlp_linux_aarch64',
    arm64: 'yt-dlp_linux_aarch64',
  },
  darwin: {
    x64: 'yt-dlp_macos',
    arm64: 'yt-dlp_macos',
  },
  android: {
    arm64: 'yt-dlp',
  },
};

function isMuslRuntime(): boolean {
  if (process.platform !== 'linux') return false;

  // Node exposes the glibc runtime version when it is available. Its absence
  // on Linux is the most reliable cross-version signal for musl environments.
  const report = process.report?.getReport() as
    | { header?: { glibcVersionRuntime?: string } }
    | undefined;
  return !report?.header?.glibcVersionRuntime;
}

export function getYtdlpFilename(
  platform: string = process.platform,
  arch: string = process.arch,
  musl: boolean = isMuslRuntime(),
): string {
  if (platform === 'linux' && musl) {
    if (arch === 'x64') return 'yt-dlp_musllinux';
    if (arch === 'arm64' || arch === 'aarch64') {
      return 'yt-dlp_musllinux_aarch64';
    }
  }

  if (!PLATFORM_MAPPINGS[platform] || !PLATFORM_MAPPINGS[platform][arch]) {
    throw new Error(`No yt-dlp build available for ${platform} ${arch}`);
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
    // Set executable permissions (Unix-like systems only)
    if (process.platform !== 'win32') {
      fs.chmodSync(outputPath, 0o755);
    }

    return outputPath;
  } catch (error) {
    console.error(`Download failed: ${error}`);
    throw error;
  }
}

async function downloadLatestYtDlp(
  out: string,
  fileName: string,
  checksum: string,
): Promise<string> {
  if (!fs.existsSync(out)) {
    fs.mkdirSync(out, { recursive: true });
  }

  const outputPath = path.join(out, fileName);
  const temporaryPath = path.join(
    out,
    `.${fileName}.${process.pid}.${Date.now()}.download`,
  );

  try {
    await downloadFile(`${DOWNLOAD_BASE_URL}/${fileName}`, temporaryPath);
    if (process.platform !== 'win32') {
      fs.chmodSync(temporaryPath, 0o755);
    }
    const downloadedHash = await sha256File(temporaryPath);
    if (downloadedHash.toLowerCase() !== checksum.toLowerCase()) {
      throw new Error(
        `Checksum mismatch for ${fileName}. Expected ${checksum}, got ${downloadedHash}`,
      );
    }

    // Keep a rollback copy so a failed replacement never destroys a usable
    // cached binary (Windows cannot always rename over an existing file).
    const backupPath = `${outputPath}.previous`;
    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
    if (fs.existsSync(outputPath)) fs.renameSync(outputPath, backupPath);
    try {
      fs.renameSync(temporaryPath, outputPath);
      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
    } catch (error) {
      if (fs.existsSync(backupPath)) fs.renameSync(backupPath, outputPath);
      throw error;
    }

    return outputPath;
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

async function sha256File(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function getChecksum(fileName: string): Promise<string | undefined> {
  try {
    const checksums = await fetchText(`${DOWNLOAD_BASE_URL}/SHA2-256SUMS`);
    const lines = checksums.split(/\r?\n/);
    for (const line of lines) {
      const [hash, name] = line.trim().split(/\s+/);
      if (name?.replace(/^\*/, '') === fileName) return hash || undefined;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function downloadYtDlpVerified(
  out?: string,
): Promise<{ path: string; verified: boolean; checksum?: string }> {
  const outDir = out || BIN_DIR;
  const fileName = getYtdlpFilename();
  let outputPath = await downloadYtDlp(outDir);
  const checksum = await getChecksum(fileName);
  if (!checksum) {
    return { path: outputPath, verified: false };
  }

  const hash = await sha256File(outputPath);
  if (hash.toLowerCase() !== checksum.toLowerCase()) {
    // A cached binary can legitimately be from an earlier yt-dlp release.
    // Fetch the matching latest binary before treating this as corruption.
    outputPath = await downloadLatestYtDlp(outDir, fileName, checksum);
  }

  return { path: outputPath, verified: true, checksum };
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
