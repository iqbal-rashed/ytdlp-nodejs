import * as child_process from 'child_process';

interface ArgsOptions {
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
    jsRuntimes?: string;
    noJsRuntimes?: boolean;
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
    proxy?: string;
    socketTimeout?: number;
    sourceAddress?: string;
    forceIpv4?: boolean;
    forceIpv6?: boolean;
    impersonate?: string[];
    listImpersonateTargets?: boolean;
    enableFileUrls?: boolean;
    geoVerificationProxy?: string;
    xff?: string;
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
    paths?: {
        [key: string]: string;
    } | string;
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
    writeThumbnail?: boolean;
    writeAllThumbnails?: boolean;
    noWriteThumbnails?: boolean;
    convertThumbnails?: string;
    writeLink?: boolean;
    writeUrlLink?: boolean;
    writeWeblocLink?: boolean;
    writeLnkLink?: boolean;
    writeDesktopLink?: boolean;
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
    encoding?: string;
    legacyServerConnect?: boolean;
    noCheckCertificates?: boolean;
    preferInsecure?: boolean;
    addHeaders?: {
        [key: string]: string;
    };
    binPath?: string;
    bidiWorkaround?: boolean;
    sleepRequests?: number;
    sleepInterval?: number;
    maxSleepInterval?: number;
    sleepSubtitles?: number;
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
    writeSubs?: boolean;
    writeAutoSubs?: boolean;
    writeAllSubs?: boolean;
    noWriteSubs?: boolean;
    listSubs?: boolean;
    subFormat?: string;
    subLangs?: string[];
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
    apMso?: string;
    apUsername?: string;
    apPassword?: string;
    extractAudio?: boolean;
    audioQuality?: string;
    remuxVideo?: string;
    recodeVideo?: string;
    postprocessorArgs?: {
        [key: string]: string[];
    };
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
    parseMetadata?: {
        [key: string]: string;
    };
    replaceInMetadata?: {
        [key: string]: [string, string];
    };
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
    sponsorblockMark?: string[];
    sponsorblockRemove?: string[];
    sponsorblockChapterTitle?: string;
    noSponsorblock?: boolean;
    sponsorblockApi?: string;
    extractorArgs?: {
        [key: string]: string[];
    };
    ignoreDynamicMpd?: boolean;
    dumpPages?: boolean;
    noHlsSplitDiscontinuity?: boolean;
    referer?: string;
    userAgent?: string;
    headers?: {
        [key: string]: string;
    };
    debugPrintCommandLine?: boolean;
    writePages?: boolean;
    listFormats?: boolean;
    listThumbnails?: boolean;
    additionalOptions?: string[];
}
interface YtDlpOptions {
    binaryPath?: string;
    ffmpegPath?: string;
}
interface VideoInfo {
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
    creator: string;
    creators: string[];
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
    chapters: {
        start_time: number;
        title: string;
        end_time: number;
    }[];
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
    [k: string]: {
        ext: string;
        url: string;
        name: string;
    }[];
}
type InfoType = 'video' | 'playlist';
interface PlaylistInfo {
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
interface VideoThumbnail {
    id: number;
    width?: string | number;
    height?: string | number;
    url: string;
}
interface VideoFormat {
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
interface VideoProgress {
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
type VideoQuality = '2160p' | '1440p' | '1080p' | '720p' | '480p' | '360p' | '240p' | '144p' | 'highest' | 'lowest';
type QualityOptions = {
    videoonly: VideoQuality;
    audioonly: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    audioandvideo: 'highest' | 'lowest';
    mergevideo: VideoQuality;
};
type TypeOptions = {
    videoonly: 'mp4' | 'webm';
    audioandvideo: 'mp4' | 'webm';
    mergevideo: 'mkv' | 'mp4' | 'ogg' | 'webm' | 'flv';
    audioonly: 'aac' | 'flac' | 'mp3' | 'm4a' | 'opus' | 'vorbis' | 'wav' | 'alac';
};
type FormatKeyWord = keyof QualityOptions;
interface FormatOptions<F extends FormatKeyWord> extends Omit<ArgsOptions, 'format' | 'progressTemplate'> {
    format?: {
        filter: F;
        quality?: QualityOptions[F];
        type?: TypeOptions[F];
    } | string;
    onProgress?: (p: VideoProgress) => void;
}
type PipeResponse = {
    promise: Promise<string>;
    pipe: (destination: NodeJS.WritableStream, options?: {
        end?: boolean;
    }) => NodeJS.WritableStream;
    pipeAsync: (destination: NodeJS.WritableStream, options?: {
        end?: boolean;
    }) => Promise<NodeJS.WritableStream>;
};
interface FileMetadata {
    name: string;
    type: string;
    size?: number;
}
interface GetFileOptions<F extends FormatKeyWord> extends FormatOptions<F> {
    filename?: string;
    metadata?: FileMetadata;
}
interface InfoOptions {
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
    /**
     * JS runtimes to use.
     */
    jsRuntimes?: string;
    /**
     * Disable JS runtimes.
     */
    noJsRuntimes?: boolean;
}

declare function createArgs(options: ArgsOptions): string[];

declare function extractThumbnails(consoleOutput: string): VideoThumbnail[];

declare function parseFormatOptions<T extends FormatKeyWord>(format?: FormatOptions<T>['format'] | string): string[];
declare function getContentType(format?: FormatOptions<FormatKeyWord>['format']): string;
declare function getFileExtension(format?: FormatOptions<FormatKeyWord>['format']): string;

declare function stringToProgress(str: string): VideoProgress | undefined;

declare function downloadFFmpeg(out?: string): Promise<string | undefined>;
declare function findFFmpegBinary(): string | undefined;

declare function downloadFile(url: string, outputPath: string): Promise<void>;

declare function downloadYtDlp(out?: string): Promise<string>;
declare function findYtdlpBinary(): string | undefined;

declare const BIN_DIR: string;
declare class YtDlp {
    private readonly binaryPath;
    private readonly ffmpegPath?;
    constructor(opt?: YtDlpOptions);
    checkInstallationAsync(options?: {
        ffmpeg?: boolean;
    }): Promise<boolean>;
    checkInstallation(options?: {
        ffmpeg?: boolean;
    }): boolean;
    execAsync(url: string, options?: ArgsOptions & {
        onData?: (d: string) => void;
        onProgress?: (p: VideoProgress) => void;
    }): Promise<string>;
    exec(url: string, options?: ArgsOptions): child_process.ChildProcessWithoutNullStreams;
    private _execute;
    private _executeAsync;
    private buildArgs;
    download<F extends FormatKeyWord>(url: string, options?: Omit<FormatOptions<F>, 'onProgress'>): child_process.ChildProcessWithoutNullStreams;
    downloadAsync<F extends FormatKeyWord>(url: string, options?: FormatOptions<F>): Promise<string>;
    stream<F extends FormatKeyWord>(url: string, options?: FormatOptions<F>): PipeResponse;
    getInfoAsync<T extends InfoType>(url: string, options?: InfoOptions): Promise<T extends 'video' ? VideoInfo : PlaylistInfo>;
    getThumbnailsAsync(url: string): Promise<VideoThumbnail[]>;
    getTitleAsync(url: string): Promise<string>;
    downloadFFmpeg(): Promise<string | undefined>;
    getFileAsync<F extends FormatKeyWord>(url: string, options?: GetFileOptions<F> & {
        onProgress?: (p: VideoProgress) => void;
    }): Promise<File>;
    getUrlsAsync(url: string, options?: ArgsOptions): Promise<string[]>;
}
declare const helpers: {
    downloadFFmpeg: typeof downloadFFmpeg;
    findFFmpegBinary: typeof findFFmpegBinary;
    PROGRESS_STRING: string;
    getContentType: typeof getContentType;
    getFileExtension: typeof getFileExtension;
    parseFormatOptions: typeof parseFormatOptions;
    stringToProgress: typeof stringToProgress;
    createArgs: typeof createArgs;
    extractThumbnails: typeof extractThumbnails;
    downloadFile: typeof downloadFile;
    BIN_DIR: string;
    downloadYtDlp: typeof downloadYtDlp;
    findYtdlpBinary: typeof findYtdlpBinary;
};

export { type ArgsOptions, BIN_DIR, type FormatOptions, type PlaylistInfo, type QualityOptions, type TypeOptions, type VideoFormat, type VideoInfo, type VideoProgress, type VideoThumbnail, YtDlp, type YtDlpOptions, helpers };
