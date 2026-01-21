/**
 * CLI Commands
 * Provides non-interactive command handlers.
 */

import { FormatOptions, FormatsResult, UpdateResult } from '../types';
import { YtDlp } from '..';
import { loadConfig, updateConfig, CliConfig } from '../configs/config';
import {
  CliOptionValue,
  applySubtitleOptions,
  applySponsorblockOptions,
  buildArgsOptions,
  formatTableRows,
  printUsage,
  progressHandler,
  resolveFormatOption,
} from './utils';

/**
 * Handles format results output.
 */
function handleFormatsResult(result: FormatsResult): void {
  if (result.source === 'json') {
    const rows = result.formats.map((format) => ({
      formatId: format.format_id,
      extension: format.ext || '',
      resolution: format.resolution || '',
      note: format.format_note || '',
      raw: '',
    }));
    console.log(formatTableRows(rows));
  } else {
    console.log(formatTableRows(result.table.rows));
  }
}

/**
 * Runs a CLI command.
 */
export async function runCommand(
  command: string,
  positionals: string[],
  options: Record<string, CliOptionValue>,
): Promise<void> {
  const ytdlp = new YtDlp();

  if (command === 'download') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    const config = await loadConfig();
    const argsOptions = buildArgsOptions(options, config);
    applySubtitleOptions(argsOptions, options, config);
    applySponsorblockOptions(argsOptions, options, config);

    const format = resolveFormatOption(options, config);
    const formatOptions: FormatOptions<'audioonly'> = {
      ...argsOptions,
      format,
      onProgress: options.verbose ? progressHandler('Downloading') : undefined,
    };

    formatOptions.printPaths = Boolean(options.printPaths);
    if (options.printPaths) {
      formatOptions.onPaths = (paths) => console.log(paths.join('\n'));
    }
    await ytdlp.downloadAsync(String(url), formatOptions);
    return;
  }

  if (command === 'info') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    const info = await ytdlp.getInfoAsync(String(url));
    console.log(JSON.stringify(info, null, 2));
    return;
  }

  if (command === 'formats') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    const result = await ytdlp.getFormatsAsync(String(url));
    handleFormatsResult(result);
    return;
  }

  if (command === 'urls') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    const urls = await ytdlp.getDirectUrlsAsync(String(url));
    console.log(urls.join('\n'));
    return;
  }

  if (command === 'subs') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    const config = await loadConfig();
    const argsOptions = buildArgsOptions(options, config);
    applySubtitleOptions(
      argsOptions,
      {
        ...options,
        writeSubs: true,
        writeAutoSubs: options.auto,
        embedSubs: options.embed,
      },
      config,
    );
    argsOptions.skipDownload = true;
    await ytdlp.execAsync(String(url), argsOptions);
    return;
  }

  if (command === 'sponsorblock') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    const config = await loadConfig();
    const argsOptions = buildArgsOptions(options, config);
    applySponsorblockOptions(
      argsOptions,
      {
        sponsorblockCategories:
          options.categories || options.sponsorblockCategories,
        sponsorblockMode: options.mode || options.sponsorblockMode,
      },
      config,
    );
    await ytdlp.downloadAsync(String(url), argsOptions);
    return;
  }

  if (command === 'sections') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    const range = options.range;
    if (!range) {
      printUsage();
      return;
    }
    const config = await loadConfig();
    const argsOptions = buildArgsOptions(options, config);
    argsOptions.downloadSections = String(range);
    argsOptions.splitChapters = Boolean(options.splitChapters);
    await ytdlp.downloadAsync(String(url), argsOptions);
    return;
  }

  if (command === 'update') {
    const result: UpdateResult = await ytdlp.updateYtDlpAsync();
    console.log(
      `Updated via ${result.method}. Binary: ${result.binaryPath}${
        result.version ? ` (version ${result.version})` : ''
      }`,
    );
    return;
  }

  if (command === 'config') {
    if (options.set) {
      const [key, value] = String(options.set).split('=');
      if (!key) {
        console.error('Invalid config pair.');
        return;
      }
      await updateConfig({ [key]: value } as CliConfig);
    }
    const config = await loadConfig();
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  printUsage();
}
