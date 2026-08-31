import { FormatKeyWord, FormatOptions } from '../types';

const ByQuality: Record<string, string> = {
  '2160p': 'bv*[height<=2160]',
  '1440p': 'bv*[height<=1440]',
  '1080p': 'bv*[height<=1080]',
  '720p': 'bv*[height<=720]',
  '480p': 'bv*[height<=480]',
  '360p': 'bv*[height<=360]',
  '240p': 'bv*[height<=240]',
  '144p': 'bv*[height<=133]',
  best: 'bv*',
  worst: 'wv*',
  highest: 'bv*',
  lowest: 'wv*',
};

const FilterSet = new Set(['audioonly', 'videoonly', 'audioandvideo', 'mergevideo']);
const bestExpr = 'bestvideo+bestaudio/best';
const worstExpr = 'worstvideo+worstaudio/worst';

export function parseFormatOptions<T extends FormatKeyWord>(format?: FormatOptions<T>['format'] | string) {
  if (!format) return [];

  if (typeof format === 'string') {
    if (format === 'best') return ['-f', bestExpr];
    if (format === 'worst') return ['-f', worstExpr];
    if (!FilterSet.has(format)) return ['-f', format];
  }

  if (typeof format === 'string' && FilterSet.has(format)) {
    // bare filter keyword -> treat as filter object with defaults
    if (format === 'audioonly') return ['-x', '--audio-format', 'mp3', '--audio-quality', '5'];
    if (format === 'videoonly') return ['-f', 'bv*[acodec=none]'];
    if (format === 'audioandvideo') return ['-f', 'b*[vcodec!=none][acodec!=none][ext=mp4]'];
    if (format === 'mergevideo') return ['-f', 'bv*+ba'];
  }

  if (!format || typeof format !== 'object' || Object.keys(format).length === 0) return ['-f', 'bv*+ba'];

  const { filter, type, quality } = format as { filter?: string; type?: string; quality?: string | number };

  if (filter === 'audioonly') return ['-x', '--audio-format', type || 'mp3', '--audio-quality', quality?.toString() || '5'];
  if (filter === 'videoonly') return ['-f', `${quality ? ByQuality[quality as string] || 'bv*' : 'bv*'}[acodec=none]`];
  if (filter === 'audioandvideo')
    return ['-f', `${quality === 'lowest' ? 'w*' : 'b*'}[vcodec!=none][acodec!=none][ext=${type || 'mp4'}]`];
  if (filter === 'mergevideo') {
    const expr = quality === 'best' ? bestExpr : quality === 'worst' ? worstExpr : `${quality ? ByQuality[quality as string] || 'bv*' : 'bv*'}+ba`;
    return type ? ['-f', expr, '--merge-output-format', type] : ['-f', expr];
  }

  return [];
}

export function getContentType(format?: FormatOptions<FormatKeyWord>['format']): string {
  if (!format || typeof format === 'string') return 'video/mp4';
  const { filter, type } = format as { filter: FormatKeyWord; type?: string };
  switch (filter) {
    case 'videoonly':
    case 'audioandvideo':
      return type === 'webm' ? 'video/webm' : 'video/mp4';
    case 'audioonly':
      return (
        ({ aac: 'audio/aac', flac: 'audio/flac', mp3: 'audio/mp3', m4a: 'audio/mp4', opus: 'audio/opus', vorbis: 'audio/vorbis', wav: 'audio/wav', alac: 'audio/mp4' } as Record<string, string>)[type || ''] || 'audio/mpeg'
      );
    case 'mergevideo':
      return ({ webm: 'video/webm', mkv: 'video/x-matroska', ogg: 'video/ogg', flv: 'video/x-flv' } as Record<string, string>)[type || ''] || 'video/mp4';
  }
}

export function getFileExtension(format?: FormatOptions<FormatKeyWord>['format']): string {
  if (!format || typeof format === 'string') return 'mp4';
  const { filter, type } = format as { filter: FormatKeyWord; type?: string };
  return type || (filter === 'audioonly' ? 'mp3' : 'mp4');
}

export function getContentTypeFromArgs(options?: { extractAudio?: boolean; audioFormat?: string }): string | null {
  if (!options?.extractAudio) return null;
  const m: Record<string, string> = { aac: 'audio/aac', flac: 'audio/flac', mp3: 'audio/mpeg', m4a: 'audio/mp4', opus: 'audio/opus', vorbis: 'audio/vorbis', wav: 'audio/wav', alac: 'audio/mp4' };
  return m[options.audioFormat || 'mp3'] || 'audio/mpeg';
}

export function getFileExtensionFromArgs(options?: { extractAudio?: boolean; audioFormat?: string }): string | null {
  return options?.extractAudio ? options.audioFormat || 'mp3' : null;
}
