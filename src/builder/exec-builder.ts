/**
 * Fluent builder class for yt-dlp exec operations
 * Provides FFmpeg-like chaining API for executing arbitrary yt-dlp commands
 * Combines features from Download and Stream builders
 */

import { PassThrough } from 'node:stream';
import type { DownloadedVideoInfo, VideoProgress } from '../types';
import { stringToProgress } from '../utils/progress';
import {
  parseBeforeDownloadInfo,
  parsePrintedOutput,
  parsePrintedVideoInfo,
} from '../core/parse';
import { BaseBuilder } from './base-builder';
import {
  buildBeforeDownloadPrintArg,
  getDownloadPrintArgs,
} from '../core/constants';
import { spawn } from 'node:child_process';

/**
 * Event map for exec builder events
 */
export interface ExecBuilderEvents {
  start: [command: string];
  progress: [progress: VideoProgress];
  beforeDownload: [info: DownloadedVideoInfo];
  afterDownload: [info: DownloadedVideoInfo];
  stdout: [data: string];
  stderr: [data: string];
  data: [chunk: Buffer];
  error: [error: Error];
  complete: [result: ExecBuilderResult];
  end: [];
}

/**
 * Result type for exec operations (when not piping)
 */
export interface ExecBuilderResult {
  /** Standard output from the command */
  stdout: string;
  /** Standard error output from the command */
  stderr: string;
  /** Exit code (null if process was terminated by signal) */
  exitCode: number | null;
  /** Full command that was executed */
  command: string;
  /** Downloaded video info (if available) */
  info?: DownloadedVideoInfo[];
  /** Output (if available) */
  output: string;
  /** File paths (if available) */
  filePaths?: string[];
}

/**
 * Result type for pipe operations
 */
export interface ExecPipeResult {
  /** Total bytes streamed */
  bytes: number;
  /** Duration in milliseconds */
  duration: number;
  /** Downloaded video info (if available) */
  info?: DownloadedVideoInfo;
  /** Output (if available) */
  output: string;
}

/**
 * Fluent builder for yt-dlp exec operations
 *
 * Use this builder when you need to execute arbitrary yt-dlp commands
 * with full control over arguments, streaming, and download events.
 *
 * @example
 * ```typescript
 * import { Exec } from 'ytdlp-nodejs';
 *
 * // Execute command and get output
 * const result = await new Exec()
 *   .url('https://youtube.com/watch?v=...')
 *   .addArgs('--dump-single-json')
 *   .addArgs('--flat-playlist')
 *   .on('progress', (p) => console.log(p.status))
 *   .exec();
 *
 * console.log('Output:', result.stdout);
 * ```
 *
 * @example
 * ```typescript
 * import { createWriteStream } from 'fs';
 *
 * // Pipe to file (like Stream builder)
 * const result = await new Exec()
 *   .url('https://youtube.com/watch?v=...')
 *   .filter('mergevideo')
 *   .quality('720p')
 *   .type('mp4')
 *   .on('beforeDownload', (info) => console.log('Starting:', info.title))
 *   .on('afterDownload', (info) => console.log('Finished:', info.filepath))
 *   .pipe(createWriteStream('video.mp4'));
 *
 * console.log('Bytes:', result.bytes);
 * ```
 *
 * @example
 * ```typescript
 * // Get video title only
 * const result = await new Exec()
 *   .url('https://youtube.com/watch?v=...')
 *   .addArgs('--print', 'title')
 *   .exec();
 *
 * console.log('Title:', result.stdout.trim());
 * ```
 */
export class Exec extends BaseBuilder {
  private passThrough?: PassThrough;
  private totalBytes = 0;
  private started = false;
  private beforeDownloadInfo?: DownloadedVideoInfo;
  private afterDownloadInfo?: DownloadedVideoInfo;
  private output = '';

  // Promise handling for non-pipe mode
  private resultPromise?: Promise<ExecBuilderResult>;

  /**
   * Add a typed event listener
   */
  on<K extends keyof ExecBuilderEvents>(
    event: K,
    listener: (...args: ExecBuilderEvents[K]) => void,
  ): this {
    return super.on(event, listener as (...args: unknown[]) => void);
  }

  /**
   * Add a one-time typed event listener
   */
  once<K extends keyof ExecBuilderEvents>(
    event: K,
    listener: (...args: ExecBuilderEvents[K]) => void,
  ): this {
    return super.once(event, listener as (...args: unknown[]) => void);
  }

  /**
   * Emit a typed event
   */
  emit<K extends keyof ExecBuilderEvents>(
    event: K,
    ...args: ExecBuilderEvents[K]
  ): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Build the command arguments
   */
  protected buildArgs(): string[] {
    const baseArgs: string[] = [];

    // Add before_dl and after_move print if there are listeners
    const printArgs = [...getDownloadPrintArgs()];
    if (this.listenerCount('beforeDownload') > 0) {
      printArgs.unshift('--print', buildBeforeDownloadPrintArg());
    }
    if (this.listenerCount('afterDownload') > 0) {
      printArgs.push('--print', 'after_move:filepath');
    }

    return this.buildBaseArgs([...baseArgs, ...printArgs]);
  }

  /**
   * Start the exec process (for pipe mode)
   */
  private startStream(): PassThrough {
    if (this.started) {
      return this.passThrough!;
    }

    this.validateBinaryPath();
    this.started = true;
    this.passThrough = new PassThrough();

    this.output = '';

    let args = this.buildArgs();
    // Add --no-playlist when streaming to avoid downloading entire playlists
    if (!args.includes('--no-playlist')) {
      args = ['--no-playlist', ...args];
    }
    const command = `${this.binaryPath} ${args.join(' ')}`;

    this.process = spawn(this.binaryPath, args, { shell: false });
    this.emit('start', command);

    this.process.stdout?.on('data', (chunk: Buffer) => {
      this.totalBytes += chunk.length;
      this.passThrough!.write(chunk);
      this.emit('data', chunk);

      // Also emit as text for compatibility
      const text = chunk.toString();
      this.emit('stdout', text);

      // Check for beforeDownload info
      const beforeInfo = parseBeforeDownloadInfo(text);
      if (beforeInfo) {
        this.beforeDownloadInfo = beforeInfo as unknown as DownloadedVideoInfo;
        this.emit('beforeDownload', this.beforeDownloadInfo);
      }

      // Check for progress information
      const progress = stringToProgress(text);
      if (progress) {
        this.emit('progress', progress);
      }
    });

    this.process.stderr?.on('data', (data: Buffer) => {
      const text = data.toString();
      this.emit('stderr', text);
      this.output += text;
      // Check for beforeDownload info in stderr
      const beforeInfo = parseBeforeDownloadInfo(text);
      if (beforeInfo) {
        this.beforeDownloadInfo = beforeInfo as unknown as DownloadedVideoInfo;
        this.emit('beforeDownload', this.beforeDownloadInfo);
      }

      // Progress is often written to stderr
      const progress = stringToProgress(text);
      if (progress) {
        this.emit('progress', progress);

        // Check if download is finished
        if (progress.status === 'finished') {
          if (this.beforeDownloadInfo) {
            this.afterDownloadInfo = {
              ...this.beforeDownloadInfo,
              filepath: progress.filename,
            } as unknown as DownloadedVideoInfo;
            this.emit('afterDownload', this.afterDownloadInfo);
          }
        }
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
   * import { createWriteStream } from 'fs';
   *
   * const result = await new Exec()
   *   .url(url)
   *   .filter('mergevideo')
   *   .on('beforeDownload', (info) => console.log('Starting:', info.title))
   *   .pipe(createWriteStream('video.mp4'));
   * ```
   */
  pipe<T extends NodeJS.WritableStream>(
    destination: T,
    options?: { end?: boolean },
  ): Promise<ExecPipeResult> {
    const startTime = Date.now();
    const stream = this.startStream();

    return new Promise((resolve, reject) => {
      stream.pipe(destination, options);

      destination.on('finish', () => {
        resolve({
          bytes: this.totalBytes,
          duration: Date.now() - startTime,
          info: this.afterDownloadInfo,
          output: this.output,
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
  ): Promise<ExecPipeResult> {
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

  /**
   * Execute the yt-dlp command and return the result (non-pipe mode)
   */
  exec(): Promise<ExecBuilderResult> {
    if (this.resultPromise) {
      return this.resultPromise;
    }

    this.resultPromise = new Promise((resolve, reject) => {
      try {
        this.validateBinaryPath();
        const args = this.buildArgs();
        const command = `${this.binaryPath} ${args.join(' ')}`;

        this.process = spawn(this.binaryPath, args, { shell: false });
        this.emit('start', command);

        let stdout = '';
        let stderr = '';

        this.process.stdout?.on('data', (data: Buffer) => {
          const text = data.toString();
          stdout += text;
          this.emit('stdout', text);

          // Check for beforeDownload info
          const beforeInfo = parseBeforeDownloadInfo(text);
          if (beforeInfo) {
            this.beforeDownloadInfo =
              beforeInfo as unknown as DownloadedVideoInfo;
            this.emit('beforeDownload', this.beforeDownloadInfo);
          }

          // Emit as data event for compatibility
          this.emit('data', data);

          // Check for progress information
          const progress = stringToProgress(text);
          if (progress) {
            this.emit('progress', progress);

            // Check if download is finished
            if (progress.status === 'finished' && this.beforeDownloadInfo) {
              this.afterDownloadInfo = {
                ...this.beforeDownloadInfo,
                filepath: progress.filename,
              } as unknown as DownloadedVideoInfo;
              this.emit('afterDownload', this.afterDownloadInfo);
            }
          }
        });

        this.process.stderr?.on('data', (data: Buffer) => {
          const text = data.toString();
          stderr += text;
          this.emit('stderr', text);

          // Check for beforeDownload info in stderr
          const beforeInfo = parseBeforeDownloadInfo(text);
          if (beforeInfo) {
            this.beforeDownloadInfo =
              beforeInfo as unknown as DownloadedVideoInfo;
            this.emit('beforeDownload', this.beforeDownloadInfo);
          }

          // Progress is often written to stderr
          const progress = stringToProgress(text);
          if (progress) {
            this.emit('progress', progress);

            // Check if download is finished
            if (progress.status === 'finished' && this.beforeDownloadInfo) {
              this.afterDownloadInfo = {
                ...this.beforeDownloadInfo,
                filepath: progress.filename,
              } as unknown as DownloadedVideoInfo;
              this.emit('afterDownload', this.afterDownloadInfo);
            }
          }
        });

        this.process.on('error', (error: Error) => {
          this.emit('error', error);
          reject(error);
        });

        this.process.on('close', (code: number | null) => {
          const output = parsePrintedOutput(stdout);
          const info = parsePrintedVideoInfo(
            stdout,
          ) as unknown as DownloadedVideoInfo[];

          const result: ExecBuilderResult = {
            stdout,
            stderr,
            exitCode: code,
            command,
            info,
            output,
            filePaths: info.map((i) => i?.filepath ?? '').filter(Boolean),
          };

          this.emit('complete', result);
          this.emit('end');
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });

    return this.resultPromise;
  }

  /**
   * Alias for exec() - for convenience
   */
  run(): Promise<ExecBuilderResult> {
    return this.exec();
  }

  /**
   * Make the builder directly awaitable
   */
  then<TResult1 = ExecBuilderResult, TResult2 = never>(
    onfulfilled?:
      | ((value: ExecBuilderResult) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }

  /**
   * Catch errors
   */
  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ): Promise<ExecBuilderResult | TResult> {
    return this.exec().catch(onrejected);
  }

  /**
   * Finally handler
   */
  finally(onfinally?: (() => void) | null): Promise<ExecBuilderResult> {
    return this.exec().finally(onfinally);
  }
}

/**
 * Factory function to create a new Exec builder
 */
export function createExec(
  url: string,
  options?: {
    binaryPath?: string;
    ffmpegPath?: string;
  },
): Exec {
  return new Exec(url, options);
}
