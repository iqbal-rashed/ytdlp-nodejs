/**
 * Error detection utilities for yt-dlp stderr output
 */

/**
 * Pattern to match yt-dlp error messages in stderr
 * Matches lines starting with "ERROR: [extractor]" or just "ERROR:"
 */
const ERROR_PATTERN = /^ERROR:\s*(?:\[.+?\]\s*)?(.+)/m;

/**
 * Common yt-dlp error patterns that indicate a failure
 */
const FATAL_ERROR_PATTERNS = [
    /ERROR:\s*\[.*?\]\s*.*?:\s*Sign in to confirm/i,
    /ERROR:\s*\[.*?\]\s*Unable to extract/i,
    /ERROR:\s*\[.*?\]\s*This video is unavailable/i,
    /ERROR:\s*\[.*?\]\s*Video unavailable/i,
    /ERROR:\s*\[.*?\]\s*Private video/i,
    /ERROR:\s*\[.*?\]\s*.*?requires premium/i,
    /ERROR:\s*\[.*?\]\s*This live event has ended/i,
    /ERROR:\s*\[.*?\]\s*.*?is not available/i,
    /ERROR:\s*No video formats found/i,
    /ERROR:\s*Unsupported URL/i,
];

/**
 * Result of parsing stderr for errors
 */
export interface StderrErrorInfo {
    /** Whether an error was detected */
    hasError: boolean;
    /** The extracted error message */
    message?: string;
    /** The full error line from stderr */
    fullError?: string;
}

/**
 * Parse stderr output for yt-dlp errors
 * @param stderr - The stderr output from yt-dlp
 * @returns StderrErrorInfo with error details
 */
export function parseStderrErrors(stderr: string): StderrErrorInfo {
    if (!stderr) {
        return { hasError: false };
    }

    const match = stderr.match(ERROR_PATTERN);
    if (match) {
        return {
            hasError: true,
            message: match[1]?.trim(),
            fullError: match[0],
        };
    }

    return { hasError: false };
}

/**
 * Check if stderr contains any fatal error that should throw
 * @param stderr - The stderr output from yt-dlp
 * @returns true if a fatal error is detected
 */
export function hasFatalError(stderr: string): boolean {
    if (!stderr) return false;
    return FATAL_ERROR_PATTERNS.some((pattern) => pattern.test(stderr));
}

/**
 * Extract all error messages from stderr
 * @param stderr - The stderr output from yt-dlp
 * @returns Array of error messages
 */
export function extractAllErrors(stderr: string): string[] {
    if (!stderr) return [];

    const errors: string[] = [];
    const lines = stderr.split('\n');

    for (const line of lines) {
        const match = line.match(ERROR_PATTERN);
        if (match) {
            errors.push(match[0]);
        }
    }

    return errors;
}

/**
 * Create an Error object from stderr
 * @param stderr - The stderr output from yt-dlp
 * @param exitCode - Optional exit code
 * @returns Error object with formatted message
 */
export function createStderrError(
    stderr: string,
    exitCode?: number | null,
): Error {
    const errorInfo = parseStderrErrors(stderr);
    let message = errorInfo.message || 'Unknown yt-dlp error';

    if (exitCode !== undefined && exitCode !== null && exitCode !== 0) {
        message = `yt-dlp exited with code ${exitCode}: ${message}`;
    }

    return new Error(message);
}

/**
 * Check if stderr contains an error and should throw
 * This considers both ERROR: lines and exit codes
 * @param stderr - The stderr output from yt-dlp
 * @param exitCode - The exit code from yt-dlp
 * @param options - Options for error checking
 * @returns Error if one should be thrown, undefined otherwise
 */
export function checkForError(
    stderr: string,
    exitCode: number | null,
    options?: {
        /** If true, only throw on non-zero exit codes (default: false) */
        exitCodeOnly?: boolean;
        /** If true, only throw on fatal errors (default: false) */
        fatalOnly?: boolean;
    },
): Error | undefined {
    const { exitCodeOnly = false, fatalOnly = false } = options || {};

    // Non-zero exit code always indicates error
    if (exitCode !== 0 && exitCode !== null) {
        return createStderrError(stderr, exitCode);
    }

    // If only checking exit code, return undefined
    if (exitCodeOnly) {
        return undefined;
    }

    // Check for ERROR: pattern in stderr
    const errorInfo = parseStderrErrors(stderr);
    if (errorInfo.hasError) {
        // If only checking fatal errors, verify it's fatal
        if (fatalOnly && !hasFatalError(stderr)) {
            return undefined;
        }
        return createStderrError(stderr);
    }

    return undefined;
}
