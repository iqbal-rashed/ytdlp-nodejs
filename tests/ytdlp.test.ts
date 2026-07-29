import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mockDownloadFile = jest.fn<Promise<void>, [string, string]>();
const mockFetchText = jest.fn<Promise<string>, [string]>();

jest.mock('../src/utils/request', () => ({
  downloadFile: mockDownloadFile,
  fetchText: mockFetchText,
}));

import { downloadYtDlpVerified, getYtdlpFilename } from '../src/utils/ytdlp';

describe('yt-dlp binary selection', () => {
  test.each([
    ['win32', 'arm64', false, 'yt-dlp_arm64.exe'],
    ['linux', 'arm64', false, 'yt-dlp_linux_aarch64'],
    ['linux', 'aarch64', false, 'yt-dlp_linux_aarch64'],
    ['linux', 'x64', true, 'yt-dlp_musllinux'],
    ['linux', 'arm64', true, 'yt-dlp_musllinux_aarch64'],
  ])('maps %s/%s (musl=%s)', (platform, arch, musl, expected) => {
    expect(getYtdlpFilename(platform, arch, musl)).toBe(expected);
  });

  test('rejects unsupported platforms and architectures', () => {
    expect(() => getYtdlpFilename('freebsd', 'x64', false)).toThrow(
      'No yt-dlp build available for freebsd x64',
    );
  });

  test('replaces a stale cached binary with a verified latest binary', async () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'ytdlp-'));
    const fileName = getYtdlpFilename();
    const cachedPath = path.join(temporaryDirectory, fileName);
    const latestContent = 'latest verified binary';
    const latestHash = crypto
      .createHash('sha256')
      .update(latestContent)
      .digest('hex');
    fs.writeFileSync(cachedPath, 'stale binary');
    mockFetchText.mockResolvedValue(`${latestHash}  ${fileName}\n`);
    mockDownloadFile.mockImplementation(async (_url, outputPath) => {
      fs.writeFileSync(outputPath, latestContent);
    });

    try {
      await expect(downloadYtDlpVerified(temporaryDirectory)).resolves.toMatchObject({
        path: cachedPath,
        verified: true,
        checksum: latestHash,
      });
      expect(fs.readFileSync(cachedPath, 'utf8')).toBe(latestContent);
    } finally {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });
});
