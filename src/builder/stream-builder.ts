/**
 * Fluent builder class for yt-dlp stream operations
 * Provides FFmpeg-like chaining API for streaming
 */

import { PassThrough } from 'node:stream';
import type { DownloadedVideoInfo, VideoProgress } from '../types';
import { stringToProgress } from '../utils/progress';
import { parseBeforeDownloadInfo } from '../core/parse';
import { BaseBuilder } from './base-builder';
import { buildBeforeDownloadPrintArg } from '../core/constants';
import { spawn } from 'node:child_process';

/**
 * Event map for stream builder events
 */
export interface StreamBuilderEvents {
  start: [command: string];
  progress: [progress: VideoProgress];
  beforeDownload: [info: DownloadedVideoInfo];
  data: [chunk: Buffer];
  stderr: [data: string];
  error: [error: Error];
  end: [];
}

/**
 * Result type for stream operations
 */
export interface StreamResult {
  /** Total bytes streamed */
  bytes: number;
  /** Duration in milliseconds */
  duration: number;
}

/**
 * Fluent builder for yt-dlp stream operations
 *
 * @example
 * ```typescript
 * import { YtDlp } from 'ytdlp-nodejs';
 * import { createWriteStream } from 'fs';
 *
 * const ytdlp = new YtDlp();
 *
 * // Stream to file - pipe() is awaitable
 * const result = await ytdlp
 *   .stream('https://youtube.com/watch?v=...')
 *   .filter('mergevideo')
 *   .quality('720p')
 *   .type('mp4')
 *   .on('progress', (p) => console.log(p.percentage_str))
 *   .pipe(createWriteStream('video.mp4'));
 *
 * console.log('Bytes:', result.bytes);
 * ```
 */
export class Stream extends BaseBuilder {
  private passThrough?: PassThrough;
  private totalBytes = 0;
  private started = false;

  /**
   * Add a typed event listener
   */
  on<K extends keyof StreamBuilderEvents>(
    event: K,
    listener: (...args: StreamBuilderEvents[K]) => void,
  ): this {
    return super.on(event, listener as (...args: unknown[]) => void);
  }

  /**
   * Add a one-time typed event listener
   */
  once<K extends keyof StreamBuilderEvents>(
    event: K,
    listener: (...args: StreamBuilderEvents[K]) => void,
  ): this {
    return super.once(event, listener as (...args: unknown[]) => void);
  }

  /**
   * Emit a typed event
   */
  emit<K extends keyof StreamBuilderEvents>(
    event: K,
    ...args: StreamBuilderEvents[K]
  ): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Build the command arguments
   */
  protected buildArgs(): string[] {
    const baseArgs = ['-o', '-', '--no-playlist', '--progress', '--no-quiet'];
    // Add before_dl print if there are listeners for beforeDownload
    if (this.listenerCount('beforeDownload') > 0) {
      baseArgs.push('--print', buildBeforeDownloadPrintArg());
    }
    return this.buildBaseArgs(baseArgs);
  }

  /**
   * Start the stream process
   */
  private startStream(): PassThrough {
    if (this.started) {
      return this.passThrough!;
    }

    this.validateBinaryPath();
    this.started = true;
    this.passThrough = new PassThrough();

    const args = this.buildArgs();
    const command = `${this.binaryPath} ${args.join(' ')}`;

    this.process = spawn(this.binaryPath, args, { shell: false });
    this.emit('start', command);

    this.process.stdout?.on('data', (chunk: Buffer) => {
      this.totalBytes += chunk.length;
      this.passThrough!.write(chunk);
      this.emit('data', chunk);
    });

    this.process.stderr?.on('data', (data: Buffer) => {
      const text = data.toString();
      // Check for before_dl info
      const beforeInfo = parseBeforeDownloadInfo(text);
      if (beforeInfo) {
        this.emit(
          'beforeDownload',
          beforeInfo as unknown as DownloadedVideoInfo,
        );
      }

      const progress = stringToProgress(text);
      if (progress) {
        this.emit('progress', progress);
      }
    });

    this.process.on('error', (error: Error) => {
      this.emit('error', error);
      this.passThrough!.destroy(error);
    });

    this.process.on('close', (code: number | null) => {
      if (code !== 0 && code !== null) {
        const error = new Error(`yt-dlp exited with code ${code}`);
        this.emit('error', error);
        this.passThrough!.destroy(error);
      } else {
        this.passThrough!.end();
        this.emit('end');
      }
    });

    return this.passThrough;
  }

  /**
   * Pipe the stream to a writable destination and wait for completion.
   * This method is awaitable - returns a Promise.
   *
   * @example
   * ```typescript
   * const result = await ytdlp
   *   .stream(url)
   *   .filter('mergevideo')
   *   .pipe(createWriteStream('video.mp4'));
   * ```
   */
  pipe<T extends NodeJS.WritableStream>(
    destination: T,
    options?: { end?: boolean },
  ): Promise<StreamResult> {
    const startTime = Date.now();
    const stream = this.startStream();

    return new Promise((resolve, reject) => {
      stream.pipe(destination, options);

      destination.on('finish', () => {
        resolve({
          bytes: this.totalBytes,
          duration: Date.now() - startTime,
        });
      });

      destination.on('error', reject);
      this.passThrough!.on('error', reject);
    });
  }

  /**
   * Alias for pipe() - for backward compatibility
   */
  pipeAsync<T extends NodeJS.WritableStream>(
    destination: T,
    options?: { end?: boolean },
  ): Promise<StreamResult> {
    return this.pipe(destination, options);
  }

  /**
   * Collect the entire stream into a Buffer
   */
  async toBuffer(): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      const stream = this.startStream();

      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on('error', reject);
    });
  }

  /**
   * Get the underlying PassThrough stream
   */
  getStream(): PassThrough {
    return this.startStream();
  }
}

/**
 * Factory function to create a new Stream builder
 */
export function createStream(
  url: string,
  options?: { binaryPath?: string; ffmpegPath?: string },
): Stream {
  return new Stream(url, options);
}
