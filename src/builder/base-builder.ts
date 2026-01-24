/**
 * Base builder class for yt-dlp operations
 * Provides shared fluent API methods for Download and Stream builders
 */

import { EventEmitter } from 'node:events';
import type { ChildProcess } from 'node:child_process';
import type {
  ArgsOptions,
  FormatArgs,
  FormatKeyWord,
  QualityOptions,
  TypeOptions,
} from '../types';
import { buildYtDlpArgs } from '../core/args';
import { parseFormatOptions } from '../utils/format';
import { findYtdlpBinary } from '../utils/ytdlp';
import { findFFmpegBinary } from '../utils/ffmpeg';
import fs from 'node:fs';
import { BIN_DIR } from '../utils/paths';

/**
 * Abstract base builder class with shared fluent API methods.
 * Extended by Download and Stream builders.
 *
 * Note: This class extends EventEmitter without generics to avoid TypeScript
 * compatibility issues. Subclasses should use declaration merging or casting
 * for type-safe event handling.
 */

export abstract class BaseBuilder extends EventEmitter {
  protected binaryPath: string = '';
  protected ffmpegPath?: string;
  protected videoUrl: string = '';
  protected formatValue?: FormatArgs<FormatKeyWord> | string;
  protected extraArgs: ArgsOptions = {};
  protected rawArgs: string[] = [];
  protected process?: ChildProcess;

  constructor(
    url: string,
    options?: { binaryPath?: string; ffmpegPath?: string },
  ) {
    super();
    this.videoUrl = url;
    this.binaryPath = options?.binaryPath || findYtdlpBinary() || '';
    this.ffmpegPath = options?.ffmpegPath || findFFmpegBinary();

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
   * Set the binary path for yt-dlp
   */
  setBinaryPath(path: string): this {
    this.binaryPath = path;
    return this;
  }

  /**
   * Set the FFmpeg binary path
   */
  setFfmpegPath(path: string): this {
    this.ffmpegPath = path;
    return this;
  }

  /**
   * Set the format filter (mergevideo, audioonly, videoonly, audioandvideo)
   */
  format<F extends FormatKeyWord>(format: FormatArgs<F> | string): this {
    this.formatValue = format;
    return this;
  }
  /**
   * Set the format filter (mergevideo, audioonly, videoonly, audioandvideo)
   */
  filter<F extends FormatKeyWord>(filter: F): this {
    const existing =
      typeof this.formatValue === 'object' ? this.formatValue : {};
    this.formatValue = { ...existing, filter };
    return this;
  }
  /**
   * Set the format quality (0-10, 0 is best)
   */
  quality<F extends FormatKeyWord>(quality: QualityOptions[F]): this {
    const existing =
      typeof this.formatValue === 'object' ? this.formatValue : {};
    this.formatValue = {
      filter: this.formatValue,
      ...existing,
      quality,
    } as FormatArgs<F>;
    return this;
  }

  /**
   * Set the format type (audioonly, videoonly, audioandvideo)
   */
  type<F extends FormatKeyWord>(type: TypeOptions[F]): this {
    const existing =
      typeof this.formatValue === 'object' ? this.formatValue : {};
    this.formatValue = {
      filter: this.formatValue,
      ...existing,
      type,
    } as FormatArgs<F>;
    return this;
  }

  options(options: ArgsOptions): this {
    this.extraArgs = { ...this.extraArgs, ...options };
    return this;
  }

  /**
   * Limit download rate (e.g., '1M', '500K')
   */
  rateLimit(rate: string): this {
    this.extraArgs.limitRate = rate;
    return this;
  }

  /**
   * Set cookies string
   */
  cookies(cookies: string): this {
    this.extraArgs.cookies = cookies;
    return this;
  }

  /**
   * Set cookies from browser
   */
  cookiesFromBrowser(browser: string): this {
    this.extraArgs.cookiesFromBrowser = browser;
    return this;
  }

  /**
   * Set proxy URL
   */
  proxy(url: string): this {
    this.extraArgs.proxy = url;
    return this;
  }

  /**
   * Add custom arguments
   */
  addOption(key: keyof ArgsOptions, value: unknown): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.extraArgs as any)[key] = value;
    return this;
  }

  /**
   * Add raw command line arguments
   */
  addArgs(...args: string[]): this {
    this.rawArgs.push(...args);
    return this;
  }

  /**
   * Enable audio extraction
   */
  extractAudio(format?: string): this {
    this.extraArgs.extractAudio = true;
    if (format) {
      this.extraArgs.audioFormat = format;
    }
    return this;
  }

  /**
   * Set audio format for extraction
   */
  audioFormat(format: string): this {
    this.extraArgs.audioFormat = format;
    return this;
  }

  /**
   * Set audio quality (0-10, 0 is best)
   */
  audioQuality(quality: string): this {
    this.extraArgs.audioQuality = quality;
    return this;
  }

  /**
   * Embed thumbnail in the file
   */
  embedThumbnail(): this {
    this.extraArgs.embedThumbnail = true;
    return this;
  }

  /**
   * Embed subtitles in the file
   */
  embedSubs(): this {
    this.extraArgs.embedSubs = true;
    return this;
  }

  /**
   * Embed metadata in the file
   */
  embedMetadata(): this {
    this.extraArgs.embedMetadata = true;
    return this;
  }

  /**
   * Write subtitles to file
   */
  writeSubs(): this {
    this.extraArgs.writeSubs = true;
    return this;
  }

  /**
   * Write auto-generated subtitles
   */
  writeAutoSubs(): this {
    this.extraArgs.writeAutoSubs = true;
    return this;
  }

  /**
   * Set subtitle languages
   */
  subLangs(langs: string[]): this {
    this.extraArgs.subLangs = langs;
    return this;
  }

  /**
   * Write thumbnail to file
   */
  writeThumbnail(): this {
    this.extraArgs.writeThumbnail = true;
    return this;
  }

  /**
   * Set username for authentication
   */
  username(user: string): this {
    this.extraArgs.username = user;
    return this;
  }

  /**
   * Set password for authentication
   */
  password(pass: string): this {
    this.extraArgs.password = pass;
    return this;
  }

  /**
   * Set playlist start index
   */
  playlistStart(index: number): this {
    this.extraArgs.playlistStart = index;
    return this;
  }

  /**
   * Set playlist end index
   */
  playlistEnd(index: number): this {
    this.extraArgs.playlistEnd = index;
    return this;
  }

  /**
   * Set specific playlist items
   */
  playlistItems(items: string): this {
    this.extraArgs.playlistItems = items;
    return this;
  }

  /**
   * Build format-related arguments from current settings
   */
  protected buildFormatArgs(): string[] {
    if (!this.formatValue) {
      return [];
    }
    return parseFormatOptions(this.formatValue);
  }

  /**
   * Build base yt-dlp arguments (common to all operations)
   */
  protected buildBaseArgs(extra: string[] = []): string[] {
    if (!this.videoUrl) {
      throw new Error('URL is required.');
    }

    const formatArgs = this.buildFormatArgs();
    return buildYtDlpArgs({
      url: this.videoUrl,
      options: this.extraArgs,
      ffmpegPath: this.ffmpegPath,
      withProgressTemplate: true,
      extra: [...formatArgs, ...extra, ...this.rawArgs],
    });
  }

  /**
   * Get the full command string (for debugging)
   */
  getCommand(): string {
    const args = this.buildArgs();
    return `${this.binaryPath} ${args.join(' ')}`;
  }

  /**
   * Validates that binary path is set
   */
  protected validateBinaryPath(): void {
    if (!this.binaryPath) {
      throw new Error(
        'Binary path is required. Use .setBinaryPath() or pass it in constructor.',
      );
    }
  }

  /**
   * Kill the running process
   */
  kill(signal?: NodeJS.Signals | number): boolean {
    return this.process?.kill(signal) ?? false;
  }

  /**
   * Get the process ID
   */
  get pid(): number | undefined {
    return this.process?.pid;
  }

  /**
   * Build the command arguments (to be implemented by subclasses)
   */
  protected abstract buildArgs(): string[];
}
