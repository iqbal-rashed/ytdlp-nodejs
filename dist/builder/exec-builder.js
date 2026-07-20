"use strict";
/**
 * Fluent builder class for yt-dlp exec operations
 * Provides FFmpeg-like chaining API for executing arbitrary yt-dlp commands
 * Combines features from Download and Stream builders
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exec = void 0;
exports.createExec = createExec;
const node_stream_1 = require("node:stream");
const progress_1 = require("../utils/progress");
const parse_1 = require("../core/parse");
const base_builder_1 = require("./base-builder");
const constants_1 = require("../core/constants");
const node_child_process_1 = require("node:child_process");
/**
 * Fluent builder for yt-dlp exec operations
 *
 * Use this builder when you need to execute arbitrary yt-dlp commands
 * with full control over arguments, streaming, and download events.
 *
 * @example
 * ```typescript
 * import { Exec } from 'ytdlp-nodejs';
 *
 * // Execute command and get output
 * const result = await new Exec()
 *   .url('https://youtube.com/watch?v=...')
 *   .addArgs('--dump-single-json')
 *   .addArgs('--flat-playlist')
 *   .on('progress', (p) => console.log(p.status))
 *   .exec();
 *
 * console.log('Output:', result.stdout);
 * ```
 *
 * @example
 * ```typescript
 * import { createWriteStream } from 'fs';
 *
 * // Pipe to file (like Stream builder)
 * const result = await new Exec()
 *   .url('https://youtube.com/watch?v=...')
 *   .filter('mergevideo')
 *   .quality('720p')
 *   .type('mp4')
 *   .on('beforeDownload', (info) => console.log('Starting:', info.title))
 *   .on('afterDownload', (info) => console.log('Finished:', info.filepath))
 *   .pipe(createWriteStream('video.mp4'));
 *
 * console.log('Bytes:', result.bytes);
 * ```
 *
 * @example
 * ```typescript
 * // Get video title only
 * const result = await new Exec()
 *   .url('https://youtube.com/watch?v=...')
 *   .addArgs('--print', 'title')
 *   .exec();
 *
 * console.log('Title:', result.stdout.trim());
 * ```
 */
class Exec extends base_builder_1.BaseBuilder {
    constructor(url, options) {
        super(url, options);
        this.totalBytes = 0;
        this.started = false;
        this.output = '';
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
        const baseArgs = [];
        // Add before_dl and after_move print if there are listeners
        const printArgs = [...(0, constants_1.getDownloadPrintArgs)()];
        if (this.listenerCount('beforeDownload') > 0) {
            printArgs.unshift('--print', (0, constants_1.buildBeforeDownloadPrintArg)());
        }
        if (this.listenerCount('afterDownload') > 0) {
            printArgs.push('--print', 'after_move:filepath');
        }
        // Exec is a general-purpose runner used both for URL-based operations
        // (info, download-like exec, etc.) and URL-less ones (--version, --update,
        // --list-extractors, ...). It should not force a URL to be present.
        return this.buildBaseArgs([...baseArgs, ...printArgs], false);
    }
    /**
     * Start the exec process (for pipe mode)
     */
    startStream() {
        if (this.started) {
            return this.passThrough;
        }
        this.validateBinaryPath();
        this.started = true;
        this.passThrough = new node_stream_1.PassThrough();
        this.output = '';
        let args = this.buildArgs();
        // Add --no-playlist when streaming to avoid downloading entire playlists
        if (!args.includes('--no-playlist')) {
            args = ['--no-playlist', ...args];
        }
        const command = `${this.binaryPath} ${args.join(' ')}`;
        // Print command line to stderr if debugPrintCommandLine is enabled
        this.printDebugCommandLine(args);
        this.process = (0, node_child_process_1.spawn)(this.binaryPath, args, { shell: false });
        this.emit('start', command);
        this.process.stdout?.on('data', (chunk) => {
            this.totalBytes += chunk.length;
            this.passThrough.write(chunk);
            this.emit('data', chunk);
            // Also emit as text for compatibility
            const text = chunk.toString();
            this.emit('stdout', text);
            // Check for beforeDownload info
            const beforeInfo = (0, parse_1.parseBeforeDownloadInfo)(text);
            if (beforeInfo) {
                this.beforeDownloadInfo = beforeInfo;
                this.emit('beforeDownload', this.beforeDownloadInfo);
            }
            // Check for progress information
            const progress = (0, progress_1.stringToProgress)(text);
            if (progress) {
                this.emit('progress', progress);
            }
        });
        this.process.stderr?.on('data', (data) => {
            const text = data.toString();
            this.emit('stderr', text);
            this.output += text;
            // Check for beforeDownload info in stderr
            const beforeInfo = (0, parse_1.parseBeforeDownloadInfo)(text);
            if (beforeInfo) {
                this.beforeDownloadInfo = beforeInfo;
                this.emit('beforeDownload', this.beforeDownloadInfo);
            }
            // Progress is often written to stderr
            const progress = (0, progress_1.stringToProgress)(text);
            if (progress) {
                this.emit('progress', progress);
                // Check if download is finished
                if (progress.status === 'finished') {
                    if (this.beforeDownloadInfo) {
                        this.afterDownloadInfo = {
                            ...this.beforeDownloadInfo,
                            filepath: progress.filename,
                        };
                        this.emit('afterDownload', this.afterDownloadInfo);
                    }
                }
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
     * import { createWriteStream } from 'fs';
     *
     * const result = await new Exec()
     *   .url(url)
     *   .filter('mergevideo')
     *   .on('beforeDownload', (info) => console.log('Starting:', info.title))
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
                    info: this.afterDownloadInfo,
                    output: this.output,
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
    /**
     * Execute the yt-dlp command and return the result (non-pipe mode)
     */
    exec() {
        if (this.resultPromise) {
            return this.resultPromise;
        }
        this.resultPromise = new Promise((resolve, reject) => {
            try {
                this.validateBinaryPath();
                const args = this.buildArgs();
                const command = `${this.binaryPath} ${args.join(' ')}`;
                // Print command line to stderr if debugPrintCommandLine is enabled
                this.printDebugCommandLine(args);
                this.process = (0, node_child_process_1.spawn)(this.binaryPath, args, { shell: false });
                this.emit('start', command);
                let stdout = '';
                let stderr = '';
                this.process.stdout?.on('data', (data) => {
                    const text = data.toString();
                    stdout += text;
                    this.emit('stdout', text);
                    // Check for beforeDownload info
                    const beforeInfo = (0, parse_1.parseBeforeDownloadInfo)(text);
                    if (beforeInfo) {
                        this.beforeDownloadInfo =
                            beforeInfo;
                        this.emit('beforeDownload', this.beforeDownloadInfo);
                    }
                    // Emit as data event for compatibility
                    this.emit('data', data);
                    // Check for progress information
                    const progress = (0, progress_1.stringToProgress)(text);
                    if (progress) {
                        this.emit('progress', progress);
                        // Check if download is finished
                        if (progress.status === 'finished' && this.beforeDownloadInfo) {
                            this.afterDownloadInfo = {
                                ...this.beforeDownloadInfo,
                                filepath: progress.filename,
                            };
                            this.emit('afterDownload', this.afterDownloadInfo);
                        }
                    }
                });
                this.process.stderr?.on('data', (data) => {
                    const text = data.toString();
                    stderr += text;
                    this.emit('stderr', text);
                    // Check for beforeDownload info in stderr
                    const beforeInfo = (0, parse_1.parseBeforeDownloadInfo)(text);
                    if (beforeInfo) {
                        this.beforeDownloadInfo =
                            beforeInfo;
                        this.emit('beforeDownload', this.beforeDownloadInfo);
                    }
                    // Progress is often written to stderr
                    const progress = (0, progress_1.stringToProgress)(text);
                    if (progress) {
                        this.emit('progress', progress);
                        // Check if download is finished
                        if (progress.status === 'finished' && this.beforeDownloadInfo) {
                            this.afterDownloadInfo = {
                                ...this.beforeDownloadInfo,
                                filepath: progress.filename,
                            };
                            this.emit('afterDownload', this.afterDownloadInfo);
                        }
                    }
                });
                this.process.on('error', (error) => {
                    this.emit('error', error);
                    reject(error);
                });
                this.process.on('close', (code) => {
                    const output = (0, parse_1.parsePrintedOutput)(stdout);
                    const info = (0, parse_1.parsePrintedVideoInfo)(stdout);
                    const result = {
                        stdout,
                        stderr,
                        exitCode: code,
                        command,
                        info,
                        output,
                        filePaths: info.map((i) => i?.filepath ?? '').filter(Boolean),
                    };
                    this.emit('complete', result);
                    this.emit('end');
                    resolve(result);
                });
            }
            catch (error) {
                reject(error);
            }
        });
        return this.resultPromise;
    }
    /**
     * Alias for exec() - for convenience
     */
    run() {
        return this.exec();
    }
    /**
     * Make the builder directly awaitable
     */
    then(onfulfilled, onrejected) {
        return this.exec().then(onfulfilled, onrejected);
    }
    /**
     * Catch errors
     */
    catch(onrejected) {
        return this.exec().catch(onrejected);
    }
    /**
     * Finally handler
     */
    finally(onfinally) {
        return this.exec().finally(onfinally);
    }
}
exports.Exec = Exec;
/**
 * Factory function to create a new Exec builder
 */
function createExec(url, options) {
    return new Exec(url, options);
}
