import { FormatKeyWord, FormatOptions } from '../types';

const ByQuality = {
  '2160p': 'bv*[height<=2160]',
  '1440p': 'bv*[height<=1440]',
  '1080p': 'bv*[height<=1080]',
  '720p': 'bv*[height<=720]',
  '480p': 'bv*[height<=480]',
  '360p': 'bv*[height<=360]',
  '240p': 'bv*[height<=240]',
  '144p': 'bv*[height<=133]',
  highest: 'bv*',
  lowest: 'wv*',
};

const ByFilter = ['audioonly', 'videoonly', 'audioandvideo', 'mergevideo'];

export function parseFormatOptions<T extends FormatKeyWord>(
  format?: FormatOptions<T>['format'] | string,
) {
  let filter: string | undefined;
  let type: string | undefined;
  let quality: string | number | undefined;
  if (!format) {
    return [];
  }

  if (typeof format === 'string' && !ByFilter.includes(format)) {
    return ['-f', format];
  }

  if (typeof format === 'string' && ByFilter.includes(format)) {
    filter = format;
  }

  if (
    Object.keys(format).length === 0 ||
    !format ||
    typeof format !== 'object'
  ) {
    return ['-f', 'bv*+ba'];
  }

  if (typeof format === 'object') {
    filter = format.filter;
    type = format.type;
    quality = format.quality;
  }

  let formatArr: string[] = [];

  if (filter === 'audioonly') {
    formatArr = [
      '-x',
      '--audio-format',
      type ? type : 'mp3',
      '--audio-quality',
      quality ? quality.toString() : '5',
    ];
  }

  if (filter === 'videoonly') {
    formatArr = [
      '-f',
      (quality ? ByQuality[quality as keyof typeof ByQuality] : 'bv*') +
        '[acodec=none]',
    ];
  }

  if (filter === 'audioandvideo') {
    formatArr = [
      '-f',
      (quality == 'lowest' ? 'w*' : 'b*') +
        '[vcodec!=none][acodec!=none][ext=' +
        (type ? type : 'mp4') +
        ']',
    ];
  }

  if (filter === 'mergevideo') {
    const videoQuality = quality
      ? ByQuality[quality as keyof typeof ByQuality]
      : 'bv*';

    formatArr = ['-f', `${videoQuality}+ba`];

    if (type) {
      formatArr.push('--merge-output-format', type);
    }
  }

  return formatArr;
}

export function getContentType(
  format?: FormatOptions<FormatKeyWord>['format'],
): string {
  if (!format || typeof format === 'string') {
    return 'video/mp4';
  }

  const { filter, type } = format as {
    filter: FormatKeyWord;
    type?: string;
  };

  switch (filter) {
    case 'videoonly':
    case 'audioandvideo':
      switch (type) {
        case 'mp4':
          return 'video/mp4';
        case 'webm':
          return 'video/webm';
        default:
          return 'video/mp4';
      }
    case 'audioonly':
      switch (type) {
        case 'aac':
          return 'audio/aac';
        case 'flac':
          return 'audio/flac';
        case 'mp3':
          return 'audio/mp3';
        case 'm4a':
          return 'audio/mp4';
        case 'opus':
          return 'audio/opus';
        case 'vorbis':
          return 'audio/vorbis';
        case 'wav':
          return 'audio/wav';
        case 'alac':
          return 'audio/mp4';
        default:
          return 'audio/mpeg';
      }
    case 'mergevideo':
      switch (type) {
        case 'webm':
          return 'video/webm';
        case 'mkv':
          return 'video/x-matroska';
        case 'ogg':
          return 'video/ogg';
        case 'flv':
          return 'video/x-flv';
        default:
          return 'video/mp4';
      }
  }
}

export function getFileExtension(
  format?: FormatOptions<FormatKeyWord>['format'],
): string {
  if (!format || typeof format === 'string') {
    return 'mp4';
  }

  const { filter, type } = format as { filter: FormatKeyWord; type?: string };

  if (type) {
    return type;
  }

  return filter === 'audioonly' ? 'mp3' : 'mp4';
}

/**
 * Gets the content type when extractAudio option is used (legacy args style).
 * Fixes issue #43 where getFileAsync returns video MIME type for audio extraction.
 */
export function getContentTypeFromArgs(options?: {
  extractAudio?: boolean;
  audioFormat?: string;
}): string | null {
  if (!options?.extractAudio) {
    return null; // Not extracting audio, use default behavior
  }

  const audioFormat = options.audioFormat || 'mp3';
  switch (audioFormat) {
    case 'aac':
      return 'audio/aac';
    case 'flac':
      return 'audio/flac';
    case 'mp3':
      return 'audio/mpeg';
    case 'm4a':
      return 'audio/mp4';
    case 'opus':
      return 'audio/opus';
    case 'vorbis':
      return 'audio/vorbis';
    case 'wav':
      return 'audio/wav';
    case 'alac':
      return 'audio/mp4';
    default:
      return 'audio/mpeg';
  }
}

/**
 * Gets the file extension when extractAudio option is used.
 */
export function getFileExtensionFromArgs(options?: {
  extractAudio?: boolean;
  audioFormat?: string;
}): string | null {
  if (!options?.extractAudio) {
    return null;
  }
  return options.audioFormat || 'mp3';
}
