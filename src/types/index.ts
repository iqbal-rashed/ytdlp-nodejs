export interface ArgsOptions {
  // General Options
  printHelp?: boolean;
  printVersion?: boolean;
  update?: boolean;
  noUpdate?: boolean;
  updateTo?: string;
  ignoreErrors?: boolean;
  noAbortOnError?: boolean;
  abortOnError?: boolean;
  dumpUserAgent?: boolean;
  listExtractors?: boolean;
  extractorDescriptions?: boolean;
  useExtractors?: string[];
  defaultSearch?: string;
  ignoreConfig?: boolean;
  noConfigLocations?: boolean;
  configLocations?: string[];
  pluginDirs?: string[];
  noPluginDirs?: boolean;
  flatPlaylist?: boolean;
  noFlatPlaylist?: boolean;
  liveFromStart?: boolean;
  noLiveFromStart?: boolean;
  waitForVideo?: number;
  noWaitForVideo?: boolean;
  markWatched?: boolean;
  noMarkWatched?: boolean;
  color?: string;
  compatOptions?: string[];
  aliases?: string[];

  // Network Options
  proxy?: string;
  socketTimeout?: number;
  sourceAddress?: string;
  forceIpv4?: boolean;
  forceIpv6?: boolean;
  impersonate?: string[];
  listImpersonateTargets?: boolean;
  enableFileUrls?: boolean;

  // Geo-restriction
  geoVerificationProxy?: string;
  xff?: string;

  // Video Selection
  playlistItems?: string;
  minFilesize?: string;
  maxFilesize?: string;
  date?: string;
  dateBefore?: string;
  dateAfter?: string;
  matchFilter?: string;
  noMatchFilters?: boolean;
  breakMatchFilters?: string;
  noBreakMatchFilters?: boolean;
  noPlaylist?: boolean;
  yesPlaylist?: boolean;
  ageLimit?: number;
  downloadArchive?: string;
  noDownloadArchive?: boolean;
  maxDownloads?: number;
  breakOnExisting?: boolean;
  noBreakOnExisting?: boolean;
  breakPerInput?: boolean;
  noBreakPerInput?: boolean;
  skipPlaylistAfterErrors?: number;

  // Download Options
  concurrentFragments?: number;
  throttledRate?: string;
  fileAccessRetries?: number;
  retrySleep?: number;
  noKeepFragments?: boolean;
  resizeBuffer?: boolean;
  noResizeBuffer?: boolean;
  lazyPlaylist?: boolean;
  noLazyPlaylist?: boolean;
  noHlsUseMpegts?: boolean;
  downloadSections?: string;
  downloader?: string;
  downloaderArgs?: string;

  playlistStart?: number;
  playlistEnd?: number;

  matchTitle?: string;
  rejectTitle?: string;
  includeAds?: boolean;
  limitRate?: string;

  breakOnReject?: boolean;

  noDownload?: boolean;
  playlistReverse?: boolean;
  playlistRandom?: boolean;
  xattrSetFilesize?: boolean;
  hlsSplitDiscontinuity?: boolean;

  geoBypass?: boolean;
  geoBypassCountry?: string;
  geoBypassIpBlock?: string;

  batchFile?: string;

  // Download Options
  retries?: number;
  fragmentRetries?: number;
  skipUnavailableFragments?: boolean;
  abortOnUnavailableFragment?: boolean;
  keepFragments?: boolean;
  bufferSize?: string;
  noResumeDl?: boolean;
  continueDownload?: boolean;
  noContinue?: boolean;

  cookiesFromBrowser?: string;
  noCookies?: boolean;
  extractorRetries?: number;
  allowDynamicMpd?: boolean;
  hlsUseMpegts?: boolean;
  httpChunkSize?: string;

  // Filesystem Options
  trimFileNames?: number;
  noRestrictFilenames?: boolean;
  noWindowsFilenames?: boolean;
  continue?: boolean;

  part?: boolean;
  noPart?: boolean;
  mtime?: boolean;
  noMtime?: boolean;
  writeDescription?: boolean;
  noWriteDescription?: boolean;
  writeInfoJson?: boolean;
  noWriteInfoJson?: boolean;
  writePlaylistMetafiles?: boolean;
  noWritePlaylistMetafiles?: boolean;
  cleanInfoJson?: boolean;
  noCleanInfoJson?: boolean;
  writeComments?: boolean;
  noWriteComments?: boolean;
  loadInfoJson?: string;
  cookies?: string;

  noCookiesFromBrowser?: boolean;
  cacheDir?: string;
  noCacheDir?: boolean;
  rmCacheDir?: boolean;
  paths?: { [key: string]: string } | string;
  output?: string;
  outputNaPlaceholder?: string;
  restrictFilenames?: boolean;
  windowsFilenames?: boolean;
  noOverwrites?: boolean;
  forceOverwrites?: boolean;
  noForceOverwrites?: boolean;
  autonumberStart?: number;
  noPartFiles?: boolean;

  noBatchFile?: boolean;

  // Thumbnail Options
  writeThumbnail?: boolean;
  writeAllThumbnails?: boolean;
  noWriteThumbnails?: boolean;
  convertThumbnails?: string;

  // Internet Shortcut Options
  writeLink?: boolean;
  writeUrlLink?: boolean;
  writeWeblocLink?: boolean;
  writeLnkLink?: boolean;
  writeDesktopLink?: boolean;

  // Verbosity and Simulation Options
  quiet?: boolean;
  noWarnings?: boolean;
  simulate?: boolean;
  noSimulate?: boolean;
  ignoreNoFormatsError?: boolean;
  ignoreEoFError?: boolean;
  noIgnoreEoFError?: boolean;

  noColor?: boolean;
  printTraffic?: boolean;
  consoleTitle?: boolean;
  verbose?: boolean;
  noQuiet?: boolean;
  noIgnoreNoFormatsError?: boolean;
  noProgress?: boolean;
  progress?: boolean;

  dumpSingleJson?: boolean;
  dumpJson?: boolean;
  printJson?: boolean;
  skipDownload?: boolean;
  print?: string;
  printToFile?: string;
  forceWriteArchive?: boolean;
  newline?: boolean;
  progressTemplate?: string;
  progressDelta?: number;

  // Workarounds
  encoding?: string;
  legacyServerConnect?: boolean;
  noCheckCertificates?: boolean;
  preferInsecure?: boolean;
  addHeaders?: { [key: string]: string };
  binPath?: string;
  // Workaround Options
  bidiWorkaround?: boolean;
  sleepRequests?: number;
  sleepInterval?: number;
  maxSleepInterval?: number;
  sleepSubtitles?: number;

  // Video Format Options
  format?: string;
  formatSort?: string[];
  formatSortForce?: boolean;
  noFormatSortForce?: boolean;
  audioFormat?: string;
  videoFormat?: string;
  preferFreeFormats?: boolean;
  noPreferFreeFormats?: boolean;
  ytdlpForceKeyframes?: boolean;
  mergeOutputFormat?: string;
  videoMultiStreams?: boolean;
  noVideoMultiStreams?: boolean;
  audioMultiStreams?: boolean;
  noAudioMultiStreams?: boolean;
  checkFormats?: boolean;
  checkAllFormats?: boolean;
  noCheckFormats?: boolean;

  // Subtitle Options
  writeSubs?: boolean;
  writeAutoSubs?: boolean;
  writeAllSubs?: boolean;
  noWriteSubs?: boolean;
  listSubs?: boolean;
  subFormat?: string;
  subLangs?: string[];

  // Authentication Options
  username?: string;
  password?: string;
  twoFactor?: string;
  netrc?: boolean;
  videoPassword?: string;
  netrcLocation?: string;
  netrcCmd?: string;
  apListMso?: boolean;
  clientCertificate?: string;
  clientCertificateKey?: string;
  clientCertificatePassword?: string;

  // Adobe Pass Options
  apMso?: string;
  apUsername?: string;
  apPassword?: string;

  // Post-Processing Options
  extractAudio?: boolean;

  audioQuality?: string;
  remuxVideo?: string;
  recodeVideo?: string;
  postprocessorArgs?: { [key: string]: string[] };
  keepVideo?: boolean;
  noKeepVideo?: boolean;
  postOverwrites?: boolean;
  noPostOverwrites?: boolean;
  embedSubs?: boolean;
  noEmbedSubs?: boolean;
  embedThumbnail?: boolean;
  noEmbedThumbnail?: boolean;
  embedMetadata?: boolean;
  noEmbedMetadata?: boolean;
  embedChapters?: boolean;
  noEmbedChapters?: boolean;
  embedInfoJson?: boolean;
  noEmbedInfoJson?: boolean;
  parseMetadata?: { [key: string]: string };
  replaceInMetadata?: { [key: string]: [string, string] };
  xattrs?: boolean;
  concatPlaylist?: string;
  fixup?: string;
  ffmpegLocation?: string;
  exec?: string;
  noExec?: boolean;
  convertSubs?: string;
  splitChapters?: boolean;
  noSplitChapters?: boolean;
  removeChapters?: string;
  noRemoveChapters?: boolean;
  forceKeyframesAtCuts?: boolean;
  noForceKeyframesAtCuts?: boolean;
  usePostProcessor?: string[];

  // SponsorBlock Options
  sponsorblockMark?: string[];
  sponsorblockRemove?: string[];
  sponsorblockChapterTitle?: string;
  noSponsorblock?: boolean;
  sponsorblockApi?: string;

  // Extractor Options

  extractorArgs?: { [key: string]: string[] };

  ignoreDynamicMpd?: boolean;
  dumpPages?: boolean;

  noHlsSplitDiscontinuity?: boolean;

  // Debug Options
  referer?: string;
  userAgent?: string;

  headers?: { [key: string]: string };
  debugPrintCommandLine?: boolean;

  // Information Options

  writePages?: boolean; // --write-pages

  // Standard Options
  listFormats?: boolean; // -F, --list-formats
  listThumbnails?: boolean; // --list-thumbnails

  // Additional raw options
  additionalOptions?: string[];
}

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
  average_rating: number;
  categories: string[];
  tags: string[];
}

export interface VideoThumbnail {
  id: number;
  width?: string | number;
  height?: string | number;
  url: string;
}

export interface VideoFormat {
  format_id: string;
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
  status: 'downloading' | 'finished';
  downloaded: number;
  downloaded_str: string;
  total: number;
  total_str: string;
  speed: number;
  speed_str: string;
  eta: number;
  eta_str: string;
  percentage: number;
  percentage_str: string;
}

type VideoQuality =
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

type DownloadQualityOptions = {
  videoonly: VideoQuality;
  audioonly: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  audioandvideo: 'highest' | 'lowest';
  mergevideo: VideoQuality;
};

type DownloadTypeOptions = {
  videoonly: 'mp4' | 'webm';
  audioandvideo: 'mp4' | 'webm';
  mergevideo: 'mkv' | 'mp4' | 'ogg' | 'webm' | 'flv';
  audioonly:
    | 'aac'
    | 'flac'
    | 'mp3'
    | 'm4a'
    | 'opus'
    | 'vorbis'
    | 'wav'
    | 'alac';
};

export type DownloadKeyWord = keyof DownloadQualityOptions;
export type StreamKeyWord = keyof StreamQualityOptions;

type StreamQualityOptions = {
  videoonly: VideoQuality;
  audioonly: 'highest' | 'lowest';
  audioandvideo: 'highest' | 'lowest';
};

export interface DownloadOptions<F extends DownloadKeyWord>
  extends Omit<ArgsOptions, 'format' | 'progressTemplate'> {
  format?:
    | {
        filter: F;
        quality?: DownloadQualityOptions[F];
        type?: DownloadTypeOptions[F];
      }
    | string;
  onProgress?: (p: VideoProgress) => void;
}

export interface StreamOptions<F extends StreamKeyWord>
  extends Omit<ArgsOptions, 'format' | 'progressTemplate' | 'output'> {
  format?: { filter: F; quality?: StreamQualityOptions[F] } | string;
  onProgress?: (p: VideoProgress) => void;
}

export type PipeResponse = {
  pipe: (
    destination: NodeJS.WritableStream,
    options?: {
      end?: boolean;
    }
  ) => NodeJS.WritableStream;
  promisePipe: (
    destination: NodeJS.WritableStream,
    options?: {
      end?: boolean;
    }
  ) => Promise<NodeJS.WritableStream>;
};
