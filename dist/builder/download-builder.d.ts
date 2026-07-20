/**
 * Fluent builder classes for yt-dlp operations
 * Provides FFmpeg-like chaining API
 */
import type { DownloadedVideoInfo, DownloadFinishResult, VideoProgress } from '../types';
import { BaseBuilder } from './base-builder';
/**
 * Event map for download builder events
 */
export interface DownloadBuilderEvents {
    start: [command: string];
    progress: [progress: VideoProgress];
    beforeDownload: [info: DownloadedVideoInfo];
    stdout: [data: string];
    stderr: [data: string];
    error: [error: Error];
    finish: [result: DownloadFinishResult];
}
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
export declare class Download extends BaseBuilder {
    private outputDir?;
    private outputPath?;
    private resultPromise?;
    constructor(url: string, options?: {
        binaryPath?: string;
        ffmpegPath?: string;
    });
    /**
     * Add a typed event listener
     */
    on<K extends keyof DownloadBuilderEvents>(event: K, listener: (...args: DownloadBuilderEvents[K]) => void): this;
    /**
     * Add a one-time typed event listener
     */
    once<K extends keyof DownloadBuilderEvents>(event: K, listener: (...args: DownloadBuilderEvents[K]) => void): this;
    /**
     * Emit a typed event
     */
    emit<K extends keyof DownloadBuilderEvents>(event: K, ...args: DownloadBuilderEvents[K]): boolean;
    /**
     * Set the output directory
     */
    output(path: string): this;
    /**
     * Set the output template (yt-dlp -o option)
     */
    setOutputTemplate(template: string): this;
    /**
     * Skip download (useful for metadata extraction)
     */
    skipDownload(): this;
    /**
     * Build the command arguments
     */
    protected buildArgs(): string[];
    /**
     * Run the download
     */
    run(): Promise<DownloadFinishResult>;
    /**
     * Make the builder directly awaitable
     */
    then<TResult1 = DownloadFinishResult, TResult2 = never>(onfulfilled?: ((value: DownloadFinishResult) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
    /**
     * Catch errors
     */
    catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null): Promise<DownloadFinishResult | TResult>;
    /**
     * Finally handler
     */
    finally(onfinally?: (() => void) | null): Promise<DownloadFinishResult>;
}
/**
 * Factory function to create a new Download builder
 */
export declare function createDownload(url: string, options?: {
    binaryPath?: string;
    ffmpegPath?: string;
}): Download;
