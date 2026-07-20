import { FormatKeyWord, FormatOptions } from '../types';
export declare function parseFormatOptions<T extends FormatKeyWord>(format?: FormatOptions<T>['format'] | string): string[];
export declare function getContentType(format?: FormatOptions<FormatKeyWord>['format']): string;
export declare function getFileExtension(format?: FormatOptions<FormatKeyWord>['format']): string;
/**
 * Gets the content type when extractAudio option is used (legacy args style).
 * Fixes issue #43 where getFileAsync returns video MIME type for audio extraction.
 */
export declare function getContentTypeFromArgs(options?: {
    extractAudio?: boolean;
    audioFormat?: string;
}): string | null;
/**
 * Gets the file extension when extractAudio option is used.
 */
export declare function getFileExtensionFromArgs(options?: {
    extractAudio?: boolean;
    audioFormat?: string;
}): string | null;
