import { ArgsOptions } from '../types';

export function createArgs(options: ArgsOptions): string[] {
  const args: string[] = [];

  // General Options
  if (options.printHelp) args.push('--help');
  if (options.printVersion) args.push('--version');
  if (options.update) args.push('--update');
  if (options.noUpdate) args.push('--no-update');
  if (options.updateTo) args.push('--update-to', options.updateTo);
  if (options.ignoreErrors) args.push('--ignore-errors');
  if (options.noAbortOnError) args.push('--no-abort-on-error');
  if (options.abortOnError) args.push('--abort-on-error');
  if (options.dumpUserAgent) args.push('--dump-user-agent');
  if (options.listExtractors) args.push('--list-extractors');
  if (options.extractorDescriptions) args.push('--extractor-descriptions');

  if (options.useExtractors && options.useExtractors.length > 0) {
    args.push('--use-extractors', options.useExtractors.join(','));
  }
  if (options.defaultSearch)
    args.push('--default-search', options.defaultSearch);

  if (options.ignoreConfig) args.push('--ignore-config');
  if (options.noConfigLocations) args.push('--no-config-location');

  if (options.configLocations && options.configLocations.length > 0)
    args.push('--config-locations', ...options.configLocations);

  if (options.pluginDirs && options.pluginDirs.length > 0) {
    for (const dir of options.pluginDirs) {
      args.push('--plugin-dirs', dir);
    }
  }
  if (options.noPluginDirs) args.push('--no-plugin-dirs');
  if (options.flatPlaylist) args.push('--flat-playlist');

  if (options.noFlatPlaylist) args.push('--no-flat-playlist');

  if (options.liveFromStart) args.push('--live-from-start');
  if (options.noLiveFromStart) args.push('--no-live-from-start');

  if (options.waitForVideo)
    args.push('--wait-for-video', options.waitForVideo.toString());
  if (options.noWaitForVideo) args.push('--no-wait-for-video');
  if (options.markWatched) args.push('--mark-watched');
  if (options.noMarkWatched) args.push('--no-mark-watched');
  if (options.color) args.push('--color', options.color);

  if (options.compatOptions && options.compatOptions.length > 0) {
    args.push('--compat-options', options.compatOptions.join(','));
  }

  if (options.aliases && options.aliases.length > 0) {
    args.push('--alias', ...options.aliases);
  }

  // Network Options
  if (options.proxy) args.push('--proxy', options.proxy);
  if (options.socketTimeout)
    args.push('--socket-timeout', options.socketTimeout.toString());
  if (options.sourceAddress)
    args.push('--source-address', options.sourceAddress);

  if (options.impersonate && options.impersonate.length > 0)
    args.push('--impersonate', options.impersonate.join(','));

  if (options.listImpersonateTargets) args.push('--list-impersonate-targets');

  if (options.forceIpv4) args.push('--force-ipv4');
  if (options.forceIpv6) args.push('--force-ipv6');

  if (options.enableFileUrls) args.push('--enable-file-urls');

  // Geo-restriction
  if (options.geoVerificationProxy)
    args.push('--geo-verification-proxy', options.geoVerificationProxy);
  if (options.xff) args.push('--xff', options.xff);

  // Video Selection
  if (options.playlistItems)
    args.push('--playlist-items', options.playlistItems);
  if (options.minFilesize) args.push('--min-filesize', options.minFilesize);
  if (options.maxFilesize) args.push('--max-filesize', options.maxFilesize);
  if (options.date) args.push('--date', options.date);
  if (options.dateBefore) args.push('--datebefore', options.dateBefore);
  if (options.dateAfter) args.push('--dateafter', options.dateAfter);
  if (options.matchFilter) args.push('--match-filter', options.matchFilter);
  if (options.noMatchFilters) args.push('--no-match-filters');
  if (options.breakMatchFilters)
    args.push('--break-match-filters', options.breakMatchFilters);
  if (options.noBreakMatchFilters) args.push('--no-break-match-filters');
  if (options.noPlaylist) args.push('--no-playlist');
  if (options.yesPlaylist) args.push('--yes-playlist');
  if (options.ageLimit) args.push('--age-limit', options.ageLimit.toString());
  if (options.downloadArchive)
    args.push('--download-archive', options.downloadArchive);
  if (options.noDownloadArchive) args.push('--no-download-archive');
  if (options.maxDownloads)
    args.push('--max-downloads', options.maxDownloads.toString());
  if (options.breakOnExisting) args.push('--break-on-existing');
  if (options.noBreakOnExisting) args.push('--no-break-on-existing');
  if (options.breakPerInput) args.push('--break-per-input');
  if (options.noBreakPerInput) args.push('--break-per-input');
  if (options.skipPlaylistAfterErrors)
    args.push(
      '--skip-playlist-after-errors',
      options.skipPlaylistAfterErrors.toString()
    );

  // Download Options
  if (options.concurrentFragments)
    args.push('--concurrent-fragments', options.concurrentFragments.toString());
  if (options.limitRate) args.push('--limit-rate', options.limitRate);
  if (options.throttledRate)
    args.push('--throttled-rate', options.throttledRate);
  if (options.retries) args.push('--retries', options.retries.toString());
  if (options.fileAccessRetries)
    args.push('--file-access-retries', options.fileAccessRetries.toString());

  if (options.fragmentRetries)
    args.push('--fragment-retries', options.fragmentRetries.toString());

  if (options.retrySleep)
    args.push('--retry-sleep', options.retrySleep.toString());
  if (options.skipUnavailableFragments)
    args.push('--skip-unavailable-fragments');
  if (options.abortOnUnavailableFragment)
    args.push('--abort-on-unavailable-fragment');

  if (options.keepFragments) args.push('--keep-fragments');
  if (options.noKeepFragments) args.push('--no-keep-fragments');
  if (options.bufferSize) args.push('--buffer-size', options.bufferSize);
  if (options.resizeBuffer) args.push('--resize-buffer');
  if (options.noResizeBuffer) args.push('--no-resize-buffer');
  if (options.httpChunkSize)
    args.push('--http-chunk-size', options.httpChunkSize);
  if (options.playlistRandom) args.push('--playlist-random');
  if (options.lazyPlaylist) args.push('--lazy-playlist');
  if (options.noLazyPlaylist) args.push('--no-lazy-playlist');
  if (options.xattrSetFilesize) args.push('--xattr-set-filesize');
  if (options.hlsUseMpegts) args.push('--hls-use-mpegts');
  if (options.noHlsUseMpegts) args.push('--no-hls-use-mpegts');
  if (options.downloadSections)
    args.push('--download-sections', options.downloadSections.toString());
  if (options.downloader) args.push('--downloader', options.downloader);
  if (options.downloaderArgs)
    args.push('--downloader-args', options.downloaderArgs);

  // Filesystem Options
  if (options.batchFile) args.push('--batch-file', options.batchFile);
  if (options.noBatchFile) args.push('--no-batch-file');
  if (options.paths) {
    if (typeof options.paths === 'string') {
      args.push('--paths', options.paths);
    } else {
      for (const [key, value] of Object.entries(options.paths)) {
        args.push('--paths', `${key}:${value}`);
      }
    }
  }
  if (options.output) args.push('-o', options.output);
  if (options.outputNaPlaceholder)
    args.push('--output-na-placeholder', options.outputNaPlaceholder);
  if (options.restrictFilenames) args.push('--restrict-filenames');
  if (options.noRestrictFilenames) args.push('--no-restrict-filenames');
  if (options.windowsFilenames) args.push('--windows-filenames');
  if (options.noWindowsFilenames) args.push('--no-windows-filenames');
  if (options.trimFileNames)
    args.push('--trim-file-names', options.trimFileNames.toString());
  if (options.noOverwrites) args.push('--no-overwrites');
  if (options.forceOverwrites) args.push('--force-overwrites');
  if (options.noForceOverwrites) args.push('--no-force-overwrites');
  if (options.continue) args.push('--continue');
  if (options.noContinue) args.push('--no-continue');
  if (options.part) args.push('--part');
  if (options.noPart) args.push('--no-part');
  if (options.mtime) args.push('--mtime');
  if (options.noMtime) args.push('--no-mtime');
  if (options.writeDescription) args.push('--write-description');
  if (options.noWriteDescription) args.push('--no-write-description');
  if (options.writeInfoJson) args.push('--write-info-json');
  if (options.noWriteInfoJson) args.push('--no-write-info-json');
  if (options.writePlaylistMetafiles) args.push('--write-playlist-metafiles');
  if (options.noWritePlaylistMetafiles)
    args.push('--no-write-playlist-metafiles');
  if (options.cleanInfoJson) args.push('--clean-info-json');
  if (options.noCleanInfoJson) args.push('--no-clean-info-json');
  if (options.writeComments) args.push('--write-comments');
  if (options.noWriteComments) args.push('--no-write-comments');
  if (options.loadInfoJson)
    args.push('--load-info-json', options.loadInfoJson.toString());
  if (options.cookies) args.push('--cookies', options.cookies);
  if (options.noCookies) args.push('--no-cookies');
  if (options.cookiesFromBrowser)
    args.push('--cookies-from-browser', options.cookiesFromBrowser);
  if (options.noCookiesFromBrowser) args.push('--no-cookies-from-browser');
  if (options.cacheDir) args.push('--cache-dir', options.cacheDir);
  if (options.noCacheDir) args.push('--no-cache-dir');
  if (options.rmCacheDir) args.push('--rm-cache-dir');

  // Thumbnail Options
  if (options.writeThumbnail) args.push('--write-thumbnail');
  if (options.noWriteThumbnails) args.push('--no-write-thumbnails');
  if (options.writeAllThumbnails) args.push('--write-all-thumbnails');
  if (options.listThumbnails) args.push('--list-thumbnails');

  // Internet Shortcut Options
  if (options.writeLink) args.push('--write-link');
  if (options.writeUrlLink) args.push('--write-url-link');
  if (options.writeWeblocLink) args.push('--write-webloc-link');
  if (options.writeDesktopLink) args.push('--write-desktop-link');

  // Verbosity and Simulation Options
  if (options.quiet) args.push('--quiet');
  if (options.noQuiet) args.push('--no-quiet');
  if (options.noWarnings) args.push('--no-warnings');
  if (options.simulate) args.push('--simulate');
  if (options.noSimulate) args.push('--no-simulate');
  if (options.ignoreNoFormatsError) args.push('--ignore-no-formats-error');
  if (options.noIgnoreNoFormatsError) args.push('--no-ignore-no-formats-error');
  if (options.skipDownload) args.push('--skip-download');
  if (options.print) args.push('--print', options.print);
  if (options.printToFile) args.push('--print-to-file', options.printToFile);
  if (options.dumpJson) args.push('--dump-json');
  if (options.dumpSingleJson) args.push('--dump-single-json');
  if (options.forceWriteArchive) args.push('--force-write-archive');
  if (options.newline) args.push('--newline');
  if (options.noProgress) args.push('--no-progress');
  if (options.progress) args.push('--progress');
  if (options.consoleTitle) args.push('--console-title');
  if (options.progressTemplate)
    args.push('--progress-template', options.progressTemplate);
  if (options.progressDelta)
    args.push('--progress-delta', options.progressDelta.toString());
  if (options.verbose) args.push('--verbose');
  if (options.dumpPages) args.push('--dump-pages');
  if (options.writePages) args.push('--write-pages');
  if (options.printTraffic) args.push('--print-traffic');

  // Workarounds
  if (options.encoding) args.push('--encoding', options.encoding);
  if (options.legacyServerConnect) args.push('--legacy-server-connect');
  if (options.noCheckCertificates) args.push('--no-check-certificates');
  if (options.preferInsecure) args.push('--prefer-insecure');
  if (options.addHeaders) {
    for (const [key, value] of Object.entries(options.addHeaders)) {
      args.push('--add-headers', `${key}:${value}`);
    }
  }
  if (options.bidiWorkaround) args.push('--bidi-workaround');
  if (options.sleepRequests)
    args.push('--sleep-requests', options.sleepRequests.toString());
  if (options.sleepInterval)
    args.push('--sleep-interval', options.sleepInterval.toString());
  if (options.maxSleepInterval)
    args.push('--max-sleep-interval', options.maxSleepInterval.toString());
  if (options.sleepSubtitles)
    args.push('--sleep-subtitles', options.sleepSubtitles.toString());

  // Video Format Options
  if (options.format) args.push('-f', options.format);
  if (options.formatSort && options.formatSort.length > 0) {
    args.push('--format-sort', options.formatSort.join(','));
  }
  if (options.formatSortForce) args.push('--format-sort-force');
  if (options.noFormatSortForce) args.push('--no-format-sort-force');
  if (options.videoMultiStreams) args.push('--video-multistreams');
  if (options.noVideoMultiStreams) args.push('--no-video-multistreams');
  if (options.audioMultiStreams) args.push('--audio-multistreams');
  if (options.noAudioMultiStreams) args.push('--no-audio-multistreams');
  if (options.preferFreeFormats) args.push('--prefer-free-formats');
  if (options.noPreferFreeFormats) args.push('--no-prefer-free-formats');
  if (options.checkFormats) args.push('--check-formats');
  if (options.checkAllFormats) args.push('--check-all-formats');
  if (options.noCheckFormats) args.push('--no-check-formats');
  if (options.listFormats) args.push('--list-formats');
  if (options.mergeOutputFormat)
    args.push('--merge-output-format', options.mergeOutputFormat);

  // Subtitle Options
  if (options.writeSubs) args.push('--write-subs');
  if (options.noWriteSubs) args.push('--no-write-subs');
  if (options.writeAutoSubs) args.push('--write-auto-subs');
  if (options.writeAllSubs) args.push('--all-subs');
  if (options.listSubs) args.push('--list-subs');
  if (options.subFormat) args.push('--sub-format', options.subFormat);
  if (options.subLangs && options.subLangs.length > 0)
    args.push('--sub-langs', options.subLangs.join(','));

  // Authentication Options
  if (options.username) args.push('--username', options.username);
  if (options.password) args.push('--password', options.password);
  if (options.twoFactor) args.push('--twofactor', options.twoFactor);
  if (options.netrc) args.push('--netrc');
  if (options.videoPassword)
    args.push('--video-password', options.videoPassword);
  if (options.apMso) args.push('--ap-mso', options.apMso);
  if (options.apUsername) args.push('--ap-username', options.apUsername);
  if (options.apPassword) args.push('--ap-password', options.apPassword);
  if (options.netrcLocation)
    args.push('--netrc-location', options.netrcLocation);
  if (options.netrcCmd) args.push('--netrc-cmd', options.netrcCmd);
  if (options.apListMso) args.push('--ap-list-mso');
  if (options.clientCertificate)
    args.push('--client-certificate', options.clientCertificate);
  if (options.clientCertificateKey)
    args.push('--client-certificate-key', options.clientCertificateKey);
  if (options.clientCertificatePassword)
    args.push(
      '--client-certificate-password',
      options.clientCertificatePassword
    );

  // Post-Processing Options

  // Extractor Options

  if (options.extractorRetries !== undefined)
    args.push('--extractor-retries', options.extractorRetries.toString());
  if (options.allowDynamicMpd) args.push('--allow-dynamic-mpd');
  if (options.ignoreDynamicMpd) args.push('--ignore-dynamic-mpd');
  if (options.hlsSplitDiscontinuity) args.push('--hls-split-discontinuity');
  if (options.noHlsSplitDiscontinuity)
    args.push('--no-hls-split-discontinuity');
  // Extractor Options
  if (options.extractorArgs) {
    for (const [key, value] of Object.entries(options.extractorArgs)) {
      args.push('--extractor-args', `${key}:${value.join(' ')}`);
    }
  }

  if (options.playlistStart !== undefined)
    args.push('--playlist-start', options.playlistStart.toString());
  if (options.playlistEnd !== undefined)
    args.push('--playlist-end', options.playlistEnd.toString());

  if (options.matchTitle) args.push('--match-title', options.matchTitle);
  if (options.rejectTitle) args.push('--reject-title', options.rejectTitle);

  if (options.includeAds) args.push('--include-ads');

  if (options.breakOnReject) args.push('--break-on-reject');

  if (options.noDownload) args.push('--no-download');
  if (options.playlistReverse) args.push('--playlist-reverse');

  if (options.geoBypass) args.push('--geo-bypass');
  if (options.geoBypassCountry)
    args.push('--geo-bypass-country', options.geoBypassCountry);
  if (options.geoBypassIpBlock)
    args.push('--geo-bypass-ip-block', options.geoBypassIpBlock);

  // URL/File options

  // Thumbnail Options

  if (options.convertThumbnails)
    args.push('--convert-thumbnails', options.convertThumbnails);

  // Internet Shortcut Options
  if (options.writeLink) args.push('--write-link');
  if (options.writeUrlLink) args.push('--write-url-link');
  if (options.writeWeblocLink) args.push('--write-webloc-link');
  if (options.writeLnkLink) args.push('--write-lnk-link');

  // Workarounds

  if (options.userAgent) args.push('--user-agent', options.userAgent);

  // Authentication Options

  // Post-Processing Options
  if (options.extractAudio) args.push('--extract-audio');
  if (options.audioFormat) args.push('--audio-format', options.audioFormat);
  if (options.audioQuality) args.push('--audio-quality', options.audioQuality);
  if (options.remuxVideo) args.push('--remux-video', options.remuxVideo);
  if (options.recodeVideo) args.push('--recode-video', options.recodeVideo);
  if (options.postprocessorArgs) {
    for (const [key, value] of Object.entries(options.postprocessorArgs)) {
      args.push('--postprocessor-args', `${key}:${value.join(' ')}`);
    }
  }
  if (options.keepVideo) args.push('--keep-video');
  if (options.noKeepVideo) args.push('--no-keep-video');
  if (options.postOverwrites) args.push('--post-overwrites');
  if (options.noPostOverwrites) args.push('--no-post-overwrites');
  if (options.embedSubs) args.push('--embed-subs');
  if (options.noEmbedSubs) args.push('--no-embed-subs');
  if (options.embedThumbnail) args.push('--embed-thumbnail');
  if (options.noEmbedThumbnail) args.push('--no-embed-thumbnail');
  if (options.embedMetadata) args.push('--embed-metadata');
  if (options.noEmbedMetadata) args.push('--no-embed-metadata');
  if (options.embedChapters) args.push('--embed-chapters');
  if (options.noEmbedChapters) args.push('--no-embed-chapters');
  if (options.embedInfoJson) args.push('--embed-info-json');
  if (options.noEmbedInfoJson) args.push('--no-embed-info-json');

  if (options.parseMetadata) {
    for (const [key, value] of Object.entries(options.parseMetadata)) {
      args.push('--parse-metadata', `${key}:${value}`);
    }
  }

  if (options.replaceInMetadata) {
    for (const [key, [search, replace]] of Object.entries(
      options.replaceInMetadata
    )) {
      args.push('--replace-in-metadata', `${key} ${search} ${replace}`);
    }
  }

  if (options.xattrs) args.push('--xattrs');
  if (options.concatPlaylist)
    args.push('--concat-playlist', options.concatPlaylist);
  if (options.fixup) args.push('--fixup', options.fixup);
  if (options.ffmpegLocation)
    args.push('--ffmpeg-location', options.ffmpegLocation);
  if (options.exec) args.push('--exec', options.exec);
  if (options.noExec) args.push('--no-exec');
  if (options.convertSubs) args.push('--convert-subs', options.convertSubs);
  if (options.convertThumbnails)
    args.push('--convert-thumbnails', options.convertThumbnails);
  if (options.splitChapters) args.push('--split-chapters');
  if (options.noSplitChapters) args.push('--no-split-chapters');
  if (options.removeChapters)
    args.push('--remove-chapters', options.removeChapters);
  if (options.noRemoveChapters) args.push('--no-remove-chapters');
  if (options.forceKeyframesAtCuts) args.push('--force-keyframes-at-cuts');
  if (options.noForceKeyframesAtCuts) args.push('--no-force-keyframes-at-cuts');

  if (options.usePostProcessor && options.usePostProcessor.length > 0) {
    for (const pp of options.usePostProcessor) {
      args.push('--use-postprocessor', pp);
    }
  }

  // SponsorBlock Options
  if (options.sponsorblockMark && options.sponsorblockMark.length > 0) {
    args.push('--sponsorblock-mark', options.sponsorblockMark.join(','));
  }
  if (options.sponsorblockRemove && options.sponsorblockRemove.length > 0) {
    args.push('--sponsorblock-remove', options.sponsorblockRemove.join(','));
  }
  if (options.sponsorblockChapterTitle)
    args.push('--sponsorblock-chapter-title', options.sponsorblockChapterTitle);
  if (options.noSponsorblock) args.push('--no-sponsorblock');
  if (options.sponsorblockApi)
    args.push('--sponsorblock-api', options.sponsorblockApi);

  // Add any additional options
  if (options.additionalOptions && options.additionalOptions.length > 0) {
    args.push(...options.additionalOptions);
  }

  return args;
}
