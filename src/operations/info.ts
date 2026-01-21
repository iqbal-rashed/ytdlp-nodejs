import {
  ArgsOptions,
  FormatsResult,
  InfoOptions,
  InfoType,
  PlaylistInfo,
  VideoInfo,
  VideoThumbnail,
} from '../types';
import { createArgs } from '../utils/args';
import { extractThumbnails } from '../utils/thumbnails';
import { runYtDlp } from '../core/runner';
import { parseJson } from '../core/parsers/json';

/** Internal context for info operations. */
export interface InfoContext {
  binaryPath: string;
}

/**
 * Executes a yt-dlp command and returns stdout.
 */
async function execute(ctx: InfoContext, args: string[]): Promise<string> {
  if (!ctx.binaryPath) throw new Error('Ytdlp binary not found');
  const result = await runYtDlp(ctx.binaryPath, args);
  return result.stdout;
}

/**
 * Fetches video or playlist information.
 */
export async function getInfoAsync<T extends InfoType>(
  ctx: InfoContext,
  url: string,
  options?: InfoOptions,
): Promise<T extends 'video' ? VideoInfo : PlaylistInfo> {
  const args = [
    '--dump-single-json',
    '--quiet',
    ...createArgs({ flatPlaylist: true, ...options }),
    url,
  ];
  const execResult = await execute(ctx, args);
  return parseJson(execResult);
}

/**
 * Gets formats using JSON output.
 */
export async function getFormatsAsync(
  ctx: InfoContext,
  url: string,
  options?: ArgsOptions,
): Promise<FormatsResult> {
  const args = [
    '--dump-single-json',
    '--quiet',
    ...createArgs({ flatPlaylist: true, ...options }),
    url,
  ];
  const execResult = await execute(ctx, args);
  const info = parseJson<VideoInfo | PlaylistInfo>(execResult);
  const formats = (info as VideoInfo).formats || [];
  return {
    source: 'json',
    info,
    formats,
  };
}

/**
 * Gets direct media URLs using --get-url.
 */
export async function getDirectUrlsAsync(
  ctx: InfoContext,
  url: string,
  options?: ArgsOptions,
): Promise<string[]> {
  const args = ['--get-url', ...createArgs(options || {}), url];
  const execResult = await execute(ctx, args);
  return String(execResult)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Fetches video thumbnails.
 */
export async function getThumbnailsAsync(
  ctx: InfoContext,
  url: string,
): Promise<VideoThumbnail[]> {
  const args = [
    '--print',
    'thumbnails_table',
    '--print',
    'playlist:thumbnails_table',
    '--quiet',
    url,
  ];
  const execResult = await execute(ctx, args);
  return extractThumbnails(execResult);
}

/**
 * Fetches video title.
 */
export async function getTitleAsync(
  ctx: InfoContext,
  url: string,
): Promise<string> {
  const args = ['--print', 'title', url];
  const execResult = await execute(ctx, args);
  return execResult;
}

/**
 * Gets the yt-dlp version.
 */
export async function getVersionAsync(ctx: InfoContext): Promise<string> {
  const execResult = await execute(ctx, ['--version']);
  return execResult.trim();
}

/**
 * Gets media URLs using --print urls.
 */
export async function getUrlsAsync(
  ctx: InfoContext,
  url: string,
  options?: ArgsOptions,
): Promise<string[]> {
  const args = [
    '--print',
    'urls',
    ...createArgs({ flatPlaylist: true, ...options }),
    url,
  ];
  const execResult = await execute(ctx, args);
  return String(execResult).split('\n');
}
