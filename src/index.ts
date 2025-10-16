import { spawn, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Blob } from 'buffer';
import {
  ArgsOptions,
  FileMetadata,
  GetFileOptions,
  InfoType,
  PipeResponse,
  PlaylistInfo,
  FormatKeyWord,
  FormatOptions,
  VideoInfo,
  VideoProgress,
  VideoThumbnail,
  YtDlpOptions,
  InfoOptions,
  QualityOptions,
  TypeOptions,
  VideoFormat,
} from './types';
import { createArgs } from './utils/args';
import { extractThumbnails } from './utils/thumbnails';
import {
  getContentType,
  getFileExtension,
  parseFormatOptions,
} from './utils/format';
import { PROGRESS_STRING, stringToProgress } from './utils/progress';
import { PassThrough } from 'stream';
import { downloadFFmpeg, findFFmpegBinary } from './utils/ffmpeg';
import { downloadFile } from './utils/request';
import { downloadYtDlp, findYtdlpBinary } from './utils/ytdlp';

export const BIN_DIR = path.join(__dirname, '..', 'bin');

export class YtDlp {
  private readonly binaryPath: string;
  private readonly ffmpegPath?: string;

  // done
  constructor(opt?: YtDlpOptions) {
    this.binaryPath = opt?.binaryPath || findYtdlpBinary() || '';
    this.ffmpegPath = opt?.ffmpegPath || findFFmpegBinary();

    if (!this.binaryPath || !fs.existsSync(this.binaryPath)) {
      console.error(
        new Error(
          'yt-dlp binary not found. Please install yt-dlp or specify correct binaryPath in options.'
        )
      );
    }

    if (this.ffmpegPath && !fs.existsSync(this.ffmpegPath)) {
      console.error(
        new Error(
          `FFmpeg binary not found at: ${this.ffmpegPath}. Please install FFmpeg or specify correct ffmpegPath.`
        )
      );
    }

    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(this.binaryPath, 0o755);
      } catch (error) {
        console.error(
          new Error(
            `Failed to set executable permissions: ${error instanceof Error ? error.message : 'Unknown error'
            }`
          )
        );
      }
    }
  }

  // done
  public async checkInstallationAsync(options?: {
    ffmpeg?: boolean;
  }): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (options?.ffmpeg && !this.ffmpegPath) {
        return reject(new Error('FFmpeg path is not set'));
      }

      const binaryProcess = spawn(this.binaryPath, ['--version']);

      let binaryExists = false;
      let ffmpegExists = !options?.ffmpeg;

      binaryProcess.on('error', () => (binaryExists = false));
      binaryProcess.on('exit', (code) => {
        binaryExists = code === 0;
        if (options?.ffmpeg) {
          const ffmpegProcess = spawn(this.ffmpegPath!, ['-version']);
          ffmpegProcess.on('error', () => (ffmpegExists = false));
          ffmpegProcess.on('exit', (code) => {
            ffmpegExists = code === 0;
            if (binaryExists && ffmpegExists) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          if (binaryExists) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  // done
  public checkInstallation(options?: { ffmpeg?: boolean }): boolean {
    if (options?.ffmpeg && !this.ffmpegPath) {
      throw new Error('FFmpeg path is not set');
    }

    const binaryResult = spawnSync(this.binaryPath, ['--version'], {
      stdio: 'ignore',
    });
    const ffmpegResult = options?.ffmpeg
      ? spawnSync(this.ffmpegPath!, ['-version'], { stdio: 'ignore' })
      : { status: 0 };
    return binaryResult.status === 0 && ffmpegResult.status === 0;
  }

  // done
  public async execAsync(
    url: string,
    options?: ArgsOptions & {
      onData?: (d: string) => void;
      onProgress?: (p: VideoProgress) => void;
    }
  ) {
    const args = this.buildArgs(url, options || {});
    const onData = (d: string) => {
      options?.onData?.(d);
      if (options?.onProgress) {
        const result = stringToProgress(d);
        if (result) {
          options.onProgress?.(result);
        }
      }
    };
    return this._executeAsync(args, onData);
  }

  // done
  public exec(url: string, options?: ArgsOptions) {
    const args = this.buildArgs(url, options || {}, true);
    return this._execute(args);
  }

  // done
  private _execute(args: string[]) {
    const ytDlpProcess = spawn(this.binaryPath, args);

    ytDlpProcess.stderr.on('data', (chunk) => {
      const str = Buffer.from(chunk).toString();
      const result = stringToProgress(str);
      if (result) {
        ytDlpProcess.emit('progress', result);
      }
    });

    ytDlpProcess.stdout.on('data', (data) => {
      const dataStr = Buffer.from(data).toString();
      const result = stringToProgress(dataStr);
      if (result) {
        ytDlpProcess.emit('progress', result);
      }
    });

    return ytDlpProcess;
  }

  // done
  private async _executeAsync(
    args: string[],
    onData?: (d: string) => void,
    passThrough?: PassThrough
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.binaryPath) reject(new Error('Ytdlp binary not found'));
      const ytDlpProcess = spawn(this.binaryPath, args);

      let stdoutData = '';
      let stderrData = '';

      ytDlpProcess.stdout.on('data', (data) => {
        // in `passThrough` case `data` is video bytes, don't collect it
        if (passThrough) return;
        stdoutData += data.toString();
        onData?.(Buffer.from(data).toString());
      });

      ytDlpProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        onData?.(Buffer.from(data).toString());
      });

      if (passThrough) {
        ytDlpProcess.stdout.pipe(passThrough);
      }

      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
          resolve(stdoutData);
        } else {
          reject(new Error(`yt-dlp exited with code ${code}: ${stderrData}`));
        }
      });

      ytDlpProcess.on('error', (err) => {
        reject(new Error(`Failed to start yt-dlp process: ${err.message}`));
      });
    });
  }

  // done
  private buildArgs(
    url: string,
    opt: ArgsOptions,
    isProgress?: boolean,
    extra?: string[]
  ): string[] {
    const args = createArgs(opt);
    if (this.ffmpegPath) {
      args.push('--ffmpeg-location', this.ffmpegPath);
    }

    if (isProgress) {
      args.push('--progress-template', PROGRESS_STRING);
    }

    if (extra) {
      args.push(...extra);
    }

    return args.concat(url);
  }

  // done
  public download<F extends FormatKeyWord>(
    url: string,
    options?: Omit<FormatOptions<F>, 'onProgress'>
  ) {
    const { format, ...opt } = options || {};
    const args = this.buildArgs(url, opt, true, parseFormatOptions(format));

    return this._execute(args);
  }

  // done
  public async downloadAsync<F extends FormatKeyWord>(
    url: string,
    options?: FormatOptions<F>
  ): Promise<string> {
    const { format, onProgress, ...opt } = options || {};
    const args = this.buildArgs(
      url,
      opt,
      !!onProgress,
      parseFormatOptions(format)
    );

    return this._executeAsync(args, (data) => {
      const progress = stringToProgress(data);
      if (progress) {
        onProgress?.(progress);
      }
    });
  }

  // done
  public stream<F extends FormatKeyWord>(
    url: string,
    options?: FormatOptions<F>
  ): PipeResponse {
    const { format, onProgress, ...opt } = options || {};
    const args = this.buildArgs(url, opt, !!onProgress, [
      ...parseFormatOptions(format),
      '-o',
      '-',
    ]);

    const passThrough = new PassThrough();

    const promise = this._executeAsync(
      args,
      (data) => {
        const progress = stringToProgress(data);
        if (progress) {
          onProgress?.(progress);
        }
      },
      passThrough
    );

    return {
      promise: promise,
      pipe: (destination: NodeJS.WritableStream, options?: { end?: boolean }) =>
        passThrough.pipe(destination, options),
      pipeAsync: (
        destination: NodeJS.WritableStream,
        options?: { end?: boolean }
      ) => {
        return new Promise((resolve, reject) => {
          const pt = passThrough.pipe(destination, options);
          destination.on('finish', () => resolve(pt));
          destination.on('error', reject);
        });
      },
    };
  }

  // done
  public async getInfoAsync<T extends InfoType>(
    url: string,
    options?: InfoOptions
  ): Promise<T extends 'video' ? VideoInfo : PlaylistInfo> {
    const args = [
      '--dump-single-json',
      '--quiet',
      ...createArgs({ flatPlaylist: true, ...options }),
      url,
    ];
    const execResult = await this._executeAsync(args);
    return JSON.parse(execResult);
  }

  // done
  public async getThumbnailsAsync(url: string): Promise<VideoThumbnail[]> {
    const args = [
      '--print',
      'thumbnails_table',
      '--print',
      'playlist:thumbnails_table',
      '--quiet',
      url,
    ];
    const execResult = await this._executeAsync(args);
    return extractThumbnails(execResult);
  }

  // done
  public async getTitleAsync(url: string): Promise<string> {
    const args = ['--print', 'title', url];
    const execResult = await this._executeAsync(args);
    return execResult;
  }

  public async downloadFFmpeg() {
    return downloadFFmpeg();
  }

  public async getFileAsync<F extends FormatKeyWord>(
    url: string,
    options?: GetFileOptions<F> & {
      onProgress?: (p: VideoProgress) => void;
    }
  ): Promise<File> {
    const info = await this.getInfoAsync(url);
    const { format, filename, metadata, onProgress, ...opt } = options || {};

    // PassThrough stream to collect data
    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];

    passThrough.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

    const args = this.buildArgs(url, opt, !!onProgress, [
      ...parseFormatOptions(format),
      '-o',
      '-',
    ]);

    await this._executeAsync(
      args,
      (data) => {
        if (onProgress) {
          const progress = stringToProgress(data);
          if (progress) {
            onProgress(progress);
          }
        }
      },
      passThrough
    );

    const blob = new Blob(chunks, { type: getContentType(format) });

    const defaultMetadata: FileMetadata = {
      name: filename || `${info.title}.${getFileExtension(format)}`,
      type: getContentType(format),
      size: blob.size,
      ...metadata,
    };
    return new File([Buffer.concat(chunks)], defaultMetadata.name, {
      type: defaultMetadata.type,
    });
  }

  public async getUrlsAsync(url: string, options?: ArgsOptions): Promise<string[]> {
    const args = [
      '--print', 'urls',
      ...createArgs({ flatPlaylist: true, ...options }),
      url,
    ];
    const execResult = await this._executeAsync(args);
    return String(execResult).split('\n')
  }
}

export const helpers = {
  downloadFFmpeg,
  findFFmpegBinary,
  PROGRESS_STRING,
  getContentType,
  getFileExtension,
  parseFormatOptions,
  stringToProgress,
  createArgs,
  extractThumbnails,
  downloadFile,
  BIN_DIR,
  downloadYtDlp,
  findYtdlpBinary,
};

export type {
  ArgsOptions,
  FormatOptions,
  VideoInfo,
  VideoProgress,
  VideoThumbnail,
  YtDlpOptions,
  PlaylistInfo,
  QualityOptions,
  TypeOptions,
  VideoFormat,
};
