/**
 * Fluent builder class for yt-dlp exec operations
 * Provides FFmpeg-like chaining API for executing arbitrary yt-dlp commands
 * Combines features from Download and Stream builders
 */
import { PassThrough } from 'node:stream';
import type { DownloadedVideoInfo, VideoProgress } from '../types';
import { BaseBuilder } from './base-builder';
/**
 * Event map for exec builder events
 */
export interface ExecBuilderEvents {
    start: [command: string];
    progress: [progress: VideoProgress];
    beforeDownload: [info: DownloadedVideoInfo];
    afterDownload: [info: DownloadedVideoInfo];
    stdout: [data: string];
    stderr: [data: string];
    data: [chunk: Buffer];
    error: [error: Error];
    complete: [result: ExecBuilderResult];
    end: [];
}
/**
 * Result type for exec operations (when not piping)
 */
export interface ExecBuilderResult {
    /** Standard output from the command */
    stdout: string;
    /** Standard error output from the command */
    stderr: string;
    /** Exit code (null if process was terminated by signal) */
    exitCode: number | null;
    /** Full command that was executed */
    command: string;
    /** Downloaded video info (if available) */
    info?: DownloadedVideoInfo[];
    /** Output (if available) */
    output: string;
    /** File paths (if available) */
    filePaths?: string[];
}
/**
 * Result type for pipe operations
 */
export interface ExecPipeResult {
    /** Total bytes streamed */
    bytes: number;
    /** Duration in milliseconds */
    duration: number;
    /** Downloaded video info (if available) */
    info?: DownloadedVideoInfo;
    /** Output (if available) */
    output: string;
}
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
export declare class Exec extends BaseBuilder {
    private passThrough?;
    private totalBytes;
    private started;
    private beforeDownloadInfo?;
    private afterDownloadInfo?;
    private output;
    private resultPromise?;
    constructor(url: string, options?: {
        binaryPath?: string;
        ffmpegPath?: string;
    });
    /**
     * Add a typed event listener
     */
    on<K extends keyof ExecBuilderEvents>(event: K, listener: (...args: ExecBuilderEvents[K]) => void): this;
    /**
     * Add a one-time typed event listener
     */
    once<K extends keyof ExecBuilderEvents>(event: K, listener: (...args: ExecBuilderEvents[K]) => void): this;
    /**
     * Emit a typed event
     */
    emit<K extends keyof ExecBuilderEvents>(event: K, ...args: ExecBuilderEvents[K]): boolean;
    /**
     * Build the command arguments
     */
    protected buildArgs(): string[];
    /**
     * Start the exec process (for pipe mode)
     */
    private startStream;
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
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: {
        end?: boolean;
    }): Promise<ExecPipeResult>;
    /**
     * Alias for pipe() - for backward compatibility
     */
    pipeAsync<T extends NodeJS.WritableStream>(destination: T, options?: {
        end?: boolean;
    }): Promise<ExecPipeResult>;
    /**
     * Collect the entire stream into a Buffer
     */
    toBuffer(): Promise<Buffer>;
    /**
     * Get the underlying PassThrough stream
     */
    getStream(): PassThrough;
    /**
     * Execute the yt-dlp command and return the result (non-pipe mode)
     */
    exec(): Promise<ExecBuilderResult>;
    /**
     * Alias for exec() - for convenience
     */
    run(): Promise<ExecBuilderResult>;
    /**
     * Make the builder directly awaitable
     */
    then<TResult1 = ExecBuilderResult, TResult2 = never>(onfulfilled?: ((value: ExecBuilderResult) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
    /**
     * Catch errors
     */
    catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null): Promise<ExecBuilderResult | TResult>;
    /**
     * Finally handler
     */
    finally(onfinally?: (() => void) | null): Promise<ExecBuilderResult>;
}
/**
 * Factory function to create a new Exec builder
 */
export declare function createExec(url: string, options?: {
    binaryPath?: string;
    ffmpegPath?: string;
}): Exec;
