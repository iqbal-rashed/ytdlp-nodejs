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
      (quality ? ByQuality[quality as keyof typeof ByQuality] : 'bv*') + '+ba',
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
