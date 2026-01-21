import fs from 'fs';
import os from 'os';
import path from 'path';

describe('cli config', () => {
  test('saves and loads config', async () => {
    jest.resetModules();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ytdlp-config-'));
    process.env.YTDLP_NODEJS_CONFIG_DIR = tempDir;

    const configModule = (await import('../src/configs/config')) as
      | typeof import('../src/configs/config')
      | { default: typeof import('../src/configs/config') };
    const resolved =
      'default' in configModule ? configModule.default : configModule;
    const { loadConfig, updateConfig, getConfigPath } = resolved;

    const initial = await loadConfig();
    expect(initial).toBeDefined();

    const updated = await updateConfig({
      downloadDir: 'C:\\Downloads',
      subtitles: { format: 'srt' },
    });
    expect(updated.downloadDir).toBe('C:\\Downloads');

    const reloaded = await loadConfig();
    expect(reloaded.subtitles?.format).toBe('srt');

    const filePath = await getConfigPath();
    expect(fs.existsSync(filePath)).toBe(true);

    delete process.env.YTDLP_NODEJS_CONFIG_DIR;
  });
});
