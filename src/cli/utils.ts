/**
 * CLI Utilities
 * Provides argument parsing, formatting, and config helpers.
 */

import fs from 'fs';
import path from 'path';
import { ArgsOptions, FormatOptions, FormatTableRow } from '../types';
import { CliConfig } from '../configs/config';

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
  if (rows.length === 0) return 'No formats found.';
  const headers = ['format', 'ext', 'resolution', 'note'];
  const columns = [
    Math.max(headers[0].length, ...rows.map((r) => r.formatId.length)),
    Math.max(headers[1].length, ...rows.map((r) => r.extension.length)),
    Math.max(headers[2].length, ...rows.map((r) => r.resolution.length)),
  ];

  const lines = [
    `${headers[0].padEnd(columns[0])}  ${headers[1].padEnd(
      columns[1],
    )}  ${headers[2].padEnd(columns[2])}  ${headers[3]}`,
    `${'-'.repeat(columns[0])}  ${'-'.repeat(columns[1])}  ${'-'.repeat(
      columns[2],
    )}  ${'-'.repeat(headers[3].length)}`,
  ];

  for (const row of rows) {
    lines.push(
      `${row.formatId.padEnd(columns[0])}  ${row.extension.padEnd(
        columns[1],
      )}  ${row.resolution.padEnd(columns[2])}  ${row.note}`,
    );
  }

  return lines.join('\n');
}

/**
 * Creates output template from download directory.
 */
export function outputTemplate(downloadDir?: string): string | undefined {
  if (!downloadDir) return undefined;
  return path.join(downloadDir, '%(title)s.%(ext)s');
}

/**
 * Applies config defaults to args options.
 */
export function applyConfigDefaults(
  options: ArgsOptions,
  config: CliConfig,
): void {
  if (config.proxy && !options.proxy) {
    options.proxy = config.proxy;
  }
  if (config.cookiesPath && !options.cookies) {
    options.cookies = config.cookiesPath;
  }
  if (config.concurrency && !options.concurrentFragments) {
    options.concurrentFragments = config.concurrency;
  }
  if (config.verbose && !options.verbose) {
    options.verbose = true;
  }
  if (config.downloadDir && !options.output) {
    options.output = outputTemplate(config.downloadDir);
  }
}

/**
 * Builds ArgsOptions from CLI options.
 */
export function buildArgsOptions(
  cliOptions: Record<string, CliOptionValue>,
  config: CliConfig,
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

  applyConfigDefaults(options, config);
  return options;
}

/**
 * Resolves format option from CLI args and config.
 */
export function resolveFormatOption(
  cliOptions: Record<string, CliOptionValue>,
  config: CliConfig,
): FormatOptions<'audioonly'>['format'] | string | undefined {
  if (cliOptions.format) return String(cliOptions.format);
  if (cliOptions.audioOnly) {
    return {
      filter: 'audioonly',
      type: cliOptions.audioFormat ? String(cliOptions.audioFormat) : 'mp3',
      quality: cliOptions.audioQuality ? Number(cliOptions.audioQuality) : 5,
    } as FormatOptions<'audioonly'>['format'];
  }
  return config.defaultFormat;
}

/**
 * Applies subtitle options to args.
 */
export function applySubtitleOptions(
  options: ArgsOptions,
  cliOptions: Record<string, CliOptionValue>,
  config: CliConfig,
): void {
  const langs = cliOptions.subLangs
    ? String(cliOptions.subLangs)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : config.subtitles?.languages;
  if (langs && langs.length > 0) {
    options.subLangs = langs;
  }
  if (cliOptions.subFormat) {
    options.subFormat = String(cliOptions.subFormat);
  } else if (config.subtitles?.format) {
    options.subFormat = config.subtitles.format;
  }
  if (cliOptions.writeSubs) options.writeSubs = true;
  if (cliOptions.writeAutoSubs) options.writeAutoSubs = true;
  if (cliOptions.embedSubs) options.embedSubs = true;
  if (config.subtitles?.embed && !options.embedSubs) {
    options.embedSubs = true;
  }
  if (config.subtitles?.auto && !options.writeAutoSubs) {
    options.writeAutoSubs = true;
  }
}

/**
 * Applies SponsorBlock options to args.
 */
export function applySponsorblockOptions(
  options: ArgsOptions,
  cliOptions: Record<string, CliOptionValue>,
  config: CliConfig,
): void {
  const categories = cliOptions.sponsorblockCategories
    ? String(cliOptions.sponsorblockCategories)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : config.sponsorblock?.categories;
  const mode = cliOptions.sponsorblockMode
    ? String(cliOptions.sponsorblockMode)
    : config.sponsorblock?.mode;
  if (categories && categories.length > 0) {
    if (mode === 'mark') options.sponsorblockMark = categories;
    if (mode === 'remove') options.sponsorblockRemove = categories;
  }
}

/**
 * Creates a progress handler for console output.
 */
export function progressHandler(
  prefix: string,
): (progress: { percentage_str: string }) => void {
  return (progress) => {
    process.stdout.write(`${prefix} ${progress.percentage_str}\r`);
  };
}

/**
 * Prints CLI usage help.
 */
export function printUsage(): void {
  console.log(`ytdlp-nodejs ${getPackageVersion()}

Usage:
  ytdlp-nodejs                     Launch interactive mode
  ytdlp-nodejs download <url>      Download a video
  ytdlp-nodejs info <url>          Get info as JSON
  ytdlp-nodejs formats <url>       List formats
  ytdlp-nodejs urls <url>          Get direct URLs
  ytdlp-nodejs subs <url>          Download subtitles only
  ytdlp-nodejs sponsorblock <url>  Download with SponsorBlock
  ytdlp-nodejs sections <url>      Download sections/time range
  ytdlp-nodejs update              Update yt-dlp
  ytdlp-nodejs config              Show or set CLI config
`);
}
