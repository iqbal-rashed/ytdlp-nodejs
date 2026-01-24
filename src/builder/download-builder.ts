/**
 * Fluent builder classes for yt-dlp operations
 * Provides FFmpeg-like chaining API
 */

import type {
  ArgsOptions,
  DownloadedVideoInfo,
  DownloadFinishResult,
  VideoProgress,
} from '../types';
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
 * Event map for download builder events
 */
export interface DownloadBuilderEvents {
  start: [command: string];
  progress: [progress: VideoProgress];
  beforeDownload: [info: DownloadedVideoInfo];
  stdout: [data: string];
  stderr: [data: string];
  error: [error: Error];
  finish: [result: DownloadFinishResult];
}

/**
 * Fluent builder for yt-dlp download operations
 *
 * @example
 * ```typescript
 * import { Download } from 'ytdlp-nodejs';
 *
 * const result = await new Download()
 *   .url('https://youtube.com/watch?v=...')
 *   .filter('mergevideo')
 *   .quality('1080p')
 *   .type('mp4')
 *   .output('./downloads')
 *   .on('progress', (p) => console.log(`${p.percentage}%`))
 *   .run();
 *
 * console.log('Downloaded:', result.filePaths);
 * ```
 */
export class Download extends BaseBuilder {
  private outputDir?: string;
  private outputPath?: string;

  // Promise handling
  private resultPromise?: Promise<DownloadFinishResult>;

  /**
   * Add a typed event listener
   */
  on<K extends keyof DownloadBuilderEvents>(
    event: K,
    listener: (...args: DownloadBuilderEvents[K]) => void,
  ): this {
    return super.on(event, listener as (...args: unknown[]) => void);
  }

  /**
   * Add a one-time typed event listener
   */
  once<K extends keyof DownloadBuilderEvents>(
    event: K,
    listener: (...args: DownloadBuilderEvents[K]) => void,
  ): this {
    return super.once(event, listener as (...args: unknown[]) => void);
  }

  /**
   * Emit a typed event
   */
  emit<K extends keyof DownloadBuilderEvents>(
    event: K,
    ...args: DownloadBuilderEvents[K]
  ): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Set the output directory
   */
  output(path: string): this {
    this.outputDir = path;
    return this;
  }

  /**
   * Set the output template (yt-dlp -o option)
   */
  setOutputTemplate(template: string): this {
    this.outputPath = template;
    return this;
  }

  /**
   * Skip download (useful for metadata extraction)
   */
  skipDownload(): this {
    this.extraArgs.skipDownload = true;
    return this;
  }

  /**
   * Build the command arguments
   */
  protected buildArgs(): string[] {
    const options: ArgsOptions = { ...this.extraArgs };

    if (this.outputDir) {
      options.output = `${this.outputDir}/%(title)s.%(ext)s`;
    }
    if (this.outputPath) {
      options.output = this.outputPath;
    }

    // Temporarily update extraArgs for base build
    const savedExtraArgs = this.extraArgs;
    this.extraArgs = options;

    // Add before_dl print if there are listeners for beforeDownload
    const extraPrintArgs = [...getDownloadPrintArgs()];
    if (this.listenerCount('beforeDownload') > 0) {
      extraPrintArgs.unshift('--print', buildBeforeDownloadPrintArg());
    }

    const args = this.buildBaseArgs(extraPrintArgs);
    this.extraArgs = savedExtraArgs;

    return args;
  }

  /**
   * Run the download
   */
  run(): Promise<DownloadFinishResult> {
    if (this.resultPromise) {
      return this.resultPromise;
    }

    this.resultPromise = new Promise((resolve, reject) => {
      try {
        this.validateBinaryPath();
        const args = this.buildArgs();
        const command = `${this.binaryPath} ${args.join(' ')}`;

        this.process = spawn(this.binaryPath, args);
        this.emit('start', command);

        let stdout = '';
        let stderr = '';

        this.process.stdout?.on('data', (data: Buffer) => {
          const text = data.toString();
          stdout += text;
          this.emit('stdout', text);

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

        this.process.stderr?.on('data', (data: Buffer) => {
          const text = data.toString();
          stderr += text;
          this.emit('stderr', text);

          const progress = stringToProgress(text);
          if (progress) {
            this.emit('progress', progress);
          }
        });

        this.process.on('error', (error: Error) => {
          this.emit('error', error);
          reject(error);
        });

        this.process.on('close', (code: number | null) => {
          if (code !== 0 && code !== null) {
            const error = new Error(
              `yt-dlp exited with code ${code}: ${stderr}`,
            );
            this.emit('error', error);
            reject(error);
            return;
          }

          const output = parsePrintedOutput(stdout);
          const info = parsePrintedVideoInfo(
            stdout,
          ) as unknown as DownloadedVideoInfo[];

          const result: DownloadFinishResult = {
            output,
            filePaths: info.map((i) => i?.filepath ?? '').filter(Boolean),
            info,
            stderr,
          };

          this.emit('finish', result);
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });

    return this.resultPromise;
  }

  /**
   * Make the builder directly awaitable
   */
  then<TResult1 = DownloadFinishResult, TResult2 = never>(
    onfulfilled?:
      | ((value: DownloadFinishResult) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }

  /**
   * Catch errors
   */
  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ): Promise<DownloadFinishResult | TResult> {
    return this.run().catch(onrejected);
  }

  /**
   * Finally handler
   */
  finally(onfinally?: (() => void) | null): Promise<DownloadFinishResult> {
    return this.run().finally(onfinally);
  }
}

/**
 * Factory function to create a new Download builder
 */
export function createDownload(
  url: string,
  options?: {
    binaryPath?: string;
    ffmpegPath?: string;
  },
): Download {
  return new Download(url, options);
}
