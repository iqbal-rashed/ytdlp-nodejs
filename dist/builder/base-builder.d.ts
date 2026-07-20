/**
 * Base builder class for yt-dlp operations
 * Provides shared fluent API methods for Download and Stream builders
 */
import { EventEmitter } from 'node:events';
import type { ChildProcess } from 'node:child_process';
import type { ArgsOptions, FormatArgs, FormatKeyWord, QualityOptions, TypeOptions } from '../types';
/**
 * Abstract base builder class with shared fluent API methods.
 * Extended by Download and Stream builders.
 *
 * Note: This class extends EventEmitter without generics to avoid TypeScript
 * compatibility issues. Subclasses should use declaration merging or casting
 * for type-safe event handling.
 */
export declare abstract class BaseBuilder extends EventEmitter {
    protected binaryPath: string;
    protected ffmpegPath?: string;
    protected videoUrl: string;
    protected formatValue?: FormatArgs<FormatKeyWord> | string;
    protected extraArgs: ArgsOptions;
    protected rawArgs: string[];
    protected process?: ChildProcess;
    constructor(url: string, options?: {
        binaryPath?: string;
        ffmpegPath?: string;
    });
    /**
     * Set the binary path for yt-dlp
     */
    setBinaryPath(path: string): this;
    /**
     * Set the FFmpeg binary path
     */
    setFfmpegPath(path: string): this;
    /**
     * Set the format filter (mergevideo, audioonly, videoonly, audioandvideo)
     */
    format<F extends FormatKeyWord>(format: FormatArgs<F> | string): this;
    /**
     * Set the format filter (mergevideo, audioonly, videoonly, audioandvideo)
     */
    filter<F extends FormatKeyWord>(filter: F): this;
    /**
     * Set the format quality (0-10, 0 is best)
     */
    quality<F extends FormatKeyWord>(quality: QualityOptions[F]): this;
    /**
     * Set the format type (audioonly, videoonly, audioandvideo)
     */
    type<F extends FormatKeyWord>(type: TypeOptions[F]): this;
    options(options: ArgsOptions): this;
    /**
     * Limit download rate (e.g., '1M', '500K')
     */
    rateLimit(rate: string): this;
    /**
     * Set cookies string
     */
    cookies(cookies: string): this;
    /**
     * Set cookies from browser
     */
    cookiesFromBrowser(browser: string): this;
    /**
     * Set proxy URL
     */
    proxy(url: string): this;
    /**
     * Add custom arguments
     */
    addOption(key: keyof ArgsOptions, value: unknown): this;
    /**
     * Add raw command line arguments
     */
    addArgs(...args: string[]): this;
    /**
     * Enable audio extraction
     */
    extractAudio(format?: string): this;
    /**
     * Set audio format for extraction
     */
    audioFormat(format: string): this;
    /**
     * Set audio quality (0-10, 0 is best)
     */
    audioQuality(quality: string): this;
    /**
     * Embed thumbnail in the file
     */
    embedThumbnail(): this;
    /**
     * Embed subtitles in the file
     */
    embedSubs(): this;
    /**
     * Embed metadata in the file
     */
    embedMetadata(): this;
    /**
     * Write subtitles to file
     */
    writeSubs(): this;
    /**
     * Write auto-generated subtitles
     */
    writeAutoSubs(): this;
    /**
     * Set subtitle languages
     */
    subLangs(langs: string[]): this;
    /**
     * Write thumbnail to file
     */
    writeThumbnail(): this;
    /**
     * Set username for authentication
     */
    username(user: string): this;
    /**
     * Set password for authentication
     */
    password(pass: string): this;
    /**
     * Set playlist start index
     */
    playlistStart(index: number): this;
    /**
     * Set playlist end index
     */
    playlistEnd(index: number): this;
    /**
     * Set specific playlist items
     */
    playlistItems(items: string): this;
    /**
     * Build format-related arguments from current settings
     */
    protected buildFormatArgs(): string[];
    /**
     * Build base yt-dlp arguments (common to all operations)
     * @param extra - Extra arguments to append
     * @param requireUrl - Whether a URL is required for this operation (default: true).
     *   Subclasses that also support URL-less operations (e.g. `--version`, `--update`)
     *   should pass `false` to skip the validation.
     */
    protected buildBaseArgs(extra?: string[], requireUrl?: boolean): string[];
    /**
     * Enable debug printing of the command line before execution
     */
    debugPrint(enable?: boolean): this;
    /**
     * Get the full command string (for debugging)
     */
    getCommand(): string;
    /**
     * Print the command line to stderr if debugPrintCommandLine is enabled
     * Should be called before spawning the process
     */
    protected printDebugCommandLine(args: string[]): void;
    /**
     * Validates that binary path is set
     */
    protected validateBinaryPath(): void;
    /**
     * Kill the running process
     */
    kill(signal?: NodeJS.Signals | number): boolean;
    /**
     * Get the process ID
     */
    get pid(): number | undefined;
    /**
     * Build the command arguments (to be implemented by subclasses)
     */
    protected abstract buildArgs(): string[];
}
