import {
  DownloadKeyWord,
  DownloadOptions,
  StreamKeyWord,
  StreamOptions,
} from '../types';

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

export function parseDownloadOptions<T extends DownloadKeyWord>(
  format?: DownloadOptions<T>['format'] | string
) {
  if (!format) {
    return [];
  }

  if (typeof format === 'string') {
    return ['-f', format];
  }

  if (Object.keys(format).length === 0) {
    return ['-f', 'bv*+ba'];
  }

  let formatArr: string[] = [];
  const { filter, quality, type } = format;

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
    formatArr = [
      '-f',
      (quality ? ByQuality[quality as keyof typeof ByQuality] : 'bv*') + '+ba' + '[ext=' + (type ? type : 'mp4') + ']',
    ];
  }

  return formatArr;
}

export function parseStreamOptions<T extends StreamKeyWord>(
  format?: StreamOptions<T>['format'] | string
): string[] {
  if (!format) {
    return [];
  }

  if (typeof format === 'string') {
    return ['-f', format];
  }

  if (Object.keys(format).length === 0) {
    return ['-f', 'b*[vcode!=none][acodec!=none]'];
  }

  let formatArr: string[] = [];
  const { filter, quality } = format;

  if (filter === 'audioonly') {
    formatArr = ['-f', quality == 'lowest' ? 'wa' : 'ba'];
  }
  if (filter === 'videoonly') {
    formatArr = [
      '-f',
      (quality ? ByQuality[quality] : 'bv*') + '[acodec=none]',
    ];
  }
  if (filter === 'audioandvideo') {
    formatArr = [
      '-f',
      (quality == 'lowest' ? 'w*' : 'b*') + '[vcodec!=none][acodec!=none]',
    ];
  }

  return formatArr;
}

export function getContentType(
  format?: DownloadOptions<DownloadKeyWord>['format']
): string {
  if (!format || typeof format === 'string') {
    return 'video/mp4';
  }

  const { filter, type } = format as {
    filter: DownloadKeyWord;
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
  format?: DownloadOptions<DownloadKeyWord>['format']
): string {
  if (!format || typeof format === 'string') {
    return 'mp4';
  }

  const { filter, type } = format as { filter: DownloadKeyWord; type?: string };

  if (type) {
    return type;
  }

  return filter === 'audioonly' ? 'mp3' : 'mp4';
}
