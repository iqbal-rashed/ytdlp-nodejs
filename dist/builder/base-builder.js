"use strict";
/**
 * Base builder class for yt-dlp operations
 * Provides shared fluent API methods for Download and Stream builders
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBuilder = void 0;
const node_events_1 = require("node:events");
const args_1 = require("../core/args");
const format_1 = require("../utils/format");
const ytdlp_1 = require("../utils/ytdlp");
const ffmpeg_1 = require("../utils/ffmpeg");
const node_fs_1 = __importDefault(require("node:fs"));
/**
 * Abstract base builder class with shared fluent API methods.
 * Extended by Download and Stream builders.
 *
 * Note: This class extends EventEmitter without generics to avoid TypeScript
 * compatibility issues. Subclasses should use declaration merging or casting
 * for type-safe event handling.
 */
class BaseBuilder extends node_events_1.EventEmitter {
    constructor(url, options) {
        super();
        this.binaryPath = '';
        this.videoUrl = '';
        this.extraArgs = {};
        this.rawArgs = [];
        this.videoUrl = url;
        this.binaryPath = options?.binaryPath || (0, ytdlp_1.findYtdlpBinary)() || '';
        this.ffmpegPath = options?.ffmpegPath || (0, ffmpeg_1.findFFmpegBinary)();
        if (!this.binaryPath || !node_fs_1.default.existsSync(this.binaryPath)) {
            console.error(new Error('yt-dlp binary not found. Please install yt-dlp or specify correct binaryPath in options.'));
        }
        if (this.ffmpegPath && !node_fs_1.default.existsSync(this.ffmpegPath)) {
            console.error(new Error(`FFmpeg binary not found at: ${this.ffmpegPath}. Please install FFmpeg or specify correct ffmpegPath.`));
        }
    }
    /**
     * Set the binary path for yt-dlp
     */
    setBinaryPath(path) {
        this.binaryPath = path;
        return this;
    }
    /**
     * Set the FFmpeg binary path
     */
    setFfmpegPath(path) {
        this.ffmpegPath = path;
        return this;
    }
    /**
     * Set the format filter (mergevideo, audioonly, videoonly, audioandvideo)
     */
    format(format) {
        this.formatValue = format;
        return this;
    }
    /**
     * Set the format filter (mergevideo, audioonly, videoonly, audioandvideo)
     */
    filter(filter) {
        const existing = typeof this.formatValue === 'object' ? this.formatValue : {};
        this.formatValue = { ...existing, filter };
        return this;
    }
    /**
     * Set the format quality (0-10, 0 is best)
     */
    quality(quality) {
        const existing = typeof this.formatValue === 'object' ? this.formatValue : {};
        this.formatValue = {
            filter: this.formatValue,
            ...existing,
            quality,
        };
        return this;
    }
    /**
     * Set the format type (audioonly, videoonly, audioandvideo)
     */
    type(type) {
        const existing = typeof this.formatValue === 'object' ? this.formatValue : {};
        this.formatValue = {
            filter: this.formatValue,
            ...existing,
            type,
        };
        return this;
    }
    options(options) {
        this.extraArgs = { ...this.extraArgs, ...options };
        return this;
    }
    /**
     * Limit download rate (e.g., '1M', '500K')
     */
    rateLimit(rate) {
        this.extraArgs.limitRate = rate;
        return this;
    }
    /**
     * Set cookies string
     */
    cookies(cookies) {
        this.extraArgs.cookies = cookies;
        return this;
    }
    /**
     * Set cookies from browser
     */
    cookiesFromBrowser(browser) {
        this.extraArgs.cookiesFromBrowser = browser;
        return this;
    }
    /**
     * Set proxy URL
     */
    proxy(url) {
        this.extraArgs.proxy = url;
        return this;
    }
    /**
     * Add custom arguments
     */
    addOption(key, value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.extraArgs[key] = value;
        return this;
    }
    /**
     * Add raw command line arguments
     */
    addArgs(...args) {
        this.rawArgs.push(...args);
        return this;
    }
    /**
     * Enable audio extraction
     */
    extractAudio(format) {
        this.extraArgs.extractAudio = true;
        if (format) {
            this.extraArgs.audioFormat = format;
        }
        return this;
    }
    /**
     * Set audio format for extraction
     */
    audioFormat(format) {
        this.extraArgs.audioFormat = format;
        return this;
    }
    /**
     * Set audio quality (0-10, 0 is best)
     */
    audioQuality(quality) {
        this.extraArgs.audioQuality = quality;
        return this;
    }
    /**
     * Embed thumbnail in the file
     */
    embedThumbnail() {
        this.extraArgs.embedThumbnail = true;
        return this;
    }
    /**
     * Embed subtitles in the file
     */
    embedSubs() {
        this.extraArgs.embedSubs = true;
        return this;
    }
    /**
     * Embed metadata in the file
     */
    embedMetadata() {
        this.extraArgs.embedMetadata = true;
        return this;
    }
    /**
     * Write subtitles to file
     */
    writeSubs() {
        this.extraArgs.writeSubs = true;
        return this;
    }
    /**
     * Write auto-generated subtitles
     */
    writeAutoSubs() {
        this.extraArgs.writeAutoSubs = true;
        return this;
    }
    /**
     * Set subtitle languages
     */
    subLangs(langs) {
        this.extraArgs.subLangs = langs;
        return this;
    }
    /**
     * Write thumbnail to file
     */
    writeThumbnail() {
        this.extraArgs.writeThumbnail = true;
        return this;
    }
    /**
     * Set username for authentication
     */
    username(user) {
        this.extraArgs.username = user;
        return this;
    }
    /**
     * Set password for authentication
     */
    password(pass) {
        this.extraArgs.password = pass;
        return this;
    }
    /**
     * Set playlist start index
     */
    playlistStart(index) {
        this.extraArgs.playlistStart = index;
        return this;
    }
    /**
     * Set playlist end index
     */
    playlistEnd(index) {
        this.extraArgs.playlistEnd = index;
        return this;
    }
    /**
     * Set specific playlist items
     */
    playlistItems(items) {
        this.extraArgs.playlistItems = items;
        return this;
    }
    /**
     * Build format-related arguments from current settings
     */
    buildFormatArgs() {
        if (!this.formatValue) {
            return [];
        }
        return (0, format_1.parseFormatOptions)(this.formatValue);
    }
    /**
     * Build base yt-dlp arguments (common to all operations)
     * @param extra - Extra arguments to append
     * @param requireUrl - Whether a URL is required for this operation (default: true).
     *   Subclasses that also support URL-less operations (e.g. `--version`, `--update`)
     *   should pass `false` to skip the validation.
     */
    buildBaseArgs(extra = [], requireUrl = true) {
        if (requireUrl && !this.videoUrl) {
            throw new Error('URL is required.');
        }
        const formatArgs = this.buildFormatArgs();
        return (0, args_1.buildYtDlpArgs)({
            url: this.videoUrl,
            options: this.extraArgs,
            ffmpegPath: this.ffmpegPath,
            withProgressTemplate: true,
            extra: [...formatArgs, ...extra, ...this.rawArgs],
        });
    }
    /**
     * Enable debug printing of the command line before execution
     */
    debugPrint(enable = true) {
        this.extraArgs.debugPrintCommandLine = enable;
        return this;
    }
    /**
     * Get the full command string (for debugging)
     */
    getCommand() {
        const args = this.buildArgs();
        return `${this.binaryPath} ${args.join(' ')}`;
    }
    /**
     * Print the command line to stderr if debugPrintCommandLine is enabled
     * Should be called before spawning the process
     */
    printDebugCommandLine(args) {
        if (this.extraArgs.debugPrintCommandLine) {
            const command = `${this.binaryPath} ${args.join(' ')}`;
            console.error(`[ytdlp-nodejs] Command: ${command}`);
        }
    }
    /**
     * Validates that binary path is set
     */
    validateBinaryPath() {
        if (!this.binaryPath) {
            throw new Error('Binary path is required. Use .setBinaryPath() or pass it in constructor.');
        }
    }
    /**
     * Kill the running process
     */
    kill(signal) {
        return this.process?.kill(signal) ?? false;
    }
    /**
     * Get the process ID
     */
    get pid() {
        return this.process?.pid;
    }
}
exports.BaseBuilder = BaseBuilder;
