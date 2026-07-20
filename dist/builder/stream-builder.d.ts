/**
 * Fluent builder class for yt-dlp stream operations
 * Provides FFmpeg-like chaining API for streaming
 */
import { PassThrough } from 'node:stream';
import type { DownloadedVideoInfo, VideoProgress } from '../types';
import { BaseBuilder } from './base-builder';
/**
 * Event map for stream builder events
 */
export interface StreamBuilderEvents {
    start: [command: string];
    progress: [progress: VideoProgress];
    beforeDownload: [info: DownloadedVideoInfo];
    data: [chunk: Buffer];
    stderr: [data: string];
    error: [error: Error];
    end: [];
}
/**
 * Result type for stream operations
 */
export interface StreamResult {
    /** Total bytes streamed */
    bytes: number;
    /** Duration in milliseconds */
    duration: number;
}
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
export declare class Stream extends BaseBuilder {
    private passThrough?;
    private totalBytes;
    private started;
    constructor(url: string, options?: {
        binaryPath?: string;
        ffmpegPath?: string;
    });
    /**
     * Add a typed event listener
     */
    on<K extends keyof StreamBuilderEvents>(event: K, listener: (...args: StreamBuilderEvents[K]) => void): this;
    /**
     * Add a one-time typed event listener
     */
    once<K extends keyof StreamBuilderEvents>(event: K, listener: (...args: StreamBuilderEvents[K]) => void): this;
    /**
     * Emit a typed event
     */
    emit<K extends keyof StreamBuilderEvents>(event: K, ...args: StreamBuilderEvents[K]): boolean;
    /**
     * Build the command arguments
     */
    protected buildArgs(): string[];
    /**
     * Start the stream process
     */
    private startStream;
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
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: {
        end?: boolean;
    }): Promise<StreamResult>;
    /**
     * Alias for pipe() - for backward compatibility
     */
    pipeAsync<T extends NodeJS.WritableStream>(destination: T, options?: {
        end?: boolean;
    }): Promise<StreamResult>;
    /**
     * Collect the entire stream into a Buffer
     */
    toBuffer(): Promise<Buffer>;
    /**
     * Get the underlying PassThrough stream
     */
    getStream(): PassThrough;
}
/**
 * Factory function to create a new Stream builder
 */
export declare function createStream(url: string, options?: {
    binaryPath?: string;
    ffmpegPath?: string;
}): Stream;
