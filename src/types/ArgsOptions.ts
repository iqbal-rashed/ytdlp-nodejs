/**
 * yt-dlp command-line options mapped to TypeScript.
 * @see https://github.com/yt-dlp/yt-dlp#usage-and-options
 */
export interface ArgsOptions {
  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Print help text and exit. Maps to `--help`. */
  printHelp?: boolean;

  /** Print program version and exit. Maps to `--version`. */
  printVersion?: boolean;

  /** Update yt-dlp to the latest version. Maps to `--update`. */
  update?: boolean;

  /** Do not check for updates. Maps to `--no-update`. */
  noUpdate?: boolean;

  /** Update to a specific version. Maps to `--update-to TAG`. */
  updateTo?: string;

  /** Continue on download errors. Maps to `--ignore-errors`. */
  ignoreErrors?: boolean;

  /** Continue with next video after error. Maps to `--no-abort-on-error`. */
  noAbortOnError?: boolean;

  /** Abort on download error. Maps to `--abort-on-error`. */
  abortOnError?: boolean;

  /** Display current browser user-agent. Maps to `--dump-user-agent`. */
  dumpUserAgent?: boolean;

  /** List all supported extractors. Maps to `--list-extractors`. */
  listExtractors?: boolean;

  /** Output descriptions of all extractors. Maps to `--extractor-descriptions`. */
  extractorDescriptions?: boolean;

  /** Use only specific extractors. Maps to `--use-extractors NAMES`. */
  useExtractors?: string[];

  /** Use this prefix for search queries. Maps to `--default-search PREFIX`. */
  defaultSearch?: string;

  /** Don't read configuration files. Maps to `--ignore-config`. */
  ignoreConfig?: boolean;

  /** Don't load config from default locations. Maps to `--no-config-location`. */
  noConfigLocations?: boolean;

  /** Location of the main config file. Maps to `--config-locations PATH`. */
  configLocations?: string[];

  /** Directories to load plugins from. Maps to `--plugin-dirs PATH`. */
  pluginDirs?: string[];

  /** Disable loading plugins. Maps to `--no-plugin-dirs`. */
  noPluginDirs?: boolean;

  /** Don't extract videos of a playlist. Maps to `--flat-playlist`. */
  flatPlaylist?: boolean;

  /** Extract videos of a playlist. Maps to `--no-flat-playlist`. */
  noFlatPlaylist?: boolean;

  /** Download livestreams from the start. Maps to `--live-from-start`. */
  liveFromStart?: boolean;

  /** Don't download from the start. Maps to `--no-live-from-start`. */
  noLiveFromStart?: boolean;

  /** Wait seconds for a video to become available. Maps to `--wait-for-video SEC`. */
  waitForVideo?: number;

  /** Don't wait for video. Maps to `--no-wait-for-video`. */
  noWaitForVideo?: boolean;

  /** Mark videos watched on YouTube. Maps to `--mark-watched`. */
  markWatched?: boolean;

  /** Don't mark videos watched. Maps to `--no-mark-watched`. */
  noMarkWatched?: boolean;

  /** Color output (always, never, auto, no_color). Maps to `--color WHEN`. */
  color?: string;

  /** Options to adjust behavior. Maps to `--compat-options OPTS`. */
  compatOptions?: string[];

  /** Command aliases. Maps to `--alias ALIAS CMD`. */
  aliases?: string[];

  /**
   * JavaScript runtime for extractors requiring JS execution.
   * Supported values: 'deno', 'node', 'phantomjs', etc.
   * Maps to `--js-runtime RUNTIME`.
   * @see https://github.com/yt-dlp/yt-dlp/wiki/EJS
   */
  jsRuntime?: string;

  // ═══════════════════════════════════════════════════════════════════════════
  // NETWORK OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Use the specified HTTP/HTTPS/SOCKS proxy. Maps to `--proxy URL`. */
  proxy?: string;

  /** Time to wait before giving up (seconds). Maps to `--socket-timeout SEC`. */
  socketTimeout?: number;

  /** Client-side IP address to bind to. Maps to `--source-address IP`. */
  sourceAddress?: string;

  /** Make all connections via IPv4. Maps to `--force-ipv4`. */
  forceIpv4?: boolean;

  /** Make all connections via IPv6. Maps to `--force-ipv6`. */
  forceIpv6?: boolean;

  /** Client to impersonate for requests. Maps to `--impersonate CLIENT`. */
  impersonate?: string[];

  /** List available clients to impersonate. Maps to `--list-impersonate-targets`. */
  listImpersonateTargets?: boolean;

  /** Enable file:// URLs. Maps to `--enable-file-urls`. */
  enableFileUrls?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // GEO-RESTRICTION OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Proxy for geo verification. Maps to `--geo-verification-proxy URL`. */
  geoVerificationProxy?: string;

  /** How to fake X-Forwarded-For header. Maps to `--xff VALUE`. */
  xff?: string;

  /** Bypass geographic restriction. Maps to `--geo-bypass`. */
  geoBypass?: boolean;

  /** Force bypass with a two-letter country code. Maps to `--geo-bypass-country CODE`. */
  geoBypassCountry?: string;

  /** Force bypass with an IP block. Maps to `--geo-bypass-ip-block IP_BLOCK`. */
  geoBypassIpBlock?: string;

  // ═══════════════════════════════════════════════════════════════════════════
  // VIDEO SELECTION OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Playlist items to download (e.g., "1,3,5-7"). Maps to `--playlist-items ITEM_SPEC`. */
  playlistItems?: string;

  /** Don't download files smaller than SIZE. Maps to `--min-filesize SIZE`. */
  minFilesize?: string;

  /** Don't download files larger than SIZE. Maps to `--max-filesize SIZE`. */
  maxFilesize?: string;

  /** Download only videos uploaded on this date. Maps to `--date DATE`. */
  date?: string;

  /** Download only videos uploaded before this date. Maps to `--datebefore DATE`. */
  dateBefore?: string;

  /** Download only videos uploaded after this date. Maps to `--dateafter DATE`. */
  dateAfter?: string;

  /** Generic video filter. Maps to `--match-filter FILTER`. */
  matchFilter?: string;

  /** Do not use any --match-filter. Maps to `--no-match-filters`. */
  noMatchFilters?: boolean;

  /** Stop on filter match. Maps to `--break-match-filters FILTER`. */
  breakMatchFilters?: string;

  /** Do not --break-match-filters. Maps to `--no-break-match-filters`. */
  noBreakMatchFilters?: boolean;

  /** Download only the video for a single URL. Maps to `--no-playlist`. */
  noPlaylist?: boolean;

  /** Download the playlist if URL is a video and playlist. Maps to `--yes-playlist`. */
  yesPlaylist?: boolean;

  /** Download only videos suitable for the given age. Maps to `--age-limit YEARS`. */
  ageLimit?: number;

  /** Download only videos not in the archive. Maps to `--download-archive FILE`. */
  downloadArchive?: string;

  /** Do not use archive file. Maps to `--no-download-archive`. */
  noDownloadArchive?: boolean;

  /** Maximum number of files to download. Maps to `--max-downloads NUMBER`. */
  maxDownloads?: number;

  /** Stop if video is in archive. Maps to `--break-on-existing`. */
  breakOnExisting?: boolean;

  /** Do not stop on existing. Maps to `--no-break-on-existing`. */
  noBreakOnExisting?: boolean;

  /** Reset per input URL. Maps to `--break-per-input`. */
  breakPerInput?: boolean;

  /** Do not reset per input. Maps to `--no-break-per-input`. */
  noBreakPerInput?: boolean;

  /** Skip rest of playlist after N errors. Maps to `--skip-playlist-after-errors N`. */
  skipPlaylistAfterErrors?: number;

  /** Playlist video to start at (1-indexed). Maps to `--playlist-start NUMBER`. */
  playlistStart?: number;

  /** Playlist video to end at (1-indexed). Maps to `--playlist-end NUMBER`. */
  playlistEnd?: number;

  /** Download only videos whose title matches regex. Maps to `--match-title REGEX`. */
  matchTitle?: string;

  /** Skip videos whose title matches regex. Maps to `--reject-title REGEX`. */
  rejectTitle?: string;

  /** Download ads as well. Maps to `--include-ads`. */
  includeAds?: boolean;

  /** Stop on rejected title. Maps to `--break-on-reject`. */
  breakOnReject?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // DOWNLOAD OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Number of fragments to download concurrently.
   * Maps to `-N, --concurrent-fragments N`.
   */
  concurrentFragments?: number;

  /**
   * Minimum download rate to avoid throttling (e.g., "100K").
   * Re-extracts video data if download rate falls below this.
   * Maps to `--throttled-rate RATE`.
   */
  throttledRate?: string;

  /** Number of retries for file access. Maps to `--file-access-retries RETRIES`. */
  fileAccessRetries?: number;

  /**
   * Time to sleep between retries in seconds.
   * Can be a number, "linear=START[:END[:STEP]]" or "exp=START[:END[:BASE]]".
   * Use retrySleepType for type-specific sleep.
   * Maps to `--retry-sleep [TYPE:]EXPR`.
   */
  retrySleep?: number | string;

  /**
   * Type-specific retry sleep configuration.
   * Keys: 'http', 'fragment', 'file_access', 'extractor'.
   * Maps to `--retry-sleep TYPE:EXPR`.
   */
  retrySleepByType?: { [type: string]: string };

  /** Delete fragments after download. Maps to `--no-keep-fragments`. */
  noKeepFragments?: boolean;

  /** Automatically resize the download buffer. Maps to `--resize-buffer`. */
  resizeBuffer?: boolean;

  /** Don't automatically resize buffer. Maps to `--no-resize-buffer`. */
  noResizeBuffer?: boolean;

  /** Process playlist entries as received. Maps to `--lazy-playlist`. */
  lazyPlaylist?: boolean;

  /** Parse entire playlist before downloading. Maps to `--no-lazy-playlist`. */
  noLazyPlaylist?: boolean;

  /** Don't use mpegts container for HLS. Maps to `--no-hls-use-mpegts`. */
  noHlsUseMpegts?: boolean;

  /**
   * Download only matching sections (time range or chapters).
   * Examples: "*10:15-inf", "intro", "*from-url".
   * Maps to `--download-sections REGEX`.
   */
  downloadSections?: string;

  /**
   * External downloader to use.
   * Supports: native, aria2c, axel, curl, ffmpeg, httpie, wget.
   * Maps to `--downloader [PROTO:]NAME`.
   */
  downloader?: string;

  /** Arguments to pass to external downloader. Maps to `--downloader-args NAME:ARGS`. */
  downloaderArgs?: string;

  /** Number of retries (default 10). Maps to `-R, --retries RETRIES`. */
  retries?: number;

  /** Number of retries for a fragment. Maps to `--fragment-retries RETRIES`. */
  fragmentRetries?: number;

  /** Skip unavailable fragments. Maps to `--skip-unavailable-fragments`. */
  skipUnavailableFragments?: boolean;

  /** Abort download if a fragment is unavailable. Maps to `--abort-on-unavailable-fragments`. */
  abortOnUnavailableFragment?: boolean;

  /** Keep downloaded fragments on disk. Maps to `--keep-fragments`. */
  keepFragments?: boolean;

  /** Size of download buffer (e.g., "1024", "16K"). Maps to `--buffer-size SIZE`. */
  bufferSize?: string;

  /** Don't resume partial downloads. Maps to `--no-resume-dl`. */
  noResumeDl?: boolean;

  /** Force resume of partial downloads. Maps to `-c, --continue`. */
  continueDownload?: boolean;

  /** Do not resume partial downloads. Maps to `--no-continue`. */
  noContinue?: boolean;

  /** Maximum download rate (e.g., "50K", "4.2M"). Maps to `-r, --limit-rate RATE`. */
  limitRate?: string;

  /** Extract cookies from browser. Maps to `--cookies-from-browser BROWSER`. */
  cookiesFromBrowser?: string;

  /** Don't read cookies from files. Maps to `--no-cookies`. */
  noCookies?: boolean;

  /** Number of retries for known extractor errors. Maps to `--extractor-retries RETRIES`. */
  extractorRetries?: number;

  /** Process dynamic DASH manifests. Maps to `--allow-dynamic-mpd`. */
  allowDynamicMpd?: boolean;

  /** Use mpegts container for HLS. Maps to `--hls-use-mpegts`. */
  hlsUseMpegts?: boolean;

  /**
   * Size of a chunk for chunk-based HTTP downloading.
   * May help bypass throttling (experimental).
   * Maps to `--http-chunk-size SIZE`.
   */
  httpChunkSize?: string;

  /** Skip download (useful with --print). Maps to `--no-download`. */
  noDownload?: boolean;

  /** Download playlist videos in reverse order. Maps to `--playlist-reverse`. */
  playlistReverse?: boolean;

  /** Download playlist videos in random order. Maps to `--playlist-random`. */
  playlistRandom?: boolean;

  /** Set xattr filesize. Maps to `--xattr-set-filesize`. */
  xattrSetFilesize?: boolean;

  /** Split HLS at discontinuities. Maps to `--hls-split-discontinuity`. */
  hlsSplitDiscontinuity?: boolean;

  /** File containing URLs to download. Maps to `-a, --batch-file FILE`. */
  batchFile?: string;

  /** Don't read batch file. Maps to `--no-batch-file`. */
  noBatchFile?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // FILESYSTEM OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Limit filename length to N characters. Maps to `--trim-filenames LENGTH`. */
  trimFileNames?: number;

  /** Don't restrict characters in filenames. Maps to `--no-restrict-filenames`. */
  noRestrictFilenames?: boolean;

  /** Don't force Windows-safe filenames. Maps to `--no-windows-filenames`. */
  noWindowsFilenames?: boolean;

  /** Force resume of partially downloaded files (deprecated). */
  continue?: boolean;

  /** Write .part files. Maps to `--part`. */
  part?: boolean;

  /** Don't use .part files. Maps to `--no-part`. */
  noPart?: boolean;

  /** Use file modification time from server. Maps to `--mtime`. */
  mtime?: boolean;

  /** Don't use server mtime. Maps to `--no-mtime`. */
  noMtime?: boolean;

  /** Write video description to .description file. Maps to `--write-description`. */
  writeDescription?: boolean;

  /** Don't write description file. Maps to `--no-write-description`. */
  noWriteDescription?: boolean;

  /** Write video metadata to .info.json file. Maps to `--write-info-json`. */
  writeInfoJson?: boolean;

  /** Don't write info json. Maps to `--no-write-info-json`. */
  noWriteInfoJson?: boolean;

  /** Write playlist metadata files. Maps to `--write-playlist-metafiles`. */
  writePlaylistMetafiles?: boolean;

  /** Don't write playlist metadata. Maps to `--no-write-playlist-metafiles`. */
  noWritePlaylistMetafiles?: boolean;

  /** Remove some private fields from infojson. Maps to `--clean-info-json`. */
  cleanInfoJson?: boolean;

  /** Don't clean infojson. Maps to `--no-clean-info-json`. */
  noCleanInfoJson?: boolean;

  /** Write video comments to infojson. Maps to `--write-comments`. */
  writeComments?: boolean;

  /** Don't write comments. Maps to `--no-write-comments`. */
  noWriteComments?: boolean;

  /** JSON file with video metadata. Maps to `--load-info-json FILE`. */
  loadInfoJson?: string;

  /** File to read cookies from. Maps to `--cookies FILE`. */
  cookies?: string;

  /** Do not read cookies from browser. Maps to `--no-cookies-from-browser`. */
  noCookiesFromBrowser?: boolean;

  /** Location to store cached data. Maps to `--cache-dir DIR`. */
  cacheDir?: string;

  /** Disable caching. Maps to `--no-cache-dir`. */
  noCacheDir?: boolean;

  /** Delete all filesystem cache files. Maps to `--rm-cache-dir`. */
  rmCacheDir?: boolean;

  /**
   * Paths for different file types.
   * Maps to `-P, --paths [TYPES:]PATH`.
   */
  paths?: { [key: string]: string } | string;

  /** Output filename template. Maps to `-o, --output TEMPLATE`. */
  output?: string;

  /** Placeholder for unavailable template. Maps to `--output-na-placeholder TEXT`. */
  outputNaPlaceholder?: string;

  /** Restrict filenames to ASCII. Maps to `--restrict-filenames`. */
  restrictFilenames?: boolean;

  /** Force filenames to be Windows-safe. Maps to `--windows-filenames`. */
  windowsFilenames?: boolean;

  /** Don't overwrite existing files. Maps to `--no-overwrites`. */
  noOverwrites?: boolean;

  /** Overwrite all video and metadata files. Maps to `--force-overwrites`. */
  forceOverwrites?: boolean;

  /** Don't overwrite the video. Maps to `--no-force-overwrites`. */
  noForceOverwrites?: boolean;

  /** Start autonumber from given value. Maps to `--autonumber-start NUMBER`. */
  autonumberStart?: number;

  /** Don't use .part files. Maps to `--no-part-files`. */
  noPartFiles?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // THUMBNAIL OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Write thumbnail image to disk. Maps to `--write-thumbnail`. */
  writeThumbnail?: boolean;

  /** Write all thumbnail formats to disk. Maps to `--write-all-thumbnails`. */
  writeAllThumbnails?: boolean;

  /** Don't write thumbnails. Maps to `--no-write-thumbnails`. */
  noWriteThumbnails?: boolean;

  /** Convert thumbnails to format. Maps to `--convert-thumbnails FORMAT`. */
  convertThumbnails?: string;

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNET SHORTCUT OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Write internet shortcut file. Maps to `--write-link`. */
  writeLink?: boolean;

  /** Write .url Windows shortcut. Maps to `--write-url-link`. */
  writeUrlLink?: boolean;

  /** Write .webloc macOS shortcut. Maps to `--write-webloc-link`. */
  writeWeblocLink?: boolean;

  /** Write .lnk Windows shortcut. Maps to `--write-lnk-link`. */
  writeLnkLink?: boolean;

  /** Write .desktop Linux shortcut. Maps to `--write-desktop-link`. */
  writeDesktopLink?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // VERBOSITY AND SIMULATION OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Quiet mode, print only errors. Maps to `-q, --quiet`. */
  quiet?: boolean;

  /** Ignore warnings. Maps to `--no-warnings`. */
  noWarnings?: boolean;

  /** Simulate, don't download or write files. Maps to `-s, --simulate`. */
  simulate?: boolean;

  /** Don't simulate. Maps to `--no-simulate`. */
  noSimulate?: boolean;

  /** Ignore "no video formats" errors. Maps to `--ignore-no-formats-error`. */
  ignoreNoFormatsError?: boolean;

  /** Ignore EOF errors. Maps to `--ignore-eof-error`. */
  ignoreEoFError?: boolean;

  /** Don't ignore EOF errors. Maps to `--no-ignore-eof-error`. */
  noIgnoreEoFError?: boolean;

  /** Don't emit color codes. Maps to `--no-color`. */
  noColor?: boolean;

  /** Display HTTP traffic. Maps to `--print-traffic`. */
  printTraffic?: boolean;

  /** Display progress in console title. Maps to `--console-title`. */
  consoleTitle?: boolean;

  /** Print various debugging information. Maps to `-v, --verbose`. */
  verbose?: boolean;

  /** Activate quiet mode. Maps to `--no-quiet`. */
  noQuiet?: boolean;

  /** Don't ignore "no formats" errors. Maps to `--no-ignore-no-formats-error`. */
  noIgnoreNoFormatsError?: boolean;

  /** Don't display progress bar. Maps to `--no-progress`. */
  noProgress?: boolean;

  /** Display progress bar. Maps to `--progress`. */
  progress?: boolean;

  /** Simulate and print info as JSON (single video). Maps to `-J, --dump-single-json`. */
  dumpSingleJson?: boolean;

  /** Simulate and print info as JSON. Maps to `-j, --dump-json`. */
  dumpJson?: boolean;

  /** Print JSON (equivalent to -j). Maps to `--print-json`. */
  printJson?: boolean;

  /** Don't download video. Maps to `--skip-download`. */
  skipDownload?: boolean;

  /** Quiet mode, print given template. Maps to `-O, --print [WHEN:]TEMPLATE`. */
  print?: string;

  /** Print template to file. Maps to `--print-to-file [WHEN:]TEMPLATE FILE`. */
  printToFile?: string;

  /** Force write to archive. Maps to `--force-write-archive`. */
  forceWriteArchive?: boolean;

  /** Output progress on a new line. Maps to `--newline`. */
  newline?: boolean;

  /** Template for progress outputs. Maps to `--progress-template TEMPLATE`. */
  progressTemplate?: string;

  /** Time between progress updates in seconds. Maps to `--progress-delta SEC`. */
  progressDelta?: number;

  /** Print the yt-dlp command line. Maps to `--print-command-line`. */
  debugPrintCommandLine?: boolean;

  /** Write downloaded pages to files. Maps to `--write-pages`. */
  writePages?: boolean;

  /** Dump parsed web pages. Maps to `--dump-pages`. */
  dumpPages?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKAROUNDS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Force character encoding. Maps to `--encoding ENCODING`. */
  encoding?: string;

  /** Use an unencrypted connection. Maps to `--legacy-server-connect`. */
  legacyServerConnect?: boolean;

  /** Suppress HTTPS certificate validation. Maps to `--no-check-certificates`. */
  noCheckCertificates?: boolean;

  /** Use an unencrypted connection. Maps to `--prefer-insecure`. */
  preferInsecure?: boolean;

  /** Specify additional HTTP headers. Maps to `--add-header FIELD:VALUE`. */
  addHeaders?: { [key: string]: string };

  /** Specify custom binary path. Maps to `--bin-path PATH`. */
  binPath?: string;

  /** Work around bidi issue. Maps to `--bidi-workaround`. */
  bidiWorkaround?: boolean;

  /** Seconds to sleep between requests. Maps to `--sleep-requests SEC`. */
  sleepRequests?: number;

  /** Seconds to sleep before each download. Maps to `--sleep-interval SEC`. */
  sleepInterval?: number;

  /** Max seconds to sleep. Maps to `--max-sleep-interval SEC`. */
  maxSleepInterval?: number;

  /** Seconds to sleep before subtitle download. Maps to `--sleep-subtitles SEC`. */
  sleepSubtitles?: number;

  // ═══════════════════════════════════════════════════════════════════════════
  // VIDEO FORMAT OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Video format code. Maps to `-f, --format FORMAT`. */
  format?: string;

  /** Sort formats by given fields. Maps to `-S, --format-sort SORTORDER`. */
  formatSort?: string[];

  /** Force format sorting. Maps to `--format-sort-force`. */
  formatSortForce?: boolean;

  /** Don't force format sorting. Maps to `--no-format-sort-force`. */
  noFormatSortForce?: boolean;

  /** Preferred audio format (mp3, wav, etc.). Maps to `--audio-format FORMAT`. */
  audioFormat?: string;

  /** Preferred video format. Maps to `--video-format FORMAT`. */
  videoFormat?: string;

  /** Prefer free container formats. Maps to `--prefer-free-formats`. */
  preferFreeFormats?: boolean;

  /** Don't prefer free formats. Maps to `--no-prefer-free-formats`. */
  noPreferFreeFormats?: boolean;

  /** Force keyframes at cuts. Maps to `--yt-dlp-force-keyframes`. */
  ytdlpForceKeyframes?: boolean;

  /** Container for merging formats (mp4, mkv, etc.). Maps to `--merge-output-format FORMAT`. */
  mergeOutputFormat?: string;

  /** Merge multiple video streams. Maps to `--video-multistreams`. */
  videoMultiStreams?: boolean;

  /** Don't merge multiple video streams. Maps to `--no-video-multistreams`. */
  noVideoMultiStreams?: boolean;

  /** Merge multiple audio streams. Maps to `--audio-multistreams`. */
  audioMultiStreams?: boolean;

  /** Don't merge multiple audio streams. Maps to `--no-audio-multistreams`. */
  noAudioMultiStreams?: boolean;

  /** Check that formats are downloadable. Maps to `--check-formats`. */
  checkFormats?: boolean;

  /** Check all formats. Maps to `--check-all-formats`. */
  checkAllFormats?: boolean;

  /** Don't check formats. Maps to `--no-check-formats`. */
  noCheckFormats?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBTITLE OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Write subtitle files. Maps to `--write-subs`. */
  writeSubs?: boolean;

  /** Write auto-generated subtitle files. Maps to `--write-auto-subs`. */
  writeAutoSubs?: boolean;

  /** Write all available subtitles. Maps to `--write-all-subs`. */
  writeAllSubs?: boolean;

  /** Don't write subtitle files. Maps to `--no-write-subs`. */
  noWriteSubs?: boolean;

  /** List available subtitles. Maps to `--list-subs`. */
  listSubs?: boolean;

  /** Subtitle format (srt, vtt, ass, etc.). Maps to `--sub-format FORMAT`. */
  subFormat?: string;

  /** Languages of subtitles to download. Maps to `--sub-langs LANGS`. */
  subLangs?: string[];

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHENTICATION OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Login username. Maps to `-u, --username USERNAME`. */
  username?: string;

  /** Login password. Maps to `-p, --password PASSWORD`. */
  password?: string;

  /** Two-factor auth code. Maps to `-2, --twofactor CODE`. */
  twoFactor?: string;

  /** Use .netrc authentication. Maps to `-n, --netrc`. */
  netrc?: boolean;

  /** Video password (vimeo, etc.). Maps to `--video-password PASSWORD`. */
  videoPassword?: string;

  /** Location of .netrc file. Maps to `--netrc-location PATH`. */
  netrcLocation?: string;

  /** Command to get netrc credentials. Maps to `--netrc-cmd COMMAND`. */
  netrcCmd?: string;

  /** Client certificate file. Maps to `--client-certificate CERTFILE`. */
  clientCertificate?: string;

  /** Client certificate key file. Maps to `--client-certificate-key KEYFILE`. */
  clientCertificateKey?: string;

  /** Client certificate password. Maps to `--client-certificate-password PASSWORD`. */
  clientCertificatePassword?: string;

  // ═══════════════════════════════════════════════════════════════════════════
  // ADOBE PASS OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** List available MSOs. Maps to `--ap-list-mso`. */
  apListMso?: boolean;

  /** Adobe Pass MSO. Maps to `--ap-mso MSO`. */
  apMso?: string;

  /** Adobe Pass username. Maps to `--ap-username USERNAME`. */
  apUsername?: string;

  /** Adobe Pass password. Maps to `--ap-password PASSWORD`. */
  apPassword?: string;

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-PROCESSING OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Extract and save audio. Maps to `-x, --extract-audio`. */
  extractAudio?: boolean;

  /** Audio quality (0-9 VBR or specific bitrate). Maps to `--audio-quality QUALITY`. */
  audioQuality?: string;

  /** Remux video to another container. Maps to `--remux-video FORMAT`. */
  remuxVideo?: string;

  /** Re-encode video to another format. Maps to `--recode-video FORMAT`. */
  recodeVideo?: string;

  /** Additional args for post processors. Maps to `--postprocessor-args NAME:ARGS`. */
  postprocessorArgs?: { [key: string]: string[] };

  /** Keep the original video. Maps to `-k, --keep-video`. */
  keepVideo?: boolean;

  /** Delete the original video. Maps to `--no-keep-video`. */
  noKeepVideo?: boolean;

  /** Overwrite post-processed files. Maps to `--post-overwrites`. */
  postOverwrites?: boolean;

  /** Don't overwrite post-processed files. Maps to `--no-post-overwrites`. */
  noPostOverwrites?: boolean;

  /** Embed subtitles in the video. Maps to `--embed-subs`. */
  embedSubs?: boolean;

  /** Don't embed subtitles. Maps to `--no-embed-subs`. */
  noEmbedSubs?: boolean;

  /** Embed thumbnail in the video. Maps to `--embed-thumbnail`. */
  embedThumbnail?: boolean;

  /** Don't embed thumbnail. Maps to `--no-embed-thumbnail`. */
  noEmbedThumbnail?: boolean;

  /** Embed metadata in the file. Maps to `--embed-metadata`. */
  embedMetadata?: boolean;

  /** Don't embed metadata. Maps to `--no-embed-metadata`. */
  noEmbedMetadata?: boolean;

  /** Embed chapters in the video. Maps to `--embed-chapters`. */
  embedChapters?: boolean;

  /** Don't embed chapters. Maps to `--no-embed-chapters`. */
  noEmbedChapters?: boolean;

  /** Embed info.json in video. Maps to `--embed-info-json`. */
  embedInfoJson?: boolean;

  /** Don't embed info.json. Maps to `--no-embed-info-json`. */
  noEmbedInfoJson?: boolean;

  /** Parse and modify metadata. Maps to `--parse-metadata FROM:TO`. */
  parseMetadata?: { [key: string]: string };

  /** Replace text in a metadata field. Maps to `--replace-in-metadata FIELDS REGEX REPLACE`. */
  replaceInMetadata?: { [key: string]: [string, string] };

  /** Write extended attributes. Maps to `--xattrs`. */
  xattrs?: boolean;

  /** Concatenate playlist into a single file. Maps to `--concat-playlist POLICY`. */
  concatPlaylist?: string;

  /** Fix file problems (never, warn, detect_or_warn, force). Maps to `--fixup POLICY`. */
  fixup?: string;

  /** Location of FFmpeg binary. Maps to `--ffmpeg-location PATH`. */
  ffmpegLocation?: string;

  /** Execute command on file. Maps to `--exec CMD`. */
  exec?: string;

  /** Don't execute command. Maps to `--no-exec`. */
  noExec?: boolean;

  /** Convert subtitles to format. Maps to `--convert-subs FORMAT`. */
  convertSubs?: string;

  /** Split video by chapters. Maps to `--split-chapters`. */
  splitChapters?: boolean;

  /** Don't split by chapters. Maps to `--no-split-chapters`. */
  noSplitChapters?: boolean;

  /** Remove chapters matching regex. Maps to `--remove-chapters REGEX`. */
  removeChapters?: string;

  /** Don't remove chapters. Maps to `--no-remove-chapters`. */
  noRemoveChapters?: boolean;

  /** Force keyframes around chapters for accurate cuts. Maps to `--force-keyframes-at-cuts`. */
  forceKeyframesAtCuts?: boolean;

  /** Don't force keyframes. Maps to `--no-force-keyframes-at-cuts`. */
  noForceKeyframesAtCuts?: boolean;

  /** Enable a plugin-based postprocessor. Maps to `--use-postprocessor NAME`. */
  usePostProcessor?: string[];

  // ═══════════════════════════════════════════════════════════════════════════
  // SPONSORBLOCK OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * SponsorBlock categories to create chapters for.
   * Available: sponsor, intro, outro, selfpromo, preview, filler, interaction, etc.
   * Maps to `--sponsorblock-mark CATS`.
   */
  sponsorblockMark?: string[];

  /**
   * SponsorBlock categories to remove from video.
   * Available: sponsor, intro, outro, selfpromo, preview, filler, etc.
   * Maps to `--sponsorblock-remove CATS`.
   */
  sponsorblockRemove?: string[];

  /** Template for SponsorBlock chapter titles. Maps to `--sponsorblock-chapter-title TEMPLATE`. */
  sponsorblockChapterTitle?: string;

  /** Disable all SponsorBlock options. Maps to `--no-sponsorblock`. */
  noSponsorblock?: boolean;

  /** SponsorBlock API URL. Maps to `--sponsorblock-api URL`. */
  sponsorblockApi?: string;

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTOR OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Pass arguments to specific extractors.
   * Maps to `--extractor-args IE_KEY:ARGS`.
   * @example { youtube: ['player_skip=webpage', 'max_comments=100'] }
   */
  extractorArgs?: { [key: string]: string[] };

  /** Don't process dynamic DASH manifests. Maps to `--ignore-dynamic-mpd`. */
  ignoreDynamicMpd?: boolean;

  /** Don't split HLS at discontinuities. Maps to `--no-hls-split-discontinuity`. */
  noHlsSplitDiscontinuity?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBUG AND HTTP OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** HTTP Referer header. Maps to `--referer URL`. */
  referer?: string;

  /** Custom User-Agent header. Maps to `--user-agent UA`. */
  userAgent?: string;

  /** Additional HTTP headers. Maps to `--headers FIELD:VALUE`. */
  headers?: { [key: string]: string };

  // ═══════════════════════════════════════════════════════════════════════════
  // INFORMATION OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** List all available formats. Maps to `-F, --list-formats`. */
  listFormats?: boolean;

  /** List all available thumbnails. Maps to `--list-thumbnails`. */
  listThumbnails?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // RAW OPTIONS PASSTHROUGH
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Additional yt-dlp options to append.
   * @example ['--cookies', 'cookies.txt']
   */
  additionalOptions?: string[];

  /**
   * Raw yt-dlp arguments (appended last).
   * @example ['--match-filter', 'duration > 60']
   */
  rawArgs?: string[];
}
