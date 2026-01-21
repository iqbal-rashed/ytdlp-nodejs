import fs from 'fs';
import os from 'os';
import path from 'path';

export type CliSubtitlesConfig = {
  languages?: string[];
  format?: string;
  embed?: boolean;
  auto?: boolean;
};

export type CliSponsorblockConfig = {
  categories?: string[];
  mode?: 'mark' | 'remove';
};

export type CliConfig = {
  downloadDir?: string;
  defaultFormat?: string;
  subtitles?: CliSubtitlesConfig;
  sponsorblock?: CliSponsorblockConfig;
  proxy?: string;
  cookiesPath?: string;
  concurrency?: number;
  verbose?: boolean;
};

const DEFAULT_CONFIG: CliConfig = {
  subtitles: {},
  sponsorblock: {},
};

function resolveConfigDir() {
  if (process.env.YTDLP_NODEJS_CONFIG_DIR) {
    return process.env.YTDLP_NODEJS_CONFIG_DIR;
  }
  if (process.platform === 'win32') {
    return process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support');
  }
  const xdg = process.env.XDG_CONFIG_HOME;
  return xdg || path.join(os.homedir(), '.config');
}

export async function getConfigPath() {
  const configDir = resolveConfigDir();
  if (process.env.YTDLP_NODEJS_CONFIG_DIR) {
    return path.join(configDir, 'config.json');
  }
  return path.join(configDir, 'ytdlp-nodejs', 'config.json');
}

function deepMerge(
  base: Record<string, unknown>,
  next: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(next)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof result[key] === 'object' &&
      result[key] !== null
    ) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export async function loadConfig(): Promise<CliConfig> {
  const filePath = await getConfigPath();
  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as CliConfig;
    return deepMerge(
      DEFAULT_CONFIG as Record<string, unknown>,
      parsed as Record<string, unknown>
    ) as CliConfig;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: CliConfig) {
  const filePath = await getConfigPath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
}

export async function updateConfig(partial: CliConfig): Promise<CliConfig> {
  const current = await loadConfig();
  const next = deepMerge(
    current as Record<string, unknown>,
    partial as Record<string, unknown>
  ) as CliConfig;
  await saveConfig(next);
  return next;
}
