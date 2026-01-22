import { spawn, spawnSync } from 'child_process';
import type { ChildProcess } from 'child_process';
import * as fs from 'fs';
import path from 'path';
import {
  ArgsOptions,
  AudioFormat,
  DownloadResult,
  FormatKeyWord,
  FormatOptions,
  FormatsResult,
  GetFileOptions,
  InfoOptions,
  InfoType,
  PipeResponse,
  PlaylistInfo,
  SubtitleInfo,
  UpdateResult,
  VideoInfo,
  VideoQuality,
  VideoProgress,
  VideoThumbnail,
  YtDlpOptions,
} from './types';
import { createArgs } from './utils/args';
import { extractThumbnails } from './utils/thumbnails';
import {
  getContentType,
  getFileExtension,
  parseFormatOptions,
} from './utils/format';
import { PROGRESS_STRING, stringToProgress } from './utils/progress';
import { downloadFFmpeg, findFFmpegBinary } from './utils/ffmpeg';
import { downloadFile } from './utils/request';
import {
  downloadYtDlp,
  downloadYtDlpVerified,
  findYtdlpBinary,
} from './utils/ytdlp';
import { buildYtDlpArgs } from './core/args';
import { runYtDlp, spawnYtDlp } from './core/runner';
import { BIN_DIR } from './configs/paths';

// Import refactored operations
import {
  DownloadContext,
  downloadSync,
  downloadAsync as downloadAsyncOp,
} from './operations/download';
import {
  StreamContext,
  createStream,
  getFileAsync as getFileAsyncOp,
} from './operations/stream';
import {
  InfoContext,
  getInfoAsync as getInfoAsyncOp,
  getDirectUrlsAsync as getDirectUrlsAsyncOp,
  getFormatsAsync as getFormatsAsyncOp,
  getThumbnailsAsync as getThumbnailsAsyncOp,
  getTitleAsync as getTitleAsyncOp,
  getVersionAsync as getVersionAsyncOp,
  getUrlsAsync as getUrlsAsyncOp,
} from './operations/info';

export { BIN_DIR };

/**
 * Main YtDlp class - provides a high-level interface for yt-dlp operations.
 *
 * @example
 * ```typescript
 * const ytdlp = new YtDlp();
 * const info = await ytdlp.getInfoAsync('https://youtube.com/watch?v=...');
 * ```
 */
export class YtDlp {
  private readonly binaryPath: string;
  private readonly ffmpegPath?: string;

  /**
   * Creates a new YtDlp instance.
   * @param opt - Configuration options for binary paths
   */
  constructor(opt?: YtDlpOptions) {
    this.binaryPath = opt?.binaryPath || findYtdlpBinary() || '';
    this.ffmpegPath = opt?.ffmpegPath || findFFmpegBinary();

    if (!this.binaryPath || !fs.existsSync(this.binaryPath)) {
      console.error(
        new Error(
          'yt-dlp binary not found. Please install yt-dlp or specify correct binaryPath in options.',
        ),
      );
    }

    if (this.ffmpegPath && !fs.existsSync(this.ffmpegPath)) {
      console.error(
        new Error(
          `FFmpeg binary not found at: ${this.ffmpegPath}. Please install FFmpeg or specify correct ffmpegPath.`,
        ),
      );
    }

    // Only chmod binaries we downloaded (in our bin directory), not system binaries (issue #58)
    if (
      process.platform !== 'win32' &&
      this.binaryPath &&
      this.binaryPath.startsWith(BIN_DIR)
    ) {
      try {
        fs.chmodSync(this.binaryPath, 0o755);
      } catch {
        // Silently ignore - binary may already have correct permissions
      }
    }
  }

  /** Gets the context for download operations. */
  private getDownloadContext(): DownloadContext {
    return { binaryPath: this.binaryPath, ffmpegPath: this.ffmpegPath };
  }

  /** Gets the context for stream operations. */
  private getStreamContext(): StreamContext {
    return { binaryPath: this.binaryPath, ffmpegPath: this.ffmpegPath };
  }

  /** Gets the context for info operations. */
  private getInfoContext(): InfoContext {
    return { binaryPath: this.binaryPath };
  }

  /**
   * Asynchronously checks if yt-dlp and optionally FFmpeg are installed.
   * @param options - Check options
   * @returns Promise resolving to true if binaries are available
   */
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
            resolve(binaryExists && ffmpegExists);
          });
        } else {
          resolve(binaryExists);
        }
      });
    });
  }

  /**
   * Synchronously checks if yt-dlp and optionally FFmpeg are installed.
   * @param options - Check options
   * @returns true if binaries are available
   */
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

  /**
   * Executes yt-dlp asynchronously with the provided URL and options.
   * @param url - Video URL
   * @param options - Execution options with optional callbacks
   * @returns Promise resolving to command output
   */
  public async execAsync(
    url: string,
    options?: ArgsOptions & {
      onData?: (d: string) => void;
      onProgress?: (p: VideoProgress) => void;
    },
  ): Promise<string> {
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

  /**
   * Executes yt-dlp synchronously.
   * @param url - Video URL
   * @param options - Execution options
   * @returns Spawned child process
   */
  public exec(url: string, options?: ArgsOptions): ChildProcess {
    const args = this.buildArgs(url, options || {}, true);
    return this._execute(args);
  }

  private _execute(args: string[]): ChildProcess {
    return spawnYtDlp(this.binaryPath, args);
  }

  private async _executeAsync(
    args: string[],
    onData?: (d: string) => void,
  ): Promise<string> {
    if (!this.binaryPath) throw new Error('Ytdlp binary not found');

    const result = await runYtDlp(this.binaryPath, args, {
      onStdout: onData,
      onStderr: onData,
    });
    return result.stdout;
  }

  private buildArgs(
    url: string,
    opt: ArgsOptions,
    isProgress?: boolean,
    extra?: string[],
  ): string[] {
    return buildYtDlpArgs({
      url,
      options: opt,
      ffmpegPath: this.ffmpegPath,
      withProgressTemplate: isProgress,
      extra,
    });
  }

  /**
   * Downloads a video synchronously.
   * @param url - Video URL
   * @param options - Download options
   * @returns Spawned child process with 'progress' event
   */
  public download<F extends FormatKeyWord>(
    url: string,
    options?: Omit<FormatOptions<F>, 'onProgress'>,
  ): ChildProcess {
    return downloadSync(this.getDownloadContext(), url, options);
  }

  /**
   * Downloads a video asynchronously.
   * @param url - Video URL
   * @param options - Download options with progress callback
   * @returns Promise resolving to DownloadResult with file paths
   */
  public async downloadAsync<F extends FormatKeyWord>(
    url: string,
    options?: FormatOptions<F>,
  ): Promise<DownloadResult> {
    return downloadAsyncOp(this.getDownloadContext(), url, options);
  }

  /**
   * Creates a stream for video download.
   * @param url - Video URL
   * @param options - Stream options
   * @returns PipeResponse with pipe and pipeAsync methods
   */
  public stream<F extends FormatKeyWord>(
    url: string,
    options?: FormatOptions<F>,
  ): PipeResponse {
    return createStream(this.getStreamContext(), url, options);
  }

  /**
   * Fetches video or playlist info.
   * @param url - Video or playlist URL
   * @param options - Info options
   * @returns Promise resolving to VideoInfo or PlaylistInfo
   */
  public async getInfoAsync<T extends InfoType>(
    url: string,
    options?: InfoOptions,
  ): Promise<T extends 'video' ? VideoInfo : PlaylistInfo> {
    return getInfoAsyncOp<T>(this.getInfoContext(), url, options);
  }

  /**
   * Downloads audio only.
   * @param url - Video URL
   * @param format - Audio format (mp3, wav, flac, etc.)
   * @param options - Additional options
   */
  public async downloadAudio(
    url: string,
    format: AudioFormat = 'mp3',
    options?: ArgsOptions,
  ): Promise<DownloadResult> {
    const validFormats: AudioFormat[] = [
      'aac',
      'flac',
      'mp3',
      'm4a',
      'opus',
      'vorbis',
      'wav',
      'alac',
    ];
    if (!validFormats.includes(format)) {
      throw new Error(
        `Invalid audio format: ${format}. Supported: ${validFormats.join(', ')}`,
      );
    }

    return this.downloadAsync(url, {
      ...options,
      extractAudio: true,
      audioFormat: format,
    });
  }

  /**
   * Downloads video with specific quality.
   * @param url - Video URL
   * @param quality - Video quality (e.g., "1080p", "720p", "best")
   * @param options - Additional options
   */
  public async downloadVideo(
    url: string,
    quality: VideoQuality = 'best',
    options?: ArgsOptions,
  ): Promise<DownloadResult> {
    const validQualities: VideoQuality[] = [
      'best',
      '2160p',
      '1440p',
      '1080p',
      '720p',
      '480p',
      '360p',
      '240p',
      '144p',
      'highest',
      'lowest',
    ];

    if (!validQualities.includes(quality)) {
      throw new Error(
        `Invalid video quality: ${quality}. Supported: ${validQualities.join(', ')}`,
      );
    }

    const format =
      quality === 'best'
        ? 'bestvideo+bestaudio/best'
        : `bestvideo[height<=${parseInt(quality) || 1080}]+bestaudio/best[height<=${parseInt(quality) || 1080}]`;

    return this.downloadAsync(url, {
      ...options,
      format,
    });
  }

  /**
   * Gets available subtitles.
   * @param url - Video URL
   * @param options - Additional options
   */
  public async getSubtitles(
    url: string,
    options?: ArgsOptions,
  ): Promise<SubtitleInfo[]> {
    const result = await this.downloadAsync(url, {
      ...options,
      listSubs: true,
      skipDownload: true,
    });

    if (!result.output) return [];

    // Parse output for subtitles - this is a simplified parser
    // Real implementation would need robust parsing of list-subs output
    return [];
  }

  /**
   * Fetches video comments.
   * @param url - Video URL
   * @param maxComments - Maximum comments to fetch
   * @param options - Additional options
   */
  public async getComments(
    url: string,
    maxComments: number = 20,
    options?: ArgsOptions,
  ): Promise<unknown[]> {
    const result = await this.downloadAsync(url, {
      ...options,
      writeComments: true,
      dumpSingleJson: true,
      skipDownload: true,
      extractorArgs: {
        youtube: [`max_comments=${maxComments}`, 'player_skip=webpage'],
      },
    });

    // Output depends on whether dumpSingleJson returns valid JSON string
    try {
      const data = JSON.parse(result.output);
      return data.comments || [];
    } catch {
      return [];
    }
  }

  /**
   * Gets direct media URLs.
   * @param url - Video URL
   * @param options - Args options
   * @returns Promise resolving to array of URLs
   */
  public async getDirectUrlsAsync(
    url: string,
    options?: ArgsOptions,
  ): Promise<string[]> {
    return getDirectUrlsAsyncOp(this.getInfoContext(), url, options);
  }

  /**
   * Gets formats, preferring JSON with fallback to table parsing.
   * @param url - Video URL
   * @param options - Args options
   * @returns Promise resolving to FormatsResult
   */
  public async getFormatsAsync(
    url: string,
    options?: ArgsOptions,
  ): Promise<FormatsResult> {
    return getFormatsAsyncOp(this.getInfoContext(), url, options);
  }

  /**
   * Fetches video thumbnails.
   * @param url - Video URL
   * @returns Promise resolving to array of VideoThumbnail
   */
  public async getThumbnailsAsync(url: string): Promise<VideoThumbnail[]> {
    return getThumbnailsAsyncOp(this.getInfoContext(), url);
  }

  /**
   * Fetches video title.
   * @param url - Video URL
   * @returns Promise resolving to title string
   */
  public async getTitleAsync(url: string): Promise<string> {
    return getTitleAsyncOp(this.getInfoContext(), url);
  }

  /**
   * Gets yt-dlp version.
   * @returns Promise resolving to version string
   */
  public async getVersionAsync(): Promise<string> {
    return getVersionAsyncOp(this.getInfoContext());
  }

  /**
   * Downloads FFmpeg binaries.
   * @returns Promise resolving when download is complete
   */
  public async downloadFFmpeg(): Promise<string | undefined> {
    return downloadFFmpeg();
  }

  /**
   * Gets video/audio content as a File object.
   * Optimized: Uses --print before_dl:%(title)s.%(ext)s to capture
   * filename during download - no separate info fetch required.
   * @param url - Video URL
   * @param options - File options with progress callback
   * @returns Promise resolving to File object
   */
  public async getFileAsync<F extends FormatKeyWord>(
    url: string,
    options?: GetFileOptions<F> & {
      onProgress?: (p: VideoProgress) => void;
    },
  ): Promise<File> {
    return getFileAsyncOp(this.getStreamContext(), url, options);
  }

  /**
   * Gets media URLs using --print urls.
   * @param url - Video URL
   * @param options - Args options
   * @returns Promise resolving to array of URLs
   */
  public async getUrlsAsync(
    url: string,
    options?: ArgsOptions,
  ): Promise<string[]> {
    return getUrlsAsyncOp(this.getInfoContext(), url, options);
  }

  /**
   * Updates yt-dlp to the latest version.
   * @param options - Update options
   * @returns Promise resolving to UpdateResult
   */
  public async updateYtDlpAsync(options?: {
    preferBuiltIn?: boolean;
    verifyChecksum?: boolean;
    outDir?: string;
  }): Promise<UpdateResult> {
    const preferBuiltIn = options?.preferBuiltIn !== false;

    if (preferBuiltIn && this.binaryPath) {
      try {
        await runYtDlp(this.binaryPath, ['--update']);
        const version = await this.getVersionAsync().catch(() => undefined);
        return {
          method: 'built-in',
          binaryPath: this.binaryPath,
          version,
        };
      } catch {
        // Fall back to a manual download.
      }
    }

    const outDir =
      options?.outDir ||
      (this.binaryPath ? path.dirname(this.binaryPath) : undefined);
    const verifyChecksum = options?.verifyChecksum !== false;

    if (verifyChecksum) {
      const result = await downloadYtDlpVerified(outDir);
      const version = await runYtDlp(result.path, ['--version'])
        .then((res) => res.stdout.trim())
        .catch(() => undefined);
      return {
        method: 'download',
        binaryPath: result.path,
        version,
        verified: result.verified,
      };
    }

    const downloadedPath = await downloadYtDlp(outDir);
    const version = await runYtDlp(downloadedPath, ['--version'])
      .then((res) => res.stdout.trim())
      .catch(() => undefined);
    return {
      method: 'download',
      binaryPath: downloadedPath,
      version,
      verified: false,
    };
  }
}

/**
 * Helper utilities exported for advanced usage.
 */
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
  downloadYtDlpVerified,
  findYtdlpBinary,
};

// Re-export types for consumers
export type {
  ArgsOptions,
  DownloadResult,
  DownloadedVideoInfo,
  FormatOptions,
  VideoInfo,
  VideoProgress,
  VideoThumbnail,
  YtDlpOptions,
  PlaylistInfo,
  QualityOptions,
  TypeOptions,
  VideoFormat,
  FormatTable,
  FormatsResult,
  UpdateResult,
} from './types';
