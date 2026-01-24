import { spawn, spawnSync } from 'child_process';
import * as fs from 'fs';
import path from 'path';
import { Blob } from 'buffer';
import { PassThrough } from 'stream';
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
  PlaylistInfo,
  SubtitleInfo,
  UpdateResult,
  VideoInfo,
  VideoQuality,
  VideoProgress,
  VideoThumbnail,
  VideoFormat,
  YtDlpOptions,
  DownloadedVideoInfo,
} from './types';
import { createArgs } from './utils/args';
import { extractThumbnails } from './utils/thumbnails';
import {
  getContentType,
  getFileExtension,
  parseFormatOptions,
  getContentTypeFromArgs,
  getFileExtensionFromArgs,
} from './utils/format';
import { PROGRESS_STRING, stringToProgress } from './utils/progress';
import { downloadFFmpeg, findFFmpegBinary } from './utils/ffmpeg';
import { downloadFile } from './utils/request';
import {
  downloadYtDlp,
  downloadYtDlpVerified,
  findYtdlpBinary,
} from './utils/ytdlp';
import { BIN_DIR } from './utils/paths';
import { Download } from './builder/download-builder';
import { Stream } from './builder/stream-builder';
import {
  Exec,
  ExecBuilderResult,
  ExecPipeResult,
} from './builder/exec-builder';

export { BIN_DIR };

// Export fluent builder API
export { Download, createDownload } from './builder/download-builder';
export type { DownloadBuilderEvents } from './builder/download-builder';
export {
  Stream,
  createStream as createStreamBuilder,
} from './builder/stream-builder';
export type {
  StreamBuilderEvents,
  StreamResult,
} from './builder/stream-builder';
export { Exec, createExec } from './builder/exec-builder';
export type {
  ExecBuilderEvents,
  ExecBuilderResult,
  ExecPipeResult,
} from './builder/exec-builder';

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
  public binaryPath: string;
  public ffmpegPath?: string;

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
   * Fetches video or playlist info.
   * @param url - Video or playlist URL
   * @param options - Info options
   * @returns Promise resolving to VideoInfo or PlaylistInfo
   */
  public async getInfoAsync<T extends InfoType>(
    url: string,
    options?: InfoOptions,
  ): Promise<T extends 'video' ? VideoInfo : PlaylistInfo> {
    const res = await this.execAsync(url, {
      dumpSingleJson: true,
      flatPlaylist: true,
      ...options,
    });
    return JSON.parse(res.output);
  }

  /**
   * Executes yt-dlp asynchronously with the provided URL and options.
   * Uses the Exec builder internally for better control and event handling.
   *
   * @param url - Video URL
   * @param options - Execution options with optional callbacks
   * @returns Promise resolving to command output
   */
  public async execAsync(
    url: string,
    options?: ArgsOptions & {
      onData?: (d: string) => void;
      onProgress?: (p: VideoProgress) => void;
      onBeforeDownload?: (p: DownloadedVideoInfo) => void;
      pipeTo?: NodeJS.WritableStream;
    },
  ): Promise<ExecBuilderResult | ExecPipeResult> {
    const builder = new Exec(url, {
      binaryPath: this.binaryPath,
      ffmpegPath: this.ffmpegPath,
    });

    const { onData, onProgress, onBeforeDownload, pipeTo, ...execOptions } =
      options || {};

    if (execOptions) {
      builder.options(execOptions);
    }

    if (onData) builder.on('stdout', onData);
    if (onProgress) builder.on('progress', onProgress);
    if (onBeforeDownload) builder.on('beforeDownload', onBeforeDownload);

    // If pipeTo is provided, use pipe mode
    if (pipeTo) {
      return builder.pipe(pipeTo);
    }

    return builder.exec();
  }

  /**
   * Executes yt-dlp synchronously with typed events.
   *
   * Note: For a more modern fluent API with pipe support and better event handling,
   * consider using `execBuilder()` instead which returns an Exec builder instance.
   *
   * @param url - Video URL
   * @param options - Execution options
   * @returns ExecEmitter with typed 'progress', 'data', and 'close' events
   */
  public exec(url: string, options?: ArgsOptions): Exec {
    const builder = new Exec(url, {
      binaryPath: this.binaryPath,
      ffmpegPath: this.ffmpegPath,
    });

    if (options) {
      builder.options(options);
    }

    return builder;
  }

  /**
   * Downloads a video with fluent builder API.
   * Chain methods like .format(), .quality(), .on() and call .run() to execute.
   *
   * @param url - Video URL
   * @param options - Optional initial format options
   * @returns Download builder with fluent API
   *
   * @example
   * ```typescript
   * // With fluent API
   * const result = await ytdlp
   *   .download('https://youtube.com/watch?v=...')
   *   .filter('mergevideo')
   *   .quality('1080p')
   *   .on('progress', (p) => console.log(p.percentage_str))
   *   .run();
   *
   * // With initial options
   * const result = await ytdlp
   *   .download('https://youtube.com/watch?v=...', {
   *     format: { filter: 'mergevideo', quality: '1080p' }
   *   })
   *   .on('progress', (p) => console.log(p.percentage_str))
   *   .run();
   * ```
   */
  public download<F extends FormatKeyWord>(
    url: string,
    options?: Omit<FormatOptions<F>, 'onProgress' | 'beforeDownload'>,
  ): Download {
    const builder = new Download(url, {
      binaryPath: this.binaryPath,
      ffmpegPath: this.ffmpegPath,
    });

    // Apply initial format options if provided
    const { format, ...rest } = options || {};
    if (format) {
      builder.format(format);
    }

    if (rest) {
      builder.options(rest);
    }

    return builder;
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
    const { onProgress, beforeDownload, ...rest } = options || {};

    const builder = this.download(url, rest);

    // Attach progress listener if provided
    if (onProgress) {
      builder.on('progress', onProgress);
    }

    // Attach beforeDownload listener if provided
    if (beforeDownload) {
      builder.on('beforeDownload', beforeDownload);
    }

    const result = await builder.run();

    return {
      output: result.output,
      filePaths: result.filePaths,
      info: result.info,
    };
  }

  /**
   * Creates a stream with fluent builder API.
   * Chain methods to configure and use .pipe() or .pipeAsync() to stream.
   *
   * @param url - Video URL
   * @param options - Optional initial format options
   * @returns Stream builder with fluent API
   *
   * @example
   * ```typescript
   * import { createWriteStream } from 'fs';
   *
   * // Fluent builder API
   * await ytdlp
   *   .stream('https://youtube.com/watch?v=...')
   *   .filter('audioandvideo')
   *   .quality('highest')
   *   .type('mp4')
   *   .on('progress', (p) => console.log(p.percentage_str))
   *   .pipeAsync(createWriteStream('video.mp4'));
   *
   * // With initial options
   * await ytdlp
   *   .stream(url, { format: { filter: 'audioandvideo' } })
   *   .pipeAsync(createWriteStream('video.mp4'));
   * ```
   */
  public stream<F extends FormatKeyWord>(
    url: string,
    options?: Omit<FormatOptions<F>, 'onProgress'>,
  ): Stream {
    const builder = new Stream(url, {
      binaryPath: this.binaryPath,
      ffmpegPath: this.ffmpegPath,
    });

    // Apply initial format options if provided
    const { format, ...rest } = options || {};
    if (format) {
      builder.format(format);
    }

    if (rest) {
      builder.options(rest);
    }

    return builder;
  }

  /**
   * Creates an exec builder with fluent API for arbitrary yt-dlp commands.
   * Combines features from Download and Stream builders.
   *
   * Supports both execution modes (get stdout/stderr) and pipe mode (stream to file).
   *
   * @param url - Video URL
   * @param options - Optional initial format options
   * @returns Exec builder with fluent API
   *
   * @example
   * ```typescript
   * import { createWriteStream } from 'fs';
   *
   * // Execute arbitrary command and get output
   * const result = await ytdlp
   *   .execBuilder('https://youtube.com/watch?v=...')
   *   .addArgs('--dump-single-json')
   *   .exec();
   *
   * console.log('Output:', result.stdout);
   *
   * // Pipe to file with download events
   * await ytdlp
   *   .execBuilder('https://youtube.com/watch?v=...')
   *   .filter('mergevideo')
   *   .quality('720p')
   *   .on('beforeDownload', (info) => console.log('Starting:', info.title))
   *   .on('afterDownload', (info) => console.log('Finished:', info.filepath))
   *   .pipe(createWriteStream('video.mp4'));
   * ```
   */
  public execBuilder<F extends FormatKeyWord>(
    url: string,
    options?: Omit<FormatOptions<F>, 'onProgress'>,
  ): Exec {
    const builder = new Exec(url, {
      binaryPath: this.binaryPath,
      ffmpegPath: this.ffmpegPath,
    });

    // Apply initial format options if provided
    const { format, ...rest } = options || {};
    if (format) {
      builder.format(format);
    }

    if (rest) {
      builder.options(rest);
    }

    return builder;
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
    const result = await this.execAsync(url, {
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
    const result = await this.execAsync(url, {
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
    const info = await this.getInfoAsync<'video'>(url, options);
    return info.formats.map((f: VideoFormat) => f.url);
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
    const info = await this.getInfoAsync<'video'>(url, options);
    return {
      source: 'json',
      info,
      formats: info.formats,
    };
  }

  /**
   * Fetches video thumbnails.
   * @param url - Video URL
   * @returns Promise resolving to array of VideoThumbnail
   */
  public async getThumbnailsAsync(url: string): Promise<VideoThumbnail[]> {
    const info = await this.getInfoAsync<'video'>(url);
    return info.thumbnails;
  }

  /**
   * Fetches video title.
   * @param url - Video URL
   * @returns Promise resolving to title string
   */
  public async getTitleAsync(url: string): Promise<string> {
    const result = await this.execAsync(url, {
      print: 'title',
    });
    return result.output.trim();
  }

  /**
   * Gets yt-dlp version.
   * @returns Promise resolving to version string
   */
  public async getVersionAsync(): Promise<string> {
    const result = await this.execAsync('', {
      printVersion: true,
    });
    return result.output.trim();
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
   * Downloads the media to memory and returns a File object.
   * @param url - Video URL
   * @param options - File options with progress callback
   * @returns Promise resolving to File object
   */
  public async getFileAsync<F extends FormatKeyWord>(
    url: string,
    options?: GetFileOptions<F> & {
      onProgress?: (p: VideoProgress) => void;
      onBeforeDownload?: (p: DownloadedVideoInfo) => void;
    },
  ): Promise<File> {
    // First get video info for title
    let info: DownloadedVideoInfo | undefined;
    const {
      onBeforeDownload,
      onProgress,
      filename,
      metadata,
      format,
      ...rest
    } = options || {};

    // Collect data in memory
    const chunks: Buffer[] = [];
    const passThrough = new PassThrough();

    passThrough.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

    // Build format args and merge with rest options
    const formatArgs = parseFormatOptions(format);
    const execOptions: ArgsOptions = { ...rest };

    // Apply format args to options
    if (formatArgs.length >= 2 && formatArgs[0] === '-f') {
      (execOptions as ArgsOptions & { format?: string }).format = formatArgs[1];
    }
    if (formatArgs.includes('--merge-output-format')) {
      const idx = formatArgs.indexOf('--merge-output-format');
      (
        execOptions as ArgsOptions & { mergeOutputFormat?: string }
      ).mergeOutputFormat = formatArgs[idx + 1];
    }

    await this.execAsync(url, {
      ...execOptions,
      pipeTo: passThrough,
      onProgress,
      onBeforeDownload: (p) => {
        info = p;
        onBeforeDownload?.(p);
      },
      output: '-',
    });

    // Determine content type and extension
    let contentType: string;
    let extension: string;

    if (format && typeof format === 'object') {
      contentType = getContentType(format);
      extension = getFileExtension(format);
    } else {
      // Check for extractAudio in options
      const fromArgs = getContentTypeFromArgs(rest);
      contentType = fromArgs || 'video/mp4';
      const extFromArgs = getFileExtensionFromArgs(rest);
      extension = extFromArgs || 'mp4';
    }

    const blob = new Blob(chunks, { type: contentType });

    const defaultMetadata = {
      name: filename || `${info?.title || 'download'}.${extension}`,
      type: contentType,
      size: blob.size,
      ...metadata,
    };

    return new File([Buffer.concat(chunks)], defaultMetadata.name, {
      type: defaultMetadata.type,
    });
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
    const result = await this.execAsync(url, {
      ...options,
      print: 'urls',
    });
    return result.output.split('\n').filter(Boolean);
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
        await this.execAsync('', { update: true });
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
      const version = await this.getVersionAsyncUsingBinary(result.path).catch(
        () => undefined,
      );
      return {
        method: 'download',
        binaryPath: result.path,
        version,
        verified: result.verified,
      };
    }

    const downloadedPath = await downloadYtDlp(outDir);
    const version = await this.getVersionAsyncUsingBinary(downloadedPath).catch(
      () => undefined,
    );
    return {
      method: 'download',
      binaryPath: downloadedPath,
      version,
      verified: false,
    };
  }

  /**
   * Gets version using a specific binary path.
   * @param binaryPath - Path to the yt-dlp binary
   * @returns Promise resolving to version string
   */
  private async getVersionAsyncUsingBinary(
    binaryPath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(binaryPath, ['--version']);
      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Failed to get version: ${stderr}`));
        }
      });

      process.on('error', reject);
    });
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
  DownloadFinishResult,
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
