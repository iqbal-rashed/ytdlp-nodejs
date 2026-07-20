"use strict";
/**
 * Fluent builder class for yt-dlp stream operations
 * Provides FFmpeg-like chaining API for streaming
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = void 0;
exports.createStream = createStream;
const node_stream_1 = require("node:stream");
const progress_1 = require("../utils/progress");
const parse_1 = require("../core/parse");
const base_builder_1 = require("./base-builder");
const constants_1 = require("../core/constants");
const node_child_process_1 = require("node:child_process");
/**
 * Fluent builder for yt-dlp stream operations
 *
 * @example
 * ```typescript
 * import { YtDlp } from 'ytdlp-nodejs';
 * import { createWriteStream } from 'fs';
 *
 * const ytdlp = new YtDlp();
 *
 * // Stream to file - pipe() is awaitable
 * const result = await ytdlp
 *   .stream('https://youtube.com/watch?v=...')
 *   .filter('mergevideo')
 *   .quality('720p')
 *   .type('mp4')
 *   .on('progress', (p) => console.log(p.percentage_str))
 *   .pipe(createWriteStream('video.mp4'));
 *
 * console.log('Bytes:', result.bytes);
 * ```
 */
class Stream extends base_builder_1.BaseBuilder {
    constructor(url, options) {
        super(url, options);
        this.totalBytes = 0;
        this.started = false;
        // Prevent uncaught exception when error event is emitted without listeners
        this.on('error', () => { });
    }
    /**
     * Add a typed event listener
     */
    on(event, listener) {
        return super.on(event, listener);
    }
    /**
     * Add a one-time typed event listener
     */
    once(event, listener) {
        return super.once(event, listener);
    }
    /**
     * Emit a typed event
     */
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    /**
     * Build the command arguments
     */
    buildArgs() {
        const baseArgs = ['-o', '-', '--no-playlist', '--progress', '--no-quiet'];
        // Add before_dl print if there are listeners for beforeDownload
        if (this.listenerCount('beforeDownload') > 0) {
            baseArgs.push('--print', (0, constants_1.buildBeforeDownloadPrintArg)());
        }
        return this.buildBaseArgs(baseArgs);
    }
    /**
     * Start the stream process
     */
    startStream() {
        if (this.started) {
            return this.passThrough;
        }
        this.validateBinaryPath();
        this.started = true;
        this.passThrough = new node_stream_1.PassThrough();
        const args = this.buildArgs();
        const command = `${this.binaryPath} ${args.join(' ')}`;
        // Print command line to stderr if debugPrintCommandLine is enabled
        this.printDebugCommandLine(args);
        this.process = (0, node_child_process_1.spawn)(this.binaryPath, args, { shell: false });
        this.emit('start', command);
        this.process.stdout?.on('data', (chunk) => {
            this.totalBytes += chunk.length;
            this.passThrough.write(chunk);
            this.emit('data', chunk);
        });
        this.process.stderr?.on('data', (data) => {
            const text = data.toString();
            // Check for before_dl info
            const beforeInfo = (0, parse_1.parseBeforeDownloadInfo)(text);
            if (beforeInfo) {
                this.emit('beforeDownload', beforeInfo);
            }
            const progress = (0, progress_1.stringToProgress)(text);
            if (progress) {
                this.emit('progress', progress);
            }
        });
        this.process.on('error', (error) => {
            this.emit('error', error);
            this.passThrough.destroy(error);
        });
        this.process.on('close', (code) => {
            if (code !== 0 && code !== null) {
                const error = new Error(`yt-dlp exited with code ${code}`);
                this.emit('error', error);
                this.passThrough.destroy(error);
            }
            else {
                this.passThrough.end();
                this.emit('end');
            }
        });
        return this.passThrough;
    }
    /**
     * Pipe the stream to a writable destination and wait for completion.
     * This method is awaitable - returns a Promise.
     *
     * @example
     * ```typescript
     * const result = await ytdlp
     *   .stream(url)
     *   .filter('mergevideo')
     *   .pipe(createWriteStream('video.mp4'));
     * ```
     */
    pipe(destination, options) {
        const startTime = Date.now();
        const stream = this.startStream();
        return new Promise((resolve, reject) => {
            stream.pipe(destination, options);
            destination.on('finish', () => {
                resolve({
                    bytes: this.totalBytes,
                    duration: Date.now() - startTime,
                });
            });
            destination.on('error', reject);
            this.passThrough.on('error', reject);
        });
    }
    /**
     * Alias for pipe() - for backward compatibility
     */
    pipeAsync(destination, options) {
        return this.pipe(destination, options);
    }
    /**
     * Collect the entire stream into a Buffer
     */
    async toBuffer() {
        const chunks = [];
        return new Promise((resolve, reject) => {
            const stream = this.startStream();
            stream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            stream.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            stream.on('error', reject);
        });
    }
    /**
     * Get the underlying PassThrough stream
     */
    getStream() {
        return this.startStream();
    }
}
exports.Stream = Stream;
/**
 * Factory function to create a new Stream builder
 */
function createStream(url, options) {
    return new Stream(url, options);
}
