/**
 * CLI Commands
 * Provides non-interactive command handlers.
 */

import { FormatsResult, UpdateResult, VideoQuality } from '../types';
import { YtDlp } from '..';
import {
  CliOptionValue,
  buildArgsOptions,
  formatTableRows,
  printUsage,
} from './utils';
import { Style } from './style';
import { interactiveDownload, interactiveInfo } from './interactive';

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
    await interactiveDownload(ytdlp, false, String(url));
    return;
  }

  if (command === 'info') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    await interactiveInfo(ytdlp, String(url));
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

  if (command === 'audio') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    await interactiveDownload(ytdlp, true, String(url));
    return;
  }

  if (command === 'video') {
    const url = positionals[0];
    if (!url) {
      printUsage();
      return;
    }
    const argsOptions = buildArgsOptions(options);
    const quality = options.quality ? String(options.quality) : 'best';

    const result = await ytdlp.downloadVideo(
      String(url),
      quality as VideoQuality,
      argsOptions,
    );
    if (result.filePaths.length > 0) {
      console.log(result.filePaths.join('\n'));
    }
    return;
  }

  if (command === 'ffmpeg') {
    console.log(Style.info('Downloading FFmpeg...'));
    const path = await ytdlp.downloadFFmpeg();
    if (path) {
      console.log(Style.success(`FFmpeg available at: ${path}`));
    } else {
      console.log(Style.error('Failed to download FFmpeg.'));
    }
    return;
  }

  if (command === 'update') {
    const result: UpdateResult = await ytdlp.updateYtDlpAsync();
    console.log(
      Style.success(
        `Updated via ${result.method}. Binary: ${result.binaryPath}${
          result.version ? ` (version ${result.version})` : ''
        }`,
      ),
    );
    return;
  }

  printUsage();
}
