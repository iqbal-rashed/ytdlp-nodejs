import { ArgsOptions } from './ArgsOptions';

export { ArgsOptions };

export interface YtDlpOptions {
  binaryPath?: string;
  ffmpegPath?: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  formats: VideoFormat[];
  thumbnails: VideoThumbnail[];
  thumbnail: string;
  description: string;
  upload_date: string;
  uploader: string;
  uploader_id: string;
  uploader_url: string;
  channel_id: string;
  channel_url: string;
  duration: number;
  view_count: number;

  categories: string[];
  tags: string[];
  subtitles: Subtitles;
  automatic_captions: Subtitles;
  _type: 'video';

  average_rating: number;
  age_limit: number;
  webpage_url: string;
  playable_in_embed: boolean;
  live_status: string;
  media_type: object;
  release_timestamp: object;
  _format_sort_fields: object;
  comment_count: number;
  chapters: { start_time: number; title: string; end_time: number }[];
  heatmap: object;
  like_count: number;
  channel: string;
  channel_follower_count: number;
  channel_is_verified: boolean;
  timestamp: number;
  availability: string;
  original_url: string;
  webpage_url_basename: string;
  webpage_url_domain: string;
  extractor: string;
  extractor_key: string;
  playlist: object;
  playlist_index: object;
  display_id: string;
  fulltitle: string;
  duration_string: string;
  release_year: object;
  is_live: boolean;
  was_live: boolean;
  requested_subtitles: object;
  _has_drm: object;
  epoch: number;
  requested_downloads: object[];
  asr: number;
  filesize: number;
  format_id: string;
  format_note: string;
  source_preference: number;
  fps: number;
  audio_channels: number;
  height: number;
  quality: number;
  has_drm: boolean;
  tbr: number;
  filesize_approx: number;
  url: string;
  width: number;
  language: string;
  language_preference: number;
  preference: object;
  ext: string;
  vcodec: string;
  acodec: string;
  dynamic_range: string;
  downloader_options: {
    [v: string]: string | number;
  };
  protocol: string;
  video_ext: string;
  audio_ext: string;
  vbr: object;
  abr: object;
  resolution: string;
  aspect_ratio: number;
  http_headers: {
    [v: string]: string;
  };
  format: string;
  _version: object;
}

interface Subtitles {
  [k: string]: { ext: string; url: string; name: string }[];
}

export type InfoType = 'video' | 'playlist';

export interface PlaylistInfo {
  id: string;
  title: string;
  _type: 'playlist';
  entries: VideoInfo[];
  webpage_url: string;
  original_url: string;
  webpage_url_basename: string;
  webpage_url_domain: null | string;
  extractor: string;
  extractor_key: string;
  release_year: null | string;
  playlist_count: number;
  epoch: number;
}

export interface VideoThumbnail {
  id: number;
  width?: string | number;
  height?: string | number;
  url: string;
}

export interface VideoFormat {
  format_id: string;
  format_note?: string;
  ext: string;
  url: string;
  width?: number;
  height?: number;
  resolution?: string;
  filesize?: number;
  tbr?: number;
  protocol: string;
  vcodec: string;
  acodec: string;
}

export interface VideoProgress {
  /** Output filename (may be '-' when streaming to stdout) */
  filename: string;
  /** Current status: 'downloading' during download, 'finished' when complete */
  status: 'downloading' | 'finished';
  /** Downloaded bytes (may be undefined when streaming) */
  downloaded?: number;
  /** Formatted downloaded bytes string */
  downloaded_str?: string;
  /** Total bytes (may be undefined when file size is unknown) */
  total?: number;
  /** Formatted total bytes string */
  total_str?: string;
  /** Download speed in bytes/sec (may be undefined) */
  speed?: number;
  /** Formatted speed string */
  speed_str?: string;
  /** Estimated time remaining in seconds */
  eta?: number;
  /** Formatted ETA string */
  eta_str?: string;
  /** Download percentage (0-100, may be undefined when total is unknown) */
  percentage?: number;
  /** Formatted percentage string */
  percentage_str?: string;
}

export type VideoQuality =
  | 'best'
  | '2160p'
  | '1440p'
  | '1080p'
  | '720p'
  | '480p'
  | '360p'
  | '240p'
  | '144p'
  | 'highest'
  | 'lowest';

export type QualityOptions = {
  videoonly: VideoQuality;
  audioonly: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  audioandvideo: 'highest' | 'lowest';
  mergevideo: VideoQuality;
};

export type AudioFormat =
  | 'aac'
  | 'flac'
  | 'mp3'
  | 'm4a'
  | 'opus'
  | 'vorbis'
  | 'wav'
  | 'alac';

export type TypeOptions = {
  videoonly: 'mp4' | 'webm';
  audioandvideo: 'mp4' | 'webm';
  mergevideo: 'mkv' | 'mp4' | 'ogg' | 'webm' | 'flv';
  audioonly: AudioFormat;
};

export type FormatKeyWord = keyof QualityOptions;

export interface FormatOptions<F extends FormatKeyWord> extends Omit<
  ArgsOptions,
  'format' | 'progressTemplate'
> {
  format?:
    | {
        filter: F;
        quality?: QualityOptions[F];
        type?: TypeOptions[F];
      }
    | string;
  onProgress?: (p: VideoProgress) => void;
  /**
   * When true, adds `--print after_move:filepath` to capture final output paths.
   */
  printPaths?: boolean;
  /**
   * Callback fired with final output paths when `printPaths` is enabled.
   */
  onPaths?: (paths: string[]) => void;
}

export type PipeResponse = {
  promise: Promise<string>;
  pipe: (
    destination: NodeJS.WritableStream,
    options?: {
      end?: boolean;
    },
  ) => NodeJS.WritableStream;
  pipeAsync: (
    destination: NodeJS.WritableStream,
    options?: {
      end?: boolean;
    },
  ) => Promise<NodeJS.WritableStream>;
};

export interface FileMetadata {
  name: string;
  type: string;
  size?: number;
}

export interface GetFileOptions<
  F extends FormatKeyWord,
> extends FormatOptions<F> {
  filename?: string;
  metadata?: FileMetadata;
}

export interface InfoOptions {
  /**
   * If `true`, returns a flat list with limited information for playlist items.
   * If `false`, fetches full information for each video in the playlist.
   * @default true
   */
  flatPlaylist?: boolean;

  /**
   * A string of cookies to use for authentication.
   */
  cookies?: string;

  /**
   * Use cookies automatically fetched from the browser.
   */
  cookiesFromBrowser?: string;

  /**
   * Disable using cookies from the browser.
   */
  noCookiesFromBrowser?: boolean;

  /**
   * Disable cookies entirely (overrides other cookie options).
   */
  noCookies?: boolean;
}

export type FormatTableRow = {
  formatId: string;
  extension: string;
  resolution: string;
  note: string;
  raw: string;
};

export type FormatTable = {
  headers: string[];
  rows: FormatTableRow[];
  raw: string;
};

export type FormatsResult =
  | {
      source: 'json';
      info: VideoInfo | PlaylistInfo;
      formats: VideoFormat[];
    }
  | {
      source: 'table';
      table: FormatTable;
    };

export type UpdateResult = {
  method: 'built-in' | 'download';
  binaryPath: string;
  version?: string;
  verified?: boolean;
};

/**
 * Result returned by downloadAsync.
 */
export interface DownloadResult {
  /** Raw command output */
  output: string;
  /** Downloaded video/audio file paths */
  filePaths: string[];
  /** Downloaded thumbnail paths (when writeThumbnail is true) */
  thumbnailPaths: string[];
  /** Downloaded subtitle paths (when writeSubs is true) */
  subtitlePaths: string[];
}

/**
 * Information about available subtitles.
 */
export interface SubtitleInfo {
  language: string;
  languages: string[];
  ext: string;
  autoCaption: boolean;
}
