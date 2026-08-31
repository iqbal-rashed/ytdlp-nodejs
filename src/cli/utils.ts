/**
 * CLI Utilities
 * Provides argument parsing, formatting, and helper functions.
 */

import fs from 'fs';
import path from 'path';
import { ArgsOptions, FormatTableRow } from '../types';
import { Colors, Style, color } from './style';

export type CliOptionValue = string | boolean | string[];

/**
 * Gets the package version from package.json.
 */
export function getPackageVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, '..', 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    return JSON.parse(raw).version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Converts kebab-case to camelCase.
 */
export function toCamelCase(input: string): string {
  return input.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Parses CLI arguments into structured format.
 */
export function parseCliArgs(argv: string[]): {
  command: string | undefined;
  positionals: string[];
  options: Record<string, CliOptionValue>;
} {
  let command: string | undefined;
  const positionals: string[] = [];
  const options: Record<string, CliOptionValue> = {};
  const rawArgs: string[] = [];

  const tokens = [...argv];
  if (tokens[0] && !tokens[0].startsWith('-')) {
    command = tokens.shift();
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '--') {
      rawArgs.push(...tokens.slice(i + 1));
      break;
    }
    if (token.startsWith('--')) {
      const eqIndex = token.indexOf('=');
      const key = eqIndex === -1 ? token.slice(2) : token.slice(2, eqIndex);
      let value: CliOptionValue = true;
      if (eqIndex !== -1) {
        value = token.slice(eqIndex + 1);
      } else if (tokens[i + 1] && !tokens[i + 1].startsWith('-')) {
        value = tokens[i + 1];
        i += 1;
      }

      if (key === 'raw') {
        if (value === true) {
          if (tokens[i + 1]) {
            rawArgs.push(tokens[i + 1]);
            i += 1;
          }
        } else {
          rawArgs.push(String(value));
        }
        continue;
      }

      if (options[key] === undefined) {
        options[key] = value;
      } else if (Array.isArray(options[key])) {
        options[key] = [...options[key], String(value)];
      } else {
        options[key] = [String(options[key]), String(value)];
      }
    } else {
      positionals.push(token);
    }
  }

  const normalized: Record<string, CliOptionValue> = {};
  for (const [key, value] of Object.entries(options)) {
    normalized[toCamelCase(key)] = value;
  }

  // --name alias for --output (yoinks PR #15)
  if (normalized.name && !normalized.output) {
    normalized.output = normalized.name;
  }

  if (normalized.raw) {
    const raw = normalized.raw;
    if (Array.isArray(raw)) {
      rawArgs.push(...raw.map(String));
    } else if (typeof raw === 'string') {
      rawArgs.push(raw);
    }
  }

  if (rawArgs.length > 0) {
    normalized.raw = rawArgs;
  }

  return { command, positionals, options: normalized };
}

/**
 * Formats format table rows for display.
 */
export function formatTableRows(rows: FormatTableRow[]): string {
  if (rows.length === 0) return Style.warning('No formats found.');
  const headers = ['ID', 'Ext', 'Resolution', 'Note'];
  const columns = [
    Math.max(headers[0].length, ...rows.map((r) => r.formatId.length)),
    Math.max(headers[1].length, ...rows.map((r) => r.extension.length)),
    Math.max(headers[2].length, ...rows.map((r) => r.resolution.length)),
  ];

  const headerLine = [
    color(headers[0].padEnd(columns[0]), Colors.fg.cyan),
    color(headers[1].padEnd(columns[1]), Colors.fg.cyan),
    color(headers[2].padEnd(columns[2]), Colors.fg.cyan),
    color(headers[3], Colors.fg.cyan),
  ].join('  ');

  const lines = [
    headerLine,
    color(
      `${'-'.repeat(columns[0])}  ${'-'.repeat(columns[1])}  ${'-'.repeat(columns[2])}  ${'-'.repeat(headers[3].length)}`,
      Colors.dim,
    ),
  ];

  for (const row of rows) {
    lines.push(
      `${color(row.formatId.padEnd(columns[0]), Colors.fg.yellow)}  ${row.extension.padEnd(columns[1])}  ${row.resolution.padEnd(columns[2])}  ${row.note}`,
    );
  }

  return lines.join('\n');
}

/**
 * Builds ArgsOptions from CLI options.
 */
export function buildArgsOptions(
  cliOptions: Record<string, CliOptionValue>,
): ArgsOptions {
  const options: ArgsOptions = {};

  // --name alias → output (yoinks PR #15), --name wins if both
  const out = cliOptions.name ?? cliOptions.output;
  if (out) options.output = String(out);

  if (cliOptions.mergeOutputFormat)
    options.mergeOutputFormat = String(cliOptions.mergeOutputFormat);

  // Auth / cookies
  if (cliOptions.cookies) options.cookies = String(cliOptions.cookies);
  if (cliOptions.cookiesFromBrowser)
    options.cookiesFromBrowser = String(cliOptions.cookiesFromBrowser);

  // Subtitles
  if (cliOptions.writeSubs) options.writeSubs = true;
  if (cliOptions.writeAutoSubs) options.writeAutoSubs = true;
  if (cliOptions.subLangs) {
    const raw = String(cliOptions.subLangs);
    options.subLangs = raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  // Post-processing / embeds
  if (cliOptions.embedSubs) options.embedSubs = true;
  if (cliOptions.embedThumbnail) options.embedThumbnail = true;
  if (cliOptions.embedMetadata) options.embedMetadata = true;
  if (cliOptions.embedChapters) options.embedChapters = true;

  // Network
  if (cliOptions.proxy) options.proxy = String(cliOptions.proxy);
  if (cliOptions.socketTimeout)
    options.socketTimeout = Number(cliOptions.socketTimeout);

  // Playlist
  if (cliOptions.playlistItems)
    options.playlistItems = String(cliOptions.playlistItems);
  if (cliOptions.noPlaylist) options.noPlaylist = true;
  if (cliOptions.yesPlaylist) options.yesPlaylist = true;

  // Download tuning
  if (cliOptions.limitRate) options.limitRate = String(cliOptions.limitRate);
  if (cliOptions.concurrentFragments)
    options.concurrentFragments = Number(cliOptions.concurrentFragments);
  if (cliOptions.retries) options.retries = Number(cliOptions.retries);
  if (cliOptions.retrySleep) options.retrySleep = Number(cliOptions.retrySleep);

  // Download sections / format sort
  if (cliOptions.downloadSections)
    options.downloadSections = String(cliOptions.downloadSections);
  if (cliOptions.formatSort)
    options.formatSort = String(cliOptions.formatSort)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

  // Passthrough
  if (cliOptions.raw) options.rawArgs = cliOptions.raw as string[];
  if (cliOptions.verbose) options.verbose = true;

  // Exec options handled separately or injected here if needed

  return options;
}

/**
 * Creates a progress handler for console output.
 */
export function progressHandler(
  prefix: string,
): (progress: { percentage_str?: string }) => void {
  return (progress) => {
    const pct = progress.percentage_str ?? 'N/A';
    process.stdout.write(
      `\x1b[2K\r${Style.info(prefix)} ${Style.success(pct)}`,
    );
  };
}

/**
 * Prints CLI usage help.
 */
export function printUsage(): void {
  console.log(`
${Style.title(`ytdlp ${getPackageVersion()}`)}

${Style.warning('Usage:')}
  ${color('ytdlp', Colors.fg.green)}                     Launch interactive mode
  ${color('ytdlp download <url>', Colors.fg.green)}      Download a video
  ${color('ytdlp audio <url>', Colors.fg.green)}         Download audio only
  ${color('ytdlp info <url>', Colors.fg.green)}          Get info as JSON
  ${color('ytdlp ffmpeg', Colors.fg.green)}              Download FFmpeg binaries
  ${color('ytdlp version', Colors.fg.green)}             Show version

${Style.warning('Download Options:')}
  ${color('--output', Colors.fg.cyan)} <tpl>         ${color('--name', Colors.fg.cyan)} alias  Output template (e.g. "%(title)s.%(ext)s")
  ${color('--merge-output-format', Colors.fg.cyan)} <fmt>  Container for merged streams (mp4/mkv/webm)
  ${color('--limit-rate', Colors.fg.cyan)} <rate>        Throttle download rate (e.g. 500K, 1M)
  ${color('--retries', Colors.fg.cyan)} <n>            Number of retries (default: 10)
  ${color('--concurrent-fragments', Colors.fg.cyan)} <n> Concurrent fragment downloads
  ${color('--proxy', Colors.fg.cyan)} <url>              Use HTTP/HTTPS/SOCKS proxy

${Style.warning('Playlist Options:')}
  ${color('--playlist-items', Colors.fg.cyan)} <spec>    Items to download (e.g. 1,3,5-7)
  ${color('--no-playlist', Colors.fg.cyan)}              Download only the video if URL is playlist

${Style.warning('Authentication:')}
  ${color('--cookies', Colors.fg.cyan)} <file>           Cookies file
  ${color('--cookies-from-browser', Colors.fg.cyan)} <browser>  Extract cookies from browser

${Style.warning('Subtitles:')}
  ${color('--write-subs', Colors.fg.cyan)}               Write subtitle files
  ${color('--write-auto-subs', Colors.fg.cyan)}          Write auto-generated subs
  ${color('--sub-langs', Colors.fg.cyan)} <langs>        Subtitle languages (e.g. en,ja)

${Style.warning('Post-processing:')}
  ${color('--embed-subs', Colors.fg.cyan)}               Embed subtitles in video file
  ${color('--embed-thumbnail', Colors.fg.cyan)}          Embed thumbnail
  ${color('--embed-metadata', Colors.fg.cyan)}           Embed metadata
  ${color('--embed-chapters', Colors.fg.cyan)}           Embed chapters

${Style.warning('General:')}
  ${color('--quality', Colors.fg.cyan)} <q>           Video quality (1080p, 720p, best/worst, etc)
  ${color('--verbose', Colors.fg.cyan)}               Enable verbose logging
`);
}
