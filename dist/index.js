"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpers = exports.YtDlp = exports.createExec = exports.Exec = exports.createStreamBuilder = exports.Stream = exports.createDownload = exports.Download = exports.BIN_DIR = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const buffer_1 = require("buffer");
const stream_1 = require("stream");
const args_1 = require("./utils/args");
const thumbnails_1 = require("./utils/thumbnails");
const format_1 = require("./utils/format");
const progress_1 = require("./utils/progress");
const ffmpeg_1 = require("./utils/ffmpeg");
const request_1 = require("./utils/request");
const ytdlp_1 = require("./utils/ytdlp");
const paths_1 = require("./utils/paths");
Object.defineProperty(exports, "BIN_DIR", { enumerable: true, get: function () { return paths_1.BIN_DIR; } });
const download_builder_1 = require("./builder/download-builder");
const stream_builder_1 = require("./builder/stream-builder");
const exec_builder_1 = require("./builder/exec-builder");
// Export fluent builder API
var download_builder_2 = require("./builder/download-builder");
Object.defineProperty(exports, "Download", { enumerable: true, get: function () { return download_builder_2.Download; } });
Object.defineProperty(exports, "createDownload", { enumerable: true, get: function () { return download_builder_2.createDownload; } });
var stream_builder_2 = require("./builder/stream-builder");
Object.defineProperty(exports, "Stream", { enumerable: true, get: function () { return stream_builder_2.Stream; } });
Object.defineProperty(exports, "createStreamBuilder", { enumerable: true, get: function () { return stream_builder_2.createStream; } });
var exec_builder_2 = require("./builder/exec-builder");
Object.defineProperty(exports, "Exec", { enumerable: true, get: function () { return exec_builder_2.Exec; } });
Object.defineProperty(exports, "createExec", { enumerable: true, get: function () { return exec_builder_2.createExec; } });
/**
 * Main YtDlp class - provides a high-level interface for yt-dlp operations.
 *
 * @example
 * ```typescript
 * const ytdlp = new YtDlp();
 * const info = await ytdlp.getInfoAsync('https://youtube.com/watch?v=...');
 * ```
 */
class YtDlp {
    /**
     * Creates a new YtDlp instance.
     * @param opt - Configuration options for binary paths
     */
    constructor(opt) {
        this.binaryPath = opt?.binaryPath || (0, ytdlp_1.findYtdlpBinary)() || '';
        this.ffmpegPath = opt?.ffmpegPath || (0, ffmpeg_1.findFFmpegBinary)();
        if (!this.binaryPath || !fs.existsSync(this.binaryPath)) {
            console.error(new Error('yt-dlp binary not found. Please install yt-dlp or specify correct binaryPath in options.'));
        }
        if (this.ffmpegPath && !fs.existsSync(this.ffmpegPath)) {
            console.error(new Error(`FFmpeg binary not found at: ${this.ffmpegPath}. Please install FFmpeg or specify correct ffmpegPath.`));
        }
    }
    /**
     * Asynchronously checks if yt-dlp and optionally FFmpeg are installed.
     * @param options - Check options
     * @returns Promise resolving to true if binaries are available
     */
    async checkInstallationAsync(options) {
        return new Promise((resolve, reject) => {
            if (options?.ffmpeg && !this.ffmpegPath) {
                return reject(new Error('FFmpeg path is not set'));
            }
            const binaryProcess = (0, child_process_1.spawn)(this.binaryPath, ['--version']);
            let binaryExists = false;
            let ffmpegExists = !options?.ffmpeg;
            binaryProcess.on('error', () => (binaryExists = false));
            binaryProcess.on('exit', (code) => {
                binaryExists = code === 0;
                if (options?.ffmpeg) {
                    const ffmpegProcess = (0, child_process_1.spawn)(this.ffmpegPath, ['-version']);
                    ffmpegProcess.on('error', () => (ffmpegExists = false));
                    ffmpegProcess.on('exit', (code) => {
                        ffmpegExists = code === 0;
                        resolve(binaryExists && ffmpegExists);
                    });
                }
                else {
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
    checkInstallation(options) {
        if (options?.ffmpeg && !this.ffmpegPath) {
            throw new Error('FFmpeg path is not set');
        }
        const binaryResult = (0, child_process_1.spawnSync)(this.binaryPath, ['--version'], {
            stdio: 'ignore',
        });
        const ffmpegResult = options?.ffmpeg
            ? (0, child_process_1.spawnSync)(this.ffmpegPath, ['-version'], { stdio: 'ignore' })
            : { status: 0 };
        return binaryResult.status === 0 && ffmpegResult.status === 0;
    }
    /**
     * Fetches video or playlist info.
     * @param url - Video or playlist URL
     * @param options - Info options
     * @returns Promise resolving to VideoInfo or PlaylistInfo
     */
    async getInfoAsync(url, options) {
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
    async execAsync(url, options) {
        const builder = new exec_builder_1.Exec(url, {
            binaryPath: this.binaryPath,
            ffmpegPath: this.ffmpegPath,
        });
        const { onData, onProgress, onBeforeDownload, pipeTo, ...execOptions } = options || {};
        if (execOptions) {
            builder.options(execOptions);
        }
        if (onData)
            builder.on('stdout', onData);
        if (onProgress)
            builder.on('progress', onProgress);
        if (onBeforeDownload)
            builder.on('beforeDownload', onBeforeDownload);
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
    exec(url, options) {
        const builder = new exec_builder_1.Exec(url, {
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
    download(url, options) {
        const builder = new download_builder_1.Download(url, {
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
    async downloadAsync(url, options) {
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
    stream(url, options) {
        const builder = new stream_builder_1.Stream(url, {
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
    execBuilder(url, options) {
        const builder = new exec_builder_1.Exec(url, {
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
    async downloadAudio(url, format = 'mp3', options) {
        const validFormats = [
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
            throw new Error(`Invalid audio format: ${format}. Supported: ${validFormats.join(', ')}`);
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
    async downloadVideo(url, quality = 'best', options) {
        const validQualities = [
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
            throw new Error(`Invalid video quality: ${quality}. Supported: ${validQualities.join(', ')}`);
        }
        const format = quality === 'best'
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
    async getSubtitles(url, options) {
        const result = await this.execAsync(url, {
            ...options,
            listSubs: true,
            skipDownload: true,
        });
        if (!result.output)
            return [];
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
    async getComments(url, maxComments = 20, options) {
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
        }
        catch {
            return [];
        }
    }
    /**
     * Gets direct media URLs.
     * @param url - Video URL
     * @param options - Args options
     * @returns Promise resolving to array of URLs
     */
    async getDirectUrlsAsync(url, options) {
        const info = await this.getInfoAsync(url, options);
        return info.formats.map((f) => f.url);
    }
    /**
     * Gets formats, preferring JSON with fallback to table parsing.
     * @param url - Video URL
     * @param options - Args options
     * @returns Promise resolving to FormatsResult
     */
    async getFormatsAsync(url, options) {
        const info = await this.getInfoAsync(url, options);
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
    async getThumbnailsAsync(url) {
        const info = await this.getInfoAsync(url);
        return info.thumbnails;
    }
    /**
     * Fetches video title.
     * @param url - Video URL
     * @returns Promise resolving to title string
     */
    async getTitleAsync(url) {
        const result = await this.execAsync(url, {
            print: 'title',
        });
        return result.output.trim();
    }
    /**
     * Gets yt-dlp version.
     * @returns Promise resolving to version string
     */
    async getVersionAsync() {
        const result = await this.execYtdlpCmd(['--version']);
        if (result.exitCode !== 0 && result.exitCode !== null) {
            throw new Error(`Failed to get yt-dlp version: ${result.stderr || result.stdout}`);
        }
        return result.stdout.trim();
    }
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
    execYtdlpCmd(command, options) {
        const args = typeof command === 'string'
            ? YtDlp.tokenizeCommand(command)
            : command;
        return new Promise((resolve, reject) => {
            if (!this.binaryPath) {
                reject(new Error('Binary path is required. yt-dlp binary not found or not configured. Pass `binaryPath` in the YtDlp constructor, or run downloadYtDlp() first.'));
                return;
            }
            const commandStr = `${this.binaryPath} ${args.join(' ')}`;
            const child = (0, child_process_1.spawn)(this.binaryPath, args, {
                cwd: options?.cwd,
                env: options?.env,
                shell: false,
            });
            let stdout = '';
            let stderr = '';
            let timeoutHandle;
            let timedOut = false;
            if (options?.timeoutMs) {
                timeoutHandle = setTimeout(() => {
                    timedOut = true;
                    child.kill();
                }, options.timeoutMs);
            }
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('error', (error) => {
                if (timeoutHandle)
                    clearTimeout(timeoutHandle);
                reject(error);
            });
            child.on('close', (code) => {
                if (timeoutHandle)
                    clearTimeout(timeoutHandle);
                if (timedOut) {
                    reject(new Error(`yt-dlp command timed out after ${options?.timeoutMs}ms: ${commandStr}`));
                    return;
                }
                resolve({ stdout, stderr, exitCode: code, command: commandStr });
            });
        });
    }
    /**
     * Tokenizes a shell-like command string into an argv array, respecting
     * single and double quotes (so a quoted URL containing spaces or `&`
     * stays as one argument). Used internally by `execYtdlpCmd()` when a
     * string is passed instead of an array. This does NOT invoke a shell,
     * so shell metacharacters (`|`, `;`, `$(...)`, etc.) are treated as
     * literal characters, not interpreted.
     */
    static tokenizeCommand(input) {
        const args = [];
        let current = '';
        let quoteChar = null;
        let hasToken = false;
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (quoteChar) {
                if (char === quoteChar) {
                    quoteChar = null;
                }
                else {
                    current += char;
                }
                continue;
            }
            if (char === '"' || char === "'") {
                quoteChar = char;
                hasToken = true;
                continue;
            }
            if (/\s/.test(char)) {
                if (hasToken) {
                    args.push(current);
                    current = '';
                    hasToken = false;
                }
                continue;
            }
            current += char;
            hasToken = true;
        }
        if (hasToken) {
            args.push(current);
        }
        return args;
    }
    /**
     * Downloads FFmpeg binaries.
     * @returns Promise resolving when download is complete
     */
    async downloadFFmpeg() {
        return (0, ffmpeg_1.downloadFFmpeg)();
    }
    /**
     * Gets video/audio content as a File object.
     * Downloads the media to memory and returns a File object.
     * @param url - Video URL
     * @param options - File options with progress callback
     * @returns Promise resolving to File object
     */
    async getFileAsync(url, options) {
        // First get video info for title
        let info;
        const { onBeforeDownload, onProgress, filename, metadata, format, ...rest } = options || {};
        // Collect data in memory
        const chunks = [];
        const passThrough = new stream_1.PassThrough();
        passThrough.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        // Build format args and merge with rest options
        const formatArgs = (0, format_1.parseFormatOptions)(format);
        const execOptions = { ...rest };
        // Apply format args to options
        if (formatArgs.length >= 2 && formatArgs[0] === '-f') {
            execOptions.format = formatArgs[1];
        }
        if (formatArgs.includes('--merge-output-format')) {
            const idx = formatArgs.indexOf('--merge-output-format');
            execOptions.mergeOutputFormat = formatArgs[idx + 1];
        }
        await this.execAsync(url, {
            ...execOptions,
            noPlaylist: true,
            pipeTo: passThrough,
            onProgress,
            onBeforeDownload: (p) => {
                info = p;
                onBeforeDownload?.(p);
            },
            output: '-',
        });
        // Determine content type and extension
        let contentType;
        let extension;
        if (format && typeof format === 'object') {
            contentType = (0, format_1.getContentType)(format);
            extension = (0, format_1.getFileExtension)(format);
        }
        else {
            // Check for extractAudio in options
            const fromArgs = (0, format_1.getContentTypeFromArgs)(rest);
            contentType = fromArgs || 'video/mp4';
            const extFromArgs = (0, format_1.getFileExtensionFromArgs)(rest);
            extension = extFromArgs || 'mp4';
        }
        const blob = new buffer_1.Blob(chunks, { type: contentType });
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
    async getUrlsAsync(url, options) {
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
    async updateYtDlpAsync(options) {
        const preferBuiltIn = options?.preferBuiltIn !== false;
        if (preferBuiltIn && this.binaryPath) {
            try {
                await this.execYtdlpCmd(['--update']);
                const version = await this.getVersionAsync().catch(() => undefined);
                return {
                    method: 'built-in',
                    binaryPath: this.binaryPath,
                    version,
                };
            }
            catch {
                // Fall back to a manual download.
            }
        }
        const outDir = options?.outDir ||
            (this.binaryPath ? path_1.default.dirname(this.binaryPath) : undefined);
        const verifyChecksum = options?.verifyChecksum !== false;
        if (verifyChecksum) {
            const result = await (0, ytdlp_1.downloadYtDlpVerified)(outDir);
            const version = await this.getVersionAsyncUsingBinary(result.path).catch(() => undefined);
            return {
                method: 'download',
                binaryPath: result.path,
                version,
                verified: result.verified,
            };
        }
        const downloadedPath = await (0, ytdlp_1.downloadYtDlp)(outDir);
        const version = await this.getVersionAsyncUsingBinary(downloadedPath).catch(() => undefined);
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
    async getVersionAsyncUsingBinary(binaryPath) {
        return new Promise((resolve, reject) => {
            const process = (0, child_process_1.spawn)(binaryPath, ['--version']);
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
                }
                else {
                    reject(new Error(`Failed to get version: ${stderr}`));
                }
            });
            process.on('error', reject);
        });
    }
}
exports.YtDlp = YtDlp;
/**
 * Helper utilities exported for advanced usage.
 */
exports.helpers = {
    downloadFFmpeg: ffmpeg_1.downloadFFmpeg,
    findFFmpegBinary: ffmpeg_1.findFFmpegBinary,
    PROGRESS_STRING: progress_1.PROGRESS_STRING,
    getContentType: format_1.getContentType,
    getFileExtension: format_1.getFileExtension,
    parseFormatOptions: format_1.parseFormatOptions,
    stringToProgress: progress_1.stringToProgress,
    createArgs: args_1.createArgs,
    extractThumbnails: thumbnails_1.extractThumbnails,
    downloadFile: request_1.downloadFile,
    BIN_DIR: paths_1.BIN_DIR,
    downloadYtDlp: ytdlp_1.downloadYtDlp,
    downloadYtDlpVerified: ytdlp_1.downloadYtDlpVerified,
    findYtdlpBinary: ytdlp_1.findYtdlpBinary,
};
