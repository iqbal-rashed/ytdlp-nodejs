import { ArgsOptions } from '../types';
/**
 * Converts ArgsOptions into a string array of command-line arguments for yt-dlp.
 * @param options - yt-dlp options
 * @returns Array of command-line arguments
 */
export declare function createArgs(options: ArgsOptions): string[];
