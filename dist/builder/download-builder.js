"use strict";
/**
 * Fluent builder classes for yt-dlp operations
 * Provides FFmpeg-like chaining API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Download = void 0;
exports.createDownload = createDownload;
const progress_1 = require("../utils/progress");
const parse_1 = require("../core/parse");
const base_builder_1 = require("./base-builder");
const constants_1 = require("../core/constants");
const node_child_process_1 = require("node:child_process");
/**
 * Fluent builder for yt-dlp download operations
 *
 * @example
 * ```typescript
 * import { Download } from 'ytdlp-nodejs';
 *
 * const result = await new Download()
 *   .url('https://youtube.com/watch?v=...')
 *   .filter('mergevideo')
 *   .quality('1080p')
 *   .type('mp4')
 *   .output('./downloads')
 *   .on('progress', (p) => console.log(`${p.percentage}%`))
 *   .run();
 *
 * console.log('Downloaded:', result.filePaths);
 * ```
 */
class Download extends base_builder_1.BaseBuilder {
    constructor(url, options) {
        super(url, options);
        // If the error event in Node.js is not being monitored or causes an exception
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
     * Set the output directory
     */
    output(path) {
        this.outputDir = path;
        return this;
    }
    /**
     * Set the output template (yt-dlp -o option)
     */
    setOutputTemplate(template) {
        this.outputPath = template;
        return this;
    }
    /**
     * Skip download (useful for metadata extraction)
     */
    skipDownload() {
        this.extraArgs.skipDownload = true;
        return this;
    }
    /**
     * Build the command arguments
     */
    buildArgs() {
        const options = { ...this.extraArgs };
        if (this.outputDir) {
            options.output = `${this.outputDir}/%(title)s.%(ext)s`;
        }
        if (this.outputPath) {
            options.output = this.outputPath;
        }
        // Temporarily update extraArgs for base build
        const savedExtraArgs = this.extraArgs;
        this.extraArgs = options;
        // Add before_dl print if there are listeners for beforeDownload
        const extraPrintArgs = [...(0, constants_1.getDownloadPrintArgs)()];
        if (this.listenerCount('beforeDownload') > 0) {
            extraPrintArgs.unshift('--print', (0, constants_1.buildBeforeDownloadPrintArg)());
        }
        const args = this.buildBaseArgs(extraPrintArgs);
        this.extraArgs = savedExtraArgs;
        return args;
    }
    /**
     * Run the download
     */
    run() {
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
                this.process = (0, node_child_process_1.spawn)(this.binaryPath, args);
                this.emit('start', command);
                let stdout = '';
                let stderr = '';
                this.process.stdout?.on('data', (data) => {
                    const text = data.toString();
                    stdout += text;
                    this.emit('stdout', text);
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
                this.process.stderr?.on('data', (data) => {
                    const text = data.toString();
                    stderr += text;
                    this.emit('stderr', text);
                    const progress = (0, progress_1.stringToProgress)(text);
                    if (progress) {
                        this.emit('progress', progress);
                    }
                });
                this.process.on('error', (error) => {
                    this.emit('error', error);
                    reject(error);
                });
                this.process.on('close', (code) => {
                    if (code !== 0 && code !== null) {
                        const error = new Error(`yt-dlp exited with code ${code}: ${stderr}`);
                        this.emit('error', error);
                        reject(error);
                        return;
                    }
                    const output = (0, parse_1.parsePrintedOutput)(stdout);
                    const info = (0, parse_1.parsePrintedVideoInfo)(stdout);
                    const result = {
                        output,
                        filePaths: info.map((i) => i?.filepath ?? '').filter(Boolean),
                        info,
                        stderr,
                    };
                    this.emit('finish', result);
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
     * Make the builder directly awaitable
     */
    then(onfulfilled, onrejected) {
        return this.run().then(onfulfilled, onrejected);
    }
    /**
     * Catch errors
     */
    catch(onrejected) {
        return this.run().catch(onrejected);
    }
    /**
     * Finally handler
     */
    finally(onfinally) {
        return this.run().finally(onfinally);
    }
}
exports.Download = Download;
/**
 * Factory function to create a new Download builder
 */
function createDownload(url, options) {
    return new Download(url, options);
}
