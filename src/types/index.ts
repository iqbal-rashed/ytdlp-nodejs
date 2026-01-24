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

export type FormatArgs<F extends FormatKeyWord> =
  | {
      filter: F;
      quality?: QualityOptions[F];
      type?: TypeOptions[F];
    }
  | string;

export interface FormatOptions<F extends FormatKeyWord> extends Omit<
  ArgsOptions,
  'format' | 'progressTemplate'
> {
  format?: FormatArgs<F>;
  onProgress?: (p: VideoProgress) => void;
  /**
   * Callback fired with video info before download starts.
   * Uses yt-dlp's `before_dl` print hook.
   */
  beforeDownload?: (info: DownloadedVideoInfo) => void;
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
 * Video information returned after download (post-processing complete).
 */
export interface DownloadedVideoInfo {
  /** Video identifier */
  id: string;
  /** Video title */
  title: string;
  /** Video title ignoring live timestamp and generic title */
  fulltitle?: string;
  /** Video filename extension */
  ext?: string;
  /** A secondary title of the video */
  alt_title?: string;
  /** The description of the video */
  description?: string;
  /** An alternative identifier for the video */
  display_id?: string;
  /** Full name of the video uploader */
  uploader?: string;
  /** Nickname or id of the video uploader */
  uploader_id?: string;
  /** URL to the video uploader's profile */
  uploader_url?: string;
  /** License name the video is licensed under */
  license?: string;
  /** The creators of the video */
  creators?: string[];
  /** The creators of the video; comma-separated */
  creator?: string;
  /** UNIX timestamp of the moment the video became available */
  timestamp?: number;
  /** Video upload date in UTC (YYYYMMDD) */
  upload_date?: string;
  /** UNIX timestamp of the moment the video was released */
  release_timestamp?: number;
  /** The date (YYYYMMDD) when the video was released in UTC */
  release_date?: string;
  /** Year (YYYY) when the video or album was released */
  release_year?: number;
  /** UNIX timestamp of the moment the video was last modified */
  modified_timestamp?: number;
  /** The date (YYYYMMDD) when the video was last modified in UTC */
  modified_date?: string;
  /** Full name of the channel the video is uploaded on */
  channel?: string;
  /** Id of the channel */
  channel_id?: string;
  /** URL of the channel */
  channel_url?: string;
  /** Number of followers of the channel */
  channel_follower_count?: number;
  /** Whether the channel is verified on the platform */
  channel_is_verified?: boolean;
  /** Physical location where the video was filmed */
  location?: string;
  /** Length of the video in seconds */
  duration?: number;
  /** Length of the video (HH:mm:ss) */
  duration_string?: string;
  /** How many users have watched the video on the platform */
  view_count?: number;
  /** How many users are currently watching the video */
  concurrent_view_count?: number;
  /** Number of positive ratings of the video */
  like_count?: number;
  /** Number of negative ratings of the video */
  dislike_count?: number;
  /** Number of reposts of the video */
  repost_count?: number;
  /** Average rating given by users */
  average_rating?: number;
  /** Number of comments on the video */
  comment_count?: number;
  /** Number of times the video has been saved or bookmarked */
  save_count?: number;
  /** Age restriction for the video (years) */
  age_limit?: number;
  /** One of "not_live", "is_live", "is_upcoming", "was_live", "post_live" */
  live_status?: string;
  /** Whether this video is a live stream or a fixed-length video */
  is_live?: boolean;
  /** Whether this video was originally a live stream */
  was_live?: boolean;
  /** Whether the video is allowed to play in embedded players */
  playable_in_embed?: string;
  /** Whether the video is "private", "premium_only", "subscriber_only", "needs_auth", "unlisted" or "public" */
  availability?: string;
  /** The type of media as classified by the site */
  media_type?: string;
  /** Time in seconds where the reproduction should start */
  start_time?: number;
  /** Time in seconds where the reproduction should end */
  end_time?: number;
  /** Name of the extractor */
  extractor?: string;
  /** Key name of the extractor */
  extractor_key?: string;
  /** Unix epoch of when the information extraction was completed */
  epoch?: number;
  /** Number that will be increased with each download */
  autonumber?: number;
  /** Number that will be increased with each video */
  video_autonumber?: number;
  /** Total number of extracted items in the playlist */
  n_entries?: number;
  /** Identifier of the playlist that contains the video */
  playlist_id?: string;
  /** Name of the playlist that contains the video */
  playlist_title?: string;
  /** playlist_title if available or else playlist_id */
  playlist?: string;
  /** Total number of items in the playlist */
  playlist_count?: number;
  /** Index of the video in the playlist */
  playlist_index?: string;
  /** Position of the video in the playlist download queue */
  playlist_autonumber?: number;
  /** Full name of the playlist uploader */
  playlist_uploader?: string;
  /** Nickname or id of the playlist uploader */
  playlist_uploader_id?: string;
  /** Display name of the channel that uploaded the playlist */
  playlist_channel?: string;
  /** Identifier of the channel that uploaded the playlist */
  playlist_channel_id?: string;
  /** URL of the playlist webpage */
  playlist_webpage_url?: string;
  /** A URL to the video webpage */
  webpage_url?: string;
  /** The basename of the webpage URL */
  webpage_url_basename?: string;
  /** The domain of the webpage URL */
  webpage_url_domain?: string;
  /** The URL given by the user */
  original_url?: string;
  /** List of categories the video belongs to */
  categories?: string[];
  /** List of tags assigned to the video */
  tags?: string[];
  /** List of cast members */
  cast?: string[];
  /** Final filepath after post-processing */
  filepath?: string;
}

/**
 * Result returned by downloadAsync.
 */
export interface DownloadResult {
  /** Raw command output */
  output: string;
  /** Downloaded video/audio file path */
  filePaths: string[];
  /** Video information after download (including post-processing) */
  info?: DownloadedVideoInfo[];
}

/**
 * Result emitted by the 'finish' event on DownloadProcess.
 */
export interface DownloadFinishResult {
  /** Raw command output */
  output: string;
  /** Downloaded video/audio file paths */
  filePaths: string[];
  /** Video information after download (including post-processing) */
  info: DownloadedVideoInfo[];
  /** Stderr output */
  stderr: string;
}

/**
 * Event map for DownloadProcess events.
 */
export interface DownloadProcessEvents {
  progress: [progress: VideoProgress];
  finish: [result: DownloadFinishResult];
  close: [code: number | null, signal: NodeJS.Signals | null];
  disconnect: [];
  error: [err: Error];
  exit: [code: number | null, signal: NodeJS.Signals | null];
  message: [message: unknown, sendHandle: unknown];
  spawn: [];
}

/**
 * Typed ChildProcess for download operations with progress and finish events.
 * Returned by YtDlp.download() method.
 */
export interface DownloadProcess {
  /** Adds a listener for the specified event. */
  on<K extends keyof DownloadProcessEvents>(
    event: K,
    listener: (...args: DownloadProcessEvents[K]) => void,
  ): this;
  /** Adds a one-time listener for the specified event. */
  once<K extends keyof DownloadProcessEvents>(
    event: K,
    listener: (...args: DownloadProcessEvents[K]) => void,
  ): this;
  /** Removes a listener for the specified event. */
  off<K extends keyof DownloadProcessEvents>(
    event: K,
    listener: (...args: DownloadProcessEvents[K]) => void,
  ): this;
  /** Removes a listener for the specified event. */
  removeListener<K extends keyof DownloadProcessEvents>(
    event: K,
    listener: (...args: DownloadProcessEvents[K]) => void,
  ): this;
  /** Adds a listener to the beginning of the listeners array. */
  prependListener<K extends keyof DownloadProcessEvents>(
    event: K,
    listener: (...args: DownloadProcessEvents[K]) => void,
  ): this;
  /** Adds a one-time listener to the beginning of the listeners array. */
  prependOnceListener<K extends keyof DownloadProcessEvents>(
    event: K,
    listener: (...args: DownloadProcessEvents[K]) => void,
  ): this;
  /** Emits an event with the specified arguments. */
  emit<K extends keyof DownloadProcessEvents>(
    event: K,
    ...args: DownloadProcessEvents[K]
  ): boolean;
  /** Returns the number of listeners for the specified event. */
  listenerCount(event: keyof DownloadProcessEvents): number;
  /** Returns a copy of the array of listeners for the specified event. */
  listeners(
    event: keyof DownloadProcessEvents,
  ): ((...args: unknown[]) => void)[];
  /** Removes all listeners, or those of the specified event. */
  removeAllListeners(event?: keyof DownloadProcessEvents): this;
  /** Kills the child process. */
  kill(signal?: NodeJS.Signals | number): boolean;
  /** The process identifier (PID) of the child process. */
  readonly pid: number | undefined;
  /** Whether the process is connected. */
  readonly connected: boolean;
  /** Standard input stream. */
  readonly stdin: import('stream').Writable | null;
  /** Standard output stream. */
  readonly stdout: import('stream').Readable | null;
  /** Standard error stream. */
  readonly stderr: import('stream').Readable | null;
  /** Exit code of the child process. */
  readonly exitCode: number | null;
  /** Signal that terminated the process. */
  readonly signalCode: NodeJS.Signals | null;
  /** Whether the child process was spawned successfully. */
  readonly spawnfile: string;
  /** Arguments used to spawn the child process. */
  readonly spawnargs: string[];
  /** Whether the process has been killed. */
  readonly killed: boolean;
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

export interface YtDlpContext {
  /** Path to the yt-dlp binary */
  binaryPath: string;
  /** Optional path to the FFmpeg binary */
  ffmpegPath?: string;
}
