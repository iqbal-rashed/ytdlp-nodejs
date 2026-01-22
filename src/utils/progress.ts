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
export const PROGRESS_STRING = '~ytdlp-progress-%(progress)#j';

/**
 * Formats a number of bytes into a human-readable string.
 * @param bytes - Number of bytes (string or number)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "1.5 MB"
 * @example
 * formatBytes(1536) // "1.5 KB"
 * formatBytes(1048576) // "1 MB"
 */
export function formatBytes(bytes: string | number, decimals = 2): string {
  const newBytes = Number(bytes);

  if (newBytes === 0 || isNaN(newBytes)) return newBytes + ' Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(newBytes) / Math.log(k));

  return parseFloat((newBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Rounds a number to a fixed number of decimal places.
 * @internal
 */
function toFixedNumber(num: number, digits: number, base?: number): number {
  const pow = Math.pow(base || 10, digits);
  return Math.round(num * pow) / pow;
}

/**
 * Calculates percentage of partial value relative to total.
 * @param partialValue - Current progress value
 * @param totalValue - Total value
 * @returns Percentage as a number (e.g., 75.5)
 */
export function percentage(
  partialValue: string | number,
  totalValue: string | number,
): number {
  return toFixedNumber((100 * Number(partialValue)) / Number(totalValue), 2);
}

/**
 * Converts seconds to a human-readable time string.
 * @param d - Duration in seconds
 * @returns Formatted string like "1 hour, 30 minutes, 45 seconds"
 * @example
 * secondsToHms(3661) // "1 hour, 1 minute, 1 second"
 */
export function secondsToHms(d: number | string): string {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
  const sDisplay = s >= 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
  return hDisplay + mDisplay + sDisplay;
}

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
export function stringToProgress(str: string): VideoProgress | undefined {
  try {
    if (!str.includes('~ytdlp-progress-')) throw new Error();

    const jsonStr = str.trim().replace('~ytdlp-progress-', '');
    if (!jsonStr) throw new Error();

    const object = JSON.parse(jsonStr);

    // Helper to parse numeric values - returns undefined for null/NA/invalid values
    const parseNum = (val: unknown): number | undefined => {
      if (val === null || val === undefined || val === 'NA') return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const downloaded = parseNum(object.downloaded_bytes);
    const total =
      parseNum(object.total_bytes) ?? parseNum(object.total_bytes_estimate);
    const speed = parseNum(object.speed);
    const eta = parseNum(object.eta);

    // Calculate percentage only if both values are available
    const pct =
      downloaded !== undefined && total !== undefined && total > 0
        ? toFixedNumber((100 * downloaded) / total, 2)
        : undefined;

    return {
      filename: object.filename,
      status: object.status,
      downloaded: downloaded,
      downloaded_str:
        downloaded !== undefined ? formatBytes(downloaded) : undefined,
      total: total,
      total_str: total !== undefined ? formatBytes(total) : undefined,
      speed: speed,
      speed_str: speed !== undefined ? formatBytes(speed) + '/s' : undefined,
      eta: eta,
      eta_str: eta !== undefined ? secondsToHms(eta) : undefined,
      percentage: pct,
      percentage_str: pct !== undefined ? pct + '%' : undefined,
    };
  } catch {
    return undefined;
  }
}
