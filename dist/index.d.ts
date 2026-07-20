import { ArgsOptions, AudioFormat, DownloadResult, FormatKeyWord, FormatOptions, FormatsResult, GetFileOptions, InfoOptions, InfoType, PlaylistInfo, SubtitleInfo, UpdateResult, VideoInfo, VideoQuality, VideoProgress, VideoThumbnail, YtDlpOptions, DownloadedVideoInfo } from './types';
import { createArgs } from './utils/args';
import { extractThumbnails } from './utils/thumbnails';
import { getContentType, getFileExtension, parseFormatOptions } from './utils/format';
import { stringToProgress } from './utils/progress';
import { downloadFFmpeg, findFFmpegBinary } from './utils/ffmpeg';
import { downloadFile } from './utils/request';
import { downloadYtDlp, downloadYtDlpVerified, findYtdlpBinary } from './utils/ytdlp';
import { BIN_DIR } from './utils/paths';
import { Download } from './builder/download-builder';
import { Stream } from './builder/stream-builder';
import { Exec, ExecBuilderResult, ExecPipeResult } from './builder/exec-builder';
export { BIN_DIR };
export { Download, createDownload } from './builder/download-builder';
export type { DownloadBuilderEvents } from './builder/download-builder';
export { Stream, createStream as createStreamBuilder, } from './builder/stream-builder';
export type { StreamBuilderEvents, StreamResult, } from './builder/stream-builder';
export { Exec, createExec } from './builder/exec-builder';
export type { ExecBuilderEvents, ExecBuilderResult, ExecPipeResult, } from './builder/exec-builder';
/**
 * Main YtDlp class - provides a high-level interface for yt-dlp operations.
 *
 * @example
 * ```typescript
 * const ytdlp = new YtDlp();
 * const info = await ytdlp.getInfoAsync('https://youtube.com/watch?v=...');
 * ```
 */
export declare class YtDlp {
    binaryPath: string;
    ffmpegPath?: string;
    /**
     * Creates a new YtDlp instance.
     * @param opt - Configuration options for binary paths
     */
    constructor(opt?: YtDlpOptions);
    /**
     * Asynchronously checks if yt-dlp and optionally FFmpeg are installed.
     * @param options - Check options
     * @returns Promise resolving to true if binaries are available
     */
    checkInstallationAsync(options?: {
        ffmpeg?: boolean;
    }): Promise<boolean>;
    /**
     * Synchronously checks if yt-dlp and optionally FFmpeg are installed.
     * @param options - Check options
     * @returns true if binaries are available
     */
    checkInstallation(options?: {
        ffmpeg?: boolean;
    }): boolean;
    /**
     * Fetches video or playlist info.
     * @param url - Video or playlist URL
     * @param options - Info options
     * @returns Promise resolving to VideoInfo or PlaylistInfo
     */
    getInfoAsync<T extends InfoType>(url: string, options?: InfoOptions): Promise<T extends 'video' ? VideoInfo : PlaylistInfo>;
    /**
     * Executes yt-dlp asynchronously with the provided URL and options.
     * Uses the Exec builder internally for better control and event handling.
     *
     * @param url - Video URL
     * @param options - Execution options with optional callbacks
     * @returns Promise resolving to command output
     */
    execAsync(url: string, options?: ArgsOptions & {
        onData?: (d: string) => void;
        onProgress?: (p: VideoProgress) => void;
        onBeforeDownload?: (p: DownloadedVideoInfo) => void;
        pipeTo?: NodeJS.WritableStream;
    }): Promise<ExecBuilderResult | ExecPipeResult>;
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
    exec(url: string, options?: ArgsOptions): Exec;
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
    download<F extends FormatKeyWord>(url: string, options?: Omit<FormatOptions<F>, 'onProgress' | 'beforeDownload'>): Download;
    /**
     * Downloads a video asynchronously.
     * @param url - Video URL
     * @param options - Download options with progress callback
     * @returns Promise resolving to DownloadResult with file paths
     */
    downloadAsync<F extends FormatKeyWord>(url: string, options?: FormatOptions<F>): Promise<DownloadResult>;
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
    stream<F extends FormatKeyWord>(url: string, options?: Omit<FormatOptions<F>, 'onProgress'>): Stream;
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
    execBuilder<F extends FormatKeyWord>(url: string, options?: Omit<FormatOptions<F>, 'onProgress'>): Exec;
    /**
     * Downloads audio only.
     * @param url - Video URL
     * @param format - Audio format (mp3, wav, flac, etc.)
     * @param options - Additional options
     */
    downloadAudio(url: string, format?: AudioFormat, options?: ArgsOptions): Promise<DownloadResult>;
    /**
     * Downloads video with specific quality.
     * @param url - Video URL
     * @param quality - Video quality (e.g., "1080p", "720p", "best")
     * @param options - Additional options
     */
    downloadVideo(url: string, quality?: VideoQuality, options?: ArgsOptions): Promise<DownloadResult>;
    /**
     * Gets available subtitles.
     * @param url - Video URL
     * @param options - Additional options
     */
    getSubtitles(url: string, options?: ArgsOptions): Promise<SubtitleInfo[]>;
    /**
     * Fetches video comments.
     * @param url - Video URL
     * @param maxComments - Maximum comments to fetch
     * @param options - Additional options
     */
    getComments(url: string, maxComments?: number, options?: ArgsOptions): Promise<unknown[]>;
    /**
     * Gets direct media URLs.
     * @param url - Video URL
     * @param options - Args options
     * @returns Promise resolving to array of URLs
     */
    getDirectUrlsAsync(url: string, options?: ArgsOptions): Promise<string[]>;
    /**
     * Gets formats, preferring JSON with fallback to table parsing.
     * @param url - Video URL
     * @param options - Args options
     * @returns Promise resolving to FormatsResult
     */
    getFormatsAsync(url: string, options?: ArgsOptions): Promise<FormatsResult>;
    /**
     * Fetches video thumbnails.
     * @param url - Video URL
     * @returns Promise resolving to array of VideoThumbnail
     */
    getThumbnailsAsync(url: string): Promise<VideoThumbnail[]>;
    /**
     * Fetches video title.
     * @param url - Video URL
     * @returns Promise resolving to title string
     */
    getTitleAsync(url: string): Promise<string>;
    /**
     * Gets yt-dlp version.
     * @returns Promise resolving to version string
     */
    getVersionAsync(): Promise<string>;
    /**
     * Executes the yt-dlp binary directly with raw command-line arguments.
     *
     * Unlike `execAsync()` / `exec()`, this does NOT go through the fluent
     * builder (no URL is required, no format/progress args are injected).
     * Use it for simple, direct invocations of yt-dlp such as `--version`,
     * `--update`, `--list-extractors`, `--dump-user-agent`, etc., or for any
     * custom argument list you want to run as-is.
     *
     * @param args - Raw arguments to pass to the yt-dlp binary (e.g. `['--version']`)
     * @param options - Optional spawn options (cwd, env, timeoutMs)
     * @returns Promise resolving to stdout/stderr/exitCode/command
     *
     * @example
     * ```typescript
     * const { stdout } = await ytdlp.execYtdlpCmd(['--version']);
     * console.log(stdout.trim());
     *
     * // List all supported extractors
     * const result = await ytdlp.execYtdlpCmd(['--list-extractors']);
     * console.log(result.stdout);
     *
     * // Run any custom command
     * await ytdlp.execYtdlpCmd(['--update-to', 'nightly']);
     * ```
     */
    /**
     * Executes the yt-dlp binary directly with raw command-line arguments.
     *
     * Unlike `execAsync()` / `exec()`, this does NOT go through the fluent
     * builder (no URL is required, no format/progress args are injected).
     * Use it for simple, direct invocations of yt-dlp such as `--version`,
     * `--update`, `--list-extractors`, `--dump-user-agent`, etc., or for any
     * custom argument list you want to run as-is.
     *
     * Accepts either an argv array or a single command string. When a string
     * is given, it is tokenized shell-style (respecting `"..."` / `'...'`
     * quoting so a quoted URL with `&`/spaces stays intact) and executed
     * WITHOUT a shell (`shell: false`), so there's no shell-injection risk.
     *
     * @param command - Raw arguments as an array (`['--version']`) or a
     *   single string (`'--version'`, `'"https://youtu.be/xyz" -F'`)
     * @param options - Optional spawn options (cwd, env, timeoutMs)
     * @returns Promise resolving to stdout/stderr/exitCode/command
     *
     * @example
     * ```typescript
     * // Array form
     * const { stdout } = await ytdlp.execYtdlpCmd(['--version']);
     * console.log(stdout.trim());
     *
     * // String form - equivalent to the array above
     * await ytdlp.execYtdlpCmd('-U');
     * await ytdlp.execYtdlpCmd('"https://youtu.be/xyz" --formats');
     *
     * // Run any custom command
     * await ytdlp.execYtdlpCmd(['--update-to', 'nightly']);
     * ```
     */
    execYtdlpCmd(command: string | string[], options?: {
        cwd?: string;
        env?: NodeJS.ProcessEnv;
        timeoutMs?: number;
    }): Promise<{
        stdout: string;
        stderr: string;
        exitCode: number | null;
        command: string;
    }>;
    /**
     * Tokenizes a shell-like command string into an argv array, respecting
     * single and double quotes (so a quoted URL containing spaces or `&`
     * stays as one argument). Used internally by `execYtdlpCmd()` when a
     * string is passed instead of an array. This does NOT invoke a shell,
     * so shell metacharacters (`|`, `;`, `$(...)`, etc.) are treated as
     * literal characters, not interpreted.
     */
    private static tokenizeCommand;
    /**
     * Downloads FFmpeg binaries.
     * @returns Promise resolving when download is complete
     */
    downloadFFmpeg(): Promise<string | undefined>;
    /**
     * Gets video/audio content as a File object.
     * Downloads the media to memory and returns a File object.
     * @param url - Video URL
     * @param options - File options with progress callback
     * @returns Promise resolving to File object
     */
    getFileAsync<F extends FormatKeyWord>(url: string, options?: GetFileOptions<F> & {
        onProgress?: (p: VideoProgress) => void;
        onBeforeDownload?: (p: DownloadedVideoInfo) => void;
    }): Promise<File>;
    /**
     * Gets media URLs using --print urls.
     * @param url - Video URL
     * @param options - Args options
     * @returns Promise resolving to array of URLs
     */
    getUrlsAsync(url: string, options?: ArgsOptions): Promise<string[]>;
    /**
     * Updates yt-dlp to the latest version.
     * @param options - Update options
     * @returns Promise resolving to UpdateResult
     */
    updateYtDlpAsync(options?: {
        preferBuiltIn?: boolean;
        verifyChecksum?: boolean;
        outDir?: string;
    }): Promise<UpdateResult>;
    /**
     * Gets version using a specific binary path.
     * @param binaryPath - Path to the yt-dlp binary
     * @returns Promise resolving to version string
     */
    private getVersionAsyncUsingBinary;
}
/**
 * Helper utilities exported for advanced usage.
 */
export declare const helpers: {
    downloadFFmpeg: typeof downloadFFmpeg;
    findFFmpegBinary: typeof findFFmpegBinary;
    PROGRESS_STRING: string;
    getContentType: typeof getContentType;
    getFileExtension: typeof getFileExtension;
    parseFormatOptions: typeof parseFormatOptions;
    stringToProgress: typeof stringToProgress;
    createArgs: typeof createArgs;
    extractThumbnails: typeof extractThumbnails;
    downloadFile: typeof downloadFile;
    BIN_DIR: any;
    downloadYtDlp: typeof downloadYtDlp;
    downloadYtDlpVerified: typeof downloadYtDlpVerified;
    findYtdlpBinary: typeof findYtdlpBinary;
};
export type { ArgsOptions, DownloadFinishResult, DownloadResult, DownloadedVideoInfo, FormatOptions, VideoInfo, VideoProgress, VideoThumbnail, YtDlpOptions, PlaylistInfo, QualityOptions, TypeOptions, VideoFormat, FormatTable, FormatsResult, UpdateResult, } from './types';
