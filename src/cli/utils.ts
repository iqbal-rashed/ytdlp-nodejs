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

  if (cliOptions.output) options.output = String(cliOptions.output);
  if (cliOptions.proxy) options.proxy = String(cliOptions.proxy);
  if (cliOptions.cookies) options.cookies = String(cliOptions.cookies);
  if (cliOptions.cookiesFromBrowser)
    options.cookiesFromBrowser = String(cliOptions.cookiesFromBrowser);
  if (cliOptions.socketTimeout)
    options.socketTimeout = Number(cliOptions.socketTimeout);
  if (cliOptions.concurrentFragments)
    options.concurrentFragments = Number(cliOptions.concurrentFragments);
  if (cliOptions.retries) options.retries = Number(cliOptions.retries);
  if (cliOptions.retrySleep) options.retrySleep = Number(cliOptions.retrySleep);
  if (cliOptions.limitRate) options.limitRate = String(cliOptions.limitRate);
  if (cliOptions.downloadSections)
    options.downloadSections = String(cliOptions.downloadSections);
  if (cliOptions.playlistItems)
    options.playlistItems = String(cliOptions.playlistItems);
  if (cliOptions.noPlaylist) options.noPlaylist = true;
  if (cliOptions.formatSort)
    options.formatSort = String(cliOptions.formatSort)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  if (cliOptions.mergeOutputFormat)
    options.mergeOutputFormat = String(cliOptions.mergeOutputFormat);
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

${Style.warning('Options:')}
  ${color('--output', Colors.fg.cyan)} <template>     Output filename template
  ${color('--quality', Colors.fg.cyan)} <q>           Video quality (1080p, 720p, etc)
  ${color('--verbose', Colors.fg.cyan)}               Enable verbose logging
`);
}
