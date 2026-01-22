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
import {
  parsePrintedOutput,
  parsePrintedVideoInfo,
} from '../core/parsers/paths';
import type { DownloadedVideoInfo } from '../types';

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
 * Video info fields to collect after download (post-processing complete).
 */
const VIDEO_INFO_FIELDS = [
  'id',
  'title',
  'fulltitle',
  'ext',
  'alt_title',
  'description',
  'display_id',
  'uploader',
  'uploader_id',
  'uploader_url',
  'license',
  'creators',
  'creator',
  'timestamp',
  'upload_date',
  'release_timestamp',
  'release_date',
  'release_year',
  'modified_timestamp',
  'modified_date',
  'channel',
  'channel_id',
  'channel_url',
  'channel_follower_count',
  'channel_is_verified',
  'location',
  'duration',
  'duration_string',
  'view_count',
  'concurrent_view_count',
  'like_count',
  'dislike_count',
  'repost_count',
  'average_rating',
  'comment_count',
  'save_count',
  'age_limit',
  'live_status',
  'is_live',
  'was_live',
  'playable_in_embed',
  'availability',
  'media_type',
  'start_time',
  'end_time',
  'extractor',
  'extractor_key',
  'epoch',
  'autonumber',
  'video_autonumber',
  'n_entries',
  'playlist_id',
  'playlist_title',
  'playlist',
  'playlist_count',
  'playlist_index',
  'playlist_autonumber',
  'playlist_uploader',
  'playlist_uploader_id',
  'playlist_channel',
  'playlist_channel_id',
  'playlist_webpage_url',
  'webpage_url',
  'webpage_url_basename',
  'webpage_url_domain',
  'original_url',
  'categories',
  'tags',
  'cast',
  'filepath',
];

/**
 * Builds extra download arguments for format options.
 * Always includes path printing and video info for result collection.
 */
export function buildDownloadExtraArgs<F extends FormatKeyWord>(
  format: FormatOptions<F>['format'],
): string[] {
  const extra = parseFormatOptions(format);

  // Build JSON formatted print string with all video info fields.
  // Note: %(field)j outputs JSON-encoded values, but for missing values it outputs
  // bare 'NA' which breaks JSON parsing. Using %(field|null)j provides a fallback
  // that outputs the literal 'null' when the field is missing/NA.
  const jsonFields = VIDEO_INFO_FIELDS.map(
    (field) => `"${field}":%(${field}|null)j`,
  ).join(',');
  extra.push('--print', `after_move:__YTDLP_VIDEO_INFO__:{${jsonFields}}`);

  extra.push('--progress', '--newline');
  return extra;
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
): Promise<{
  output: string;
  info: DownloadedVideoInfo | null;
}> {
  const { format, onProgress, ...opt } = options || {};
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

  const newOutput = parsePrintedOutput(output);
  const info = parsePrintedVideoInfo(output) as DownloadedVideoInfo | null;
  return { output: newOutput, info };
}

/**
 * Spawns a sync download process.
 */
export function downloadSync<F extends FormatKeyWord>(
  ctx: DownloadContext,
  url: string,
  options?: Omit<FormatOptions<F>, 'onProgress'>,
): ChildProcess {
  const { format, ...opt } = options || {};
  const extra = buildDownloadExtraArgs(format);
  const args = buildDownloadArgs({
    url,
    options: opt,
    ffmpegPath: ctx.ffmpegPath,
    withProgressTemplate: true,
    extra,
  });
  const ytDlpProcess = executeDownload(ctx, args);

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

  return {
    output: result.output,
    filePath: result.info?.filepath ?? '',
    info: result.info ?? undefined,
  };
}
