import type { ChildProcess } from 'child_process';
import { PassThrough } from 'stream';
import {
  ArgsOptions,
  DownloadResult,
  FormatKeyWord,
  FormatOptions,
} from '../types';
import { parseFormatOptions } from '../utils/format';
import { stringToProgress } from '../utils/progress';
import { runYtDlp, spawnYtDlp } from '../core/runner';
import { buildYtDlpArgs } from '../core/args';
import { parsePrintedPaths } from '../core/parsers/paths';

/** Internal context for download operations. */
export interface DownloadContext {
  binaryPath: string;
  ffmpegPath?: string;
}

/** Options for building download arguments. */
export interface BuildDownloadArgsOptions {
  url: string;
  options?: ArgsOptions;
  ffmpegPath?: string;
  withProgressTemplate?: boolean;
  extra?: string[];
}

/** Thumbnail file extensions */
const THUMBNAIL_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/** Subtitle file extensions */
const SUBTITLE_EXTENSIONS = ['.vtt', '.srt', '.ass', '.ssa', '.sub', '.lrc'];

/**
 * Categorizes paths by file type.
 */
function categorizePaths(paths: string[]): {
  filePaths: string[];
  thumbnailPaths: string[];
  subtitlePaths: string[];
} {
  const filePaths: string[] = [];
  const thumbnailPaths: string[] = [];
  const subtitlePaths: string[] = [];

  for (const path of paths) {
    const lowerPath = path.toLowerCase();
    if (THUMBNAIL_EXTENSIONS.some((ext) => lowerPath.endsWith(ext))) {
      thumbnailPaths.push(path);
    } else if (SUBTITLE_EXTENSIONS.some((ext) => lowerPath.endsWith(ext))) {
      subtitlePaths.push(path);
    } else {
      filePaths.push(path);
    }
  }

  return { filePaths, thumbnailPaths, subtitlePaths };
}

/**
 * Builds yt-dlp arguments for download operations.
 */
export function buildDownloadArgs(opts: BuildDownloadArgsOptions): string[] {
  return buildYtDlpArgs({
    url: opts.url,
    options: opts.options,
    ffmpegPath: opts.ffmpegPath,
    withProgressTemplate: opts.withProgressTemplate,
    extra: opts.extra,
  });
}

/**
 * Builds extra download arguments for format options.
 * Always includes path printing for result collection.
 */
export function buildDownloadExtraArgs<F extends FormatKeyWord>(
  format: FormatOptions<F>['format'],
): string[] {
  const extra = parseFormatOptions(format);
  // Always collect paths for DownloadResult
  extra.push('--print', 'after_move:filepath');
  return extra;
}

/**
 * Attaches path collection listener to child process.
 * Emits 'paths' event with categorized paths.
 */
export function attachPathsListener(
  child: ChildProcess,
  onPaths?: (paths: string[]) => void,
): void {
  if (!child.stdout) return;
  const paths: string[] = [];
  let buffer = '';

  child.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.includes('~ytdlp-progress-')) continue;
      paths.push(trimmed);
    }
  });

  child.on('close', () => {
    const trimmed = buffer.trim();
    if (trimmed && !trimmed.includes('~ytdlp-progress-')) {
      paths.push(trimmed);
    }
    if (paths.length > 0) {
      const categorized = categorizePaths(paths);
      child.emit('paths', categorized);
    }
    onPaths?.(paths);
  });
}

/**
 * Executes a synchronous download using spawn.
 */
export function executeDownload(
  ctx: DownloadContext,
  args: string[],
): ChildProcess {
  if (!ctx.binaryPath) throw new Error('Ytdlp binary not found');
  return spawnYtDlp(ctx.binaryPath, args);
}

/**
 * Executes an async download using runYtDlp.
 */
export async function executeDownloadAsync(
  ctx: DownloadContext,
  args: string[],
  onData?: (data: string) => void,
  passThrough?: PassThrough,
): Promise<string> {
  if (!ctx.binaryPath) throw new Error('Ytdlp binary not found');

  const result = await runYtDlp(ctx.binaryPath, args, {
    onStdout: onData,
    onStderr: onData,
    passThrough,
  });
  return result.stdout;
}

/**
 * Internal download implementation.
 */
export async function downloadInternal<F extends FormatKeyWord>(
  ctx: DownloadContext,
  url: string,
  options?: FormatOptions<F>,
): Promise<{ output: string; paths: string[] }> {
  const { format, onProgress, onPaths, ...opt } = options || {};
  const extra = buildDownloadExtraArgs(format);
  const args = buildDownloadArgs({
    url,
    options: opt,
    ffmpegPath: ctx.ffmpegPath,
    withProgressTemplate: !!onProgress,
    extra,
  });

  const output = await executeDownloadAsync(ctx, args, (data) => {
    const progress = stringToProgress(data);
    if (progress) {
      onProgress?.(progress);
    }
  });

  const paths = parsePrintedPaths(output);
  onPaths?.(paths);
  return { output, paths };
}

/**
 * Spawns a sync download process.
 * Emits 'paths' event with { filePaths, thumbnailPaths, subtitlePaths } on completion.
 */
export function downloadSync<F extends FormatKeyWord>(
  ctx: DownloadContext,
  url: string,
  options?: Omit<FormatOptions<F>, 'onProgress'>,
): ChildProcess {
  const { format, onPaths, ...opt } = options || {};
  const extra = buildDownloadExtraArgs(format);
  const args = buildDownloadArgs({
    url,
    options: opt,
    ffmpegPath: ctx.ffmpegPath,
    withProgressTemplate: true,
    extra,
  });
  const ytDlpProcess = executeDownload(ctx, args);

  // Always attach paths listener for 'paths' event
  attachPathsListener(ytDlpProcess, onPaths);

  return ytDlpProcess;
}

/**
 * Executes an async download and returns structured result.
 */
export async function downloadAsync<F extends FormatKeyWord>(
  ctx: DownloadContext,
  url: string,
  options?: FormatOptions<F>,
): Promise<DownloadResult> {
  const result = await downloadInternal(ctx, url, options);
  const { filePaths, thumbnailPaths, subtitlePaths } = categorizePaths(
    result.paths,
  );

  return {
    output: result.output,
    filePaths,
    thumbnailPaths,
    subtitlePaths,
  };
}
