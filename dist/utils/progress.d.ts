/**
 * Progress Utilities
 * Provides functions for parsing and formatting yt-dlp progress output.
 * @module utils/progress
 */
import { VideoProgress } from '../types';
/**
 * Template string for yt-dlp progress output format.
 * Used with `--progress-template` flag.
 */
export declare const PROGRESS_STRING = "~ytdlp-progress-%(progress)#j";
/**
 * Formats a number of bytes into a human-readable string.
 * @param bytes - Number of bytes (string or number)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "1.5 MB"
 * @example
 * formatBytes(1536) // "1.5 KB"
 * formatBytes(1048576) // "1 MB"
 */
export declare function formatBytes(bytes: string | number, decimals?: number): string;
/**
 * Calculates percentage of partial value relative to total.
 * @param partialValue - Current progress value
 * @param totalValue - Total value
 * @returns Percentage as a number (e.g., 75.5)
 */
export declare function percentage(partialValue: string | number, totalValue: string | number): number;
/**
 * Converts seconds to a human-readable time string.
 * @param d - Duration in seconds
 * @returns Formatted string like "1 hour, 30 minutes, 45 seconds"
 * @example
 * secondsToHms(3661) // "1 hour, 1 minute, 1 second"
 */
export declare function secondsToHms(d: number | string): string;
/**
 * Parses a yt-dlp progress template string into a structured VideoProgress object.
 * @param str - Raw progress output string from yt-dlp
 * @returns Parsed VideoProgress object, or undefined if parsing fails
 * @example
 * const progress = stringToProgress('~ytdlp-progress-{"status":"downloading",...}');
 * if (progress) {
 *   console.log(`${progress.percentage_str} complete`);
 * }
 */
export declare function stringToProgress(str: string): VideoProgress | undefined;
