import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ArgsOptions,
  DownloadKeyWord,
  DownloadOptions,
  PipeResponse,
  StreamKeyWord,
  StreamOptions,
  VideoInfo,
  VideoProgress,
  VideoThumbnail,
  YtDlpOptions,
} from './types';
import { createArgs } from './utils/args';
import { extractThumbnails } from './utils/thumbnails';
import { parseDownloadOptions, parseStreamOptions } from './utils/format';
import { PROGRESS_STRING, stringToProgress } from './utils/progress';
import { PassThrough } from 'stream';

export class YtDlp {
  private readonly binaryPath: string;
  private readonly ffmpegPath?: string;

  constructor(opt?: YtDlpOptions) {
    this.binaryPath = opt?.binaryPath || this.getDefaultBinaryPath();
    this.ffmpegPath = opt?.ffmpegPath;

    if (!fs.existsSync(this.binaryPath))
      throw new Error('yt-dlp binary not found');
    fs.chmodSync(this.binaryPath, 0o755);

    if (this.ffmpegPath && !fs.existsSync(this.ffmpegPath)) {
      throw new Error('ffmpeg binary not found');
    }
  }

  private getDefaultBinaryPath(): string {
    return path.join(
      __dirname,
      '..',
      'bin',
      os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
    );
  }

  public async checkInstallation(): Promise<boolean> {
    return new Promise((resolve) => {
      exec(`${this.binaryPath} --version`, (error) => resolve(!error));
    });
  }

  private async execute(
    args: string[],
    onData?: (d: string) => void,
    passThrough?: PassThrough
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const ytDlpProcess = spawn(this.binaryPath, args);

      let stdoutData = '';
      let stderrData = '';

      ytDlpProcess.stdout.on('data', (data) => {
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

  private buildArgs(
    url: string,
    opt: ArgsOptions,
    onProgress?: (p: VideoProgress) => void,
    extra?: string[]
  ): string[] {
    const args = createArgs(opt);
    if (this.ffmpegPath) {
      args.push('--ffmpeg-location', this.ffmpegPath);
    }

    if (onProgress) {
      args.push('--progress-template', PROGRESS_STRING);
    }

    if (extra) {
      args.push(...extra);
    }

    return args.concat(url);
  }

  public async download<F extends DownloadKeyWord>(
    url: string,
    options?: DownloadOptions<F>
  ): Promise<string> {
    const { format, onProgress, ...opt } = options || {};
    const args = this.buildArgs(
      url,
      opt,
      onProgress,
      parseDownloadOptions(format)
    );

    return this.execute(args, (data) => {
      const progress = stringToProgress(data);
      if (progress) {
        onProgress?.(progress);
      }
    });
  }

  public stream<F extends StreamKeyWord>(
    url: string,
    options?: StreamOptions<F>
  ): PipeResponse {
    const { format, onProgress, ...opt } = options || {};
    const args = this.buildArgs(url, opt, onProgress, [
      ...parseStreamOptions(format),
      '-o',
      '-',
    ]);

    const passThrough = new PassThrough();

    this.execute(
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
      pipe: (destination: NodeJS.WritableStream, options?: { end?: boolean }) =>
        passThrough.pipe(destination, options),
      promisePipe: (
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

  public async getInfo(url: string): Promise<VideoInfo> {
    const args = ['--dump-json', '--quiet', url];
    const execResult = await this.execute(args);
    return JSON.parse(execResult) as VideoInfo;
  }

  public async getThumbnails(url: string): Promise<VideoThumbnail[]> {
    const args = ['--list-thumbnails', '--quiet', url];
    const execResult = await this.execute(args);
    return extractThumbnails(execResult);
  }
}
