import { PassThrough } from 'stream';
import {
  FormatKeyWord,
  FormatOptions,
  GetFileOptions,
  PipeResponse,
  VideoProgress,
} from '../types';
import {
  getContentType,
  getContentTypeFromArgs,
  parseFormatOptions,
} from '../utils/format';
import { stringToProgress } from '../utils/progress';
import { buildYtDlpArgs } from '../core/args';
import { runYtDlp } from '../core/runner';

/** Internal context for stream operations. */
export interface StreamContext {
  binaryPath: string;
  ffmpegPath?: string;
}

/**
 * Executes async command with optional passthrough stream.
 */
async function executeWithStream(
  ctx: StreamContext,
  args: string[],
  onData?: (data: string) => void,
  passThrough?: PassThrough,
): Promise<string> {
  if (!ctx.binaryPath) throw new Error('Ytdlp binary not found');

  const result = await runYtDlp(ctx.binaryPath, args, {
    onStdout: onData,
    onStderr: onData,
    passThrough,
    parseStdoutProgress: !passThrough,
  });
  return result.stdout;
}

/**
 * Creates a stream for downloading video content.
 */
export function createStream<F extends FormatKeyWord>(
  ctx: StreamContext,
  url: string,
  options?: FormatOptions<F>,
): PipeResponse {
  const { format, onProgress, ...opt } = options || {};
  const args = buildYtDlpArgs({
    url,
    options: opt,
    ffmpegPath: ctx.ffmpegPath,
    withProgressTemplate: !!onProgress,
    extra: [...parseFormatOptions(format), '-o', '-'],
  });

  const passThrough = new PassThrough();

  const promise = executeWithStream(
    ctx,
    args,
    (data) => {
      const progress = stringToProgress(data);
      if (progress) {
        onProgress?.(progress);
      }
    },
    passThrough,
  );

  return {
    promise,
    pipe: (
      destination: NodeJS.WritableStream,
      pipeOptions?: { end?: boolean },
    ) => passThrough.pipe(destination, pipeOptions),
    pipeAsync: (
      destination: NodeJS.WritableStream,
      pipeOptions?: { end?: boolean },
    ) => {
      return new Promise((resolve, reject) => {
        const pt = passThrough.pipe(destination, pipeOptions);
        destination.on('finish', () => resolve(pt));
        destination.on('error', reject);
      });
    },
  };
}

/**
 * Downloads video content and returns it as a File object.
 * Fetches title with lightweight --print call first, then streams file.
 */
export async function getFileAsync<F extends FormatKeyWord>(
  ctx: StreamContext,
  url: string,
  options?: GetFileOptions<F> & {
    onProgress?: (p: VideoProgress) => void;
  },
): Promise<File> {
  const { format, filename, metadata, onProgress, ...opt } = options || {};

  // If filename not provided, fetch title first (fast --print --no-download)
  let capturedTitle = '';
  if (!filename) {
    try {
      const titleResult = await runYtDlp(ctx.binaryPath, [
        '--print',
        '%(title)s',
        '--no-download',
        url,
      ]);
      capturedTitle = titleResult.stdout.trim();
    } catch {
      // Fallback if title fetch fails
    }
  }

  const passThrough = new PassThrough();
  const chunks: Buffer[] = [];

  passThrough.on('data', (chunk: Buffer) => {
    chunks.push(Buffer.from(chunk));
  });

  const args = buildYtDlpArgs({
    url,
    options: opt,
    ffmpegPath: ctx.ffmpegPath,
    withProgressTemplate: !!onProgress,
    extra: [...parseFormatOptions(format), '-o', '-'],
  });

  if (!ctx.binaryPath) throw new Error('Ytdlp binary not found');

  await runYtDlp(ctx.binaryPath, args, {
    onStderr: (data) => {
      if (onProgress) {
        const progress = stringToProgress(data);
        if (progress) {
          onProgress(progress);
        }
      }
    },
    passThrough,
    parseStdoutProgress: false,
    parseStderrProgress: false,
  });

  // Determine content type and extension from format options
  const contentType =
    getContentTypeFromArgs(opt) || getContentType(format) || 'video/mp4';

  // Derive extension from content type
  const extMap: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/mkv': 'mkv',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/m4a': 'm4a',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/opus': 'opus',
  };
  const ext = extMap[contentType] || contentType.split('/')[1] || 'mp4';

  // Build filename: capturedTitle + extension
  const capturedFilename = capturedTitle ? `${capturedTitle}.${ext}` : '';
  const finalFilename = filename || capturedFilename || 'download';

  const finalMetadata = {
    name: finalFilename,
    type: contentType,
    size: Buffer.concat(chunks).length,
    ...metadata,
  };

  return new File([new Uint8Array(Buffer.concat(chunks))], finalMetadata.name, {
    type: finalMetadata.type,
  });
}
