export declare function parsePrintedOutput(output: string): string;
/**
 * Parses video info JSON from yt-dlp output.
 */
export declare function parsePrintedVideoInfo(output: string): Record<string, unknown>[];
/**
 * Parses video info from a before_dl output line.
 * Returns null if the line doesn't contain before_dl info.
 */
export declare function parseBeforeDownloadInfo(line: string): Record<string, unknown> | null;
