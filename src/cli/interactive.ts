/**
 * CLI Interactive Flows - Masterpiece 10+ step wizard
 * Adaptive probe + full interactive without flag memorization
 */

import {
  ArgsOptions,
  FormatOptions,
  AudioFormat,
  VideoInfo,
  PlaylistInfo,
  VideoFormat,
} from '../types';
import { YtDlp } from '..';
import {
  createPrompter,
  promptSelect,
  promptText,
  promptConfirm,
  promptMultiSelect,
} from './prompts';
import { buildArgsOptions, progressHandler } from './utils';
import { Colors, Style, color } from './style';

// ── helpers ─────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let b = Number(bytes);
  let u = 0;
  while (b >= 1024 && u < units.length - 1) {
    b /= 1024;
    u++;
  }
  return `${b.toFixed(b >= 10 ? 0 : 1)} ${units[u]}`;
}

function buildDynamicQualityOptions(info: VideoInfo): Array<{ value: string; label: string }> | null {
  const fmts: VideoFormat[] = (info as unknown as { formats?: VideoFormat[] }).formats || [];
  if (!fmts.length) return null;
  // distinct video heights
  const heights = [
    ...new Set(
      fmts
        .filter((f) => (f as unknown as { vcodec?: string }).vcodec !== 'none' && (f as unknown as { height?: number }).height)
        .map((f) => (f as unknown as { height: number }).height)
        .filter((h) => typeof h === 'number' && h > 0),
    ),
  ].sort((a, b) => b - a);
  if (heights.length === 0) return null;

  const labelMap: Record<number, string> = {
    2160: '4K (2160p)',
    1440: '2K (1440p)',
    1080: 'Full HD (1080p)',
    720: 'HD (720p)',
    480: 'SD (480p)',
    360: 'SD (360p)',
    240: 'SD (240p)',
    144: '144p',
  };

  const opts: Array<{ value: string; label: string }> = [];

  // best
  const topH = heights[0];
  opts.push({ value: 'best', label: `Best Available${topH ? ` (${topH}p)` : ''}  -  auto mix` });

  for (const h of heights) {
    const atH = fmts.filter(
      (f) =>
        (f as unknown as { height?: number }).height === h &&
        (f as unknown as { vcodec?: string }).vcodec !== 'none',
    );
    const exemplar = atH[0] as unknown as { width?: number; height?: number; filesize?: number; filesize_approx?: number } | undefined;
    let sizeHint = '';
    const bestAtH = [...atH].sort((a, b) => {
      const sa = (a as unknown as { filesize?: number; filesize_approx?: number }).filesize || (a as unknown as { filesize_approx?: number }).filesize_approx || 0;
      const sb = (b as unknown as { filesize?: number; filesize_approx?: number }).filesize || (b as unknown as { filesize_approx?: number }).filesize_approx || 0;
      return sb - sa;
    })[0] as unknown as { filesize?: number; filesize_approx?: number } | undefined;
    if (bestAtH) {
      const b = bestAtH.filesize || bestAtH.filesize_approx;
      if (b) sizeHint = ` ~${formatBytes(b)}`;
    }
    const resHint = exemplar?.width ? ` ${exemplar.width}x${exemplar.height}` : '';
    const baseLabel = labelMap[h] || `${h}p`;
    opts.push({ value: String(h), label: `${baseLabel}${resHint}${sizeHint}` });
  }

  opts.push({ value: 'worst', label: 'Smallest File  -  fastest' });
  return opts;
}

async function probeInfo(ytdlp: YtDlp, url: string): Promise<VideoInfo | PlaylistInfo | null> {
  try {
    console.log(Style.muted('  Probing video info (fetching available formats)...'));
    const info = (await ytdlp.getInfoAsync(url)) as unknown as VideoInfo | PlaylistInfo;
    if ((info as unknown as { _type?: string })._type === 'playlist') {
      const p = info as unknown as PlaylistInfo;
      const count = (p as unknown as { playlist_count?: number; n_entries?: number }).playlist_count
        || (p as unknown as { n_entries?: number }).n_entries
        || (Array.isArray((p as unknown as { entries?: unknown[] }).entries) ? (p as unknown as { entries: unknown[] }).entries.length : 0);
      console.log(Style.info(`  Detected playlist: ${count || '?'} videos`));
    } else {
      const v = info as unknown as VideoInfo;
      const title = (v.title || '').slice(0, 62);
      const dur = (v as unknown as { duration_string?: string }).duration_string || '';
      if (title) console.log(Style.muted(`  Found: ${title}${dur ? ` (${dur})` : ''}`));
      const fmts = (v as unknown as { formats?: unknown[] }).formats;
      if (Array.isArray(fmts)) console.log(Style.muted(`  Formats: ${fmts.length} available`));
    }
    return info;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Don't spam full stack, just hint
    const short = msg.slice(0, 120);
    console.log(Style.warning(`  Could not probe (${short})  -  showing generic qualities`));
    if (msg.toLowerCase().includes('sign in') || msg.toLowerCase().includes('cookies') || msg.toLowerCase().includes('private')) {
      console.log(Style.muted('  Hint: try Authentication → Cookies from browser / Cookies file'));
    }
    return null;
  }
}

// ── main wizard ─────────────────────────────────────────────

/**
 * Interactive video download flow  -  10-step wizard + adaptive probe + advanced submenu.
 * See src/cli/prompts.ts:52 (promptConfirm), src/cli/prompts.ts:118 (promptMultiSelect)
 * See src/cli/utils.ts:157 (buildArgsOptions), src/builder/base-builder.ts:348 (getCommand)
 */
export async function interactiveDownload(
  ytdlp: YtDlp,
  audioOnly: boolean = false,
  prefilledUrl?: string,
): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    // Step 1  -  URL
    const url = prefilledUrl || (await promptText(ask, 'Video URL'));
    if (!url) return;

    const cliOptions: Record<string, string | boolean | string[]> = {};

    let format: string | undefined;
    let type: AudioFormat | undefined;

    // Step 1b  -  Adaptive probe (video only; audio skips)
    let probed: VideoInfo | PlaylistInfo | null = null;
    let isPlaylistProbe = false;
    if (!audioOnly) {
      probed = await probeInfo(ytdlp, url);
      isPlaylistProbe = !!(probed && (probed as unknown as { _type?: string })._type === 'playlist');
    }

    // Step 2  -  Quality
    if (audioOnly) {
      const audioChoice = await promptSelect(ask, 'Audio Format/Quality', [
        { value: 'mp3', label: 'MP3 (Best compatibility)' },
        { value: 'm4a', label: 'M4A (Better quality)' },
        { value: 'wav', label: 'WAV (Uncompressed)' },
        { value: 'opus', label: 'OPUS (Smallest)' },
        { value: 'best', label: 'Best Quality (Auto)' },
      ]);
      if (!audioChoice) return;
      type = audioChoice === 'best' ? undefined : (audioChoice as AudioFormat);
    } else {
      let qualityChoices: Array<{ value: string; label: string }>;
      const dynamic = probed && !isPlaylistProbe ? buildDynamicQualityOptions(probed as VideoInfo) : null;
      if (dynamic && dynamic.length >= 3) {
        qualityChoices = dynamic;
        console.log(Style.muted('  (qualities tailored to this video)'));
      } else {
        qualityChoices = [
          { value: 'best', label: 'Best Available  -  auto mix' },
          { value: '2160', label: '4K (2160p)' },
          { value: '1440', label: '2K (1440p)' },
          { value: '1080', label: 'Full HD (1080p)' },
          { value: '720', label: 'HD (720p)' },
          { value: '480', label: 'SD (480p)' },
          { value: 'worst', label: 'Smallest File' },
        ];
      }
      const qualityChoice = await promptSelect(ask, 'Video Quality', qualityChoices);
      if (!qualityChoice) return;

      if (qualityChoice === 'best') format = 'bestvideo+bestaudio/best';
      else if (qualityChoice === 'worst') format = 'worstvideo+worstaudio/worst';
      else format = `bestvideo[height<=${qualityChoice}]+bestaudio/best[height<=${qualityChoice}]`;
    }

    // Step 3  -  Output filename (see src/types/ArgsOptions.ts:439 output)
    const outputInput = await promptText(ask, 'Output filename [Enter for default]', '%(title)s.%(ext)s');
    if (outputInput === null) return;
    if (outputInput && outputInput !== '%(title)s.%(ext)s') {
      // Normalize --name alias: bare name -> name.%(ext)s (yoinks PR #15)
      const norm = outputInput.includes('%(') ? outputInput : outputInput.includes('.') && !outputInput.endsWith('.') ? outputInput : `${outputInput}.%(ext)s`;
      cliOptions.output = norm;
      (cliOptions as Record<string, unknown>).name = norm;
    }

    // Step 4  -  Container (merge output format) (see src/types/ArgsOptions.ts:637)
    const container = await promptSelect(ask, 'Output container', [
      { value: 'none', label: 'None (keep original)' },
      { value: 'mp4', label: 'MP4  -  widest compatibility' },
      { value: 'mkv', label: 'MKV  -  keeps all streams' },
      { value: 'webm', label: 'WEBM' },
    ]);
    if (container === null) return;
    if (container !== 'none') cliOptions.mergeOutputFormat = container;

    // Step 5  -  Subtitles (see src/types/ArgsOptions.ts:660 writeSubs, :679 subLangs)
    let writeSubs = false;
    let subLangs: string[] = [];
    let embedSubs = false;
    let writeAutoSubs = false;

    const wantSubs = await promptConfirm(ask, 'Download subtitles?', false);
    if (wantSubs === null) return;
    if (wantSubs) {
      writeSubs = true;
      const langs = await promptMultiSelect(ask, 'Subtitle languages', [
        { value: 'en', label: 'English' },
        { value: 'id', label: 'Indonesian' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'zh', label: 'Chinese' },
        { value: 'all', label: 'All languages' },
      ]);
      if (langs === null) return;
      if (langs.length > 0) subLangs = langs.includes('all') ? ['all'] : langs;
      else subLangs = ['en'];

      const wantEmbedSubs = await promptConfirm(ask, 'Embed subtitles into video?', false);
      if (wantEmbedSubs === null) return;
      embedSubs = !!wantEmbedSubs;

      const wantAuto = await promptConfirm(ask, 'Also download auto-generated subtitles?', false);
      if (wantAuto === null) return;
      writeAutoSubs = !!wantAuto;
    }

    // Step 6  -  Embed checklist (see src/types/ArgsOptions.ts:757 embedThumbnail, 763 embedMetadata, 769 embedChapters)
    const embedChoices = await promptMultiSelect(ask, 'Embed options (comma-separated, Enter to skip)', [
      { value: 'thumbnail', label: 'Embed thumbnail' },
      { value: 'metadata', label: 'Embed metadata' },
      { value: 'chapters', label: 'Embed chapters' },
    ]);
    if (embedChoices === null) return;
    const embedThumbnail = embedChoices.includes('thumbnail');
    const embedMetadata = embedChoices.includes('metadata');
    const embedChapters = embedChoices.includes('chapters');

    // Step 7  -  Auth (see src/types/ArgsOptions.ts:418 cookies, :317 cookiesFromBrowser)
    const auth = await promptSelect(ask, 'Authentication', [
      { value: 'none', label: 'None' },
      { value: 'cookies', label: 'Cookies file (--cookies)' },
      { value: 'browser', label: 'Cookies from browser (--cookies-from-browser)' },
    ]);
    if (auth === null) return;
    let cookies: string | undefined;
    let cookiesFromBrowser: string | undefined;
    if (auth === 'cookies') {
      const p = await promptText(ask, 'Path to cookies.txt');
      if (p === null) return;
      if (p) cookies = p;
    } else if (auth === 'browser') {
      const b = await promptText(ask, 'Browser (chrome / firefox / edge / brave / opera)');
      if (b === null) return;
      cookiesFromBrowser = (b || 'chrome').trim().toLowerCase();
      if (!['chrome', 'firefox', 'edge', 'brave', 'opera', 'chromium', 'vivaldi'].includes(cookiesFromBrowser)) {
        console.log(Style.warning(`  Unknown browser "${cookiesFromBrowser}", will try as-is`));
      }
    }

    // Step 8  -  Playlist (see src/types/ArgsOptions.ts:141 playlistItems, 171 noPlaylist)
    // If probe detected playlist, default hint
    const playlistDefaultHint = isPlaylistProbe ? Style.muted(' (detected playlist)') : '';
    console.log(playlistDefaultHint ? `\n${Style.info('Playlist detected  -  choose how to handle it')}` : '');
    const playlistMode = await promptSelect(ask, 'Playlist handling', [
      { value: 'single', label: 'Single video only (--no-playlist)' },
      { value: 'all', label: 'Download all (playlist)' },
      { value: 'custom', label: 'Custom items (--playlist-items 1,3,5-7)' },
    ]);
    if (playlistMode === null) return;
    let noPlaylist = false;
    let playlistItems: string | undefined;
    let yesPlaylist = false;
    if (playlistMode === 'single') noPlaylist = true;
    else if (playlistMode === 'all') yesPlaylist = true;
    else if (playlistMode === 'custom') {
      const items = await promptText(ask, 'Playlist items (e.g. 1,3,5-7)');
      if (items === null) return;
      if (items) playlistItems = items;
    }

    // Step 9  -  Network
    const proxyInput = await promptText(ask, 'Proxy URL [Enter to skip]');
    if (proxyInput === null) return;
    if (proxyInput) cliOptions.proxy = proxyInput;

    const rateInput = await promptText(ask, 'Rate limit (e.g. 500K, 1M) [Enter to skip]');
    if (rateInput === null) return;
    if (rateInput) cliOptions.limitRate = rateInput;

    // Step 9b  -  Advanced submenu (power-user)
    const wantAdvanced = await promptConfirm(ask, 'Configure advanced options?', false);
    let advConcurrent: number | undefined;
    let advRetries: number | undefined;
    let advTimeout: number | undefined;
    let advSections: string | undefined;
    let advSort: string | undefined;
    let advSponsor: string[] | undefined;
    if (wantAdvanced) {
      const cf = await promptSelect(ask, 'Concurrent fragments (faster on good net)', [
        { value: 'default', label: 'Default (1)' },
        { value: '4', label: '4' },
        { value: '8', label: '8' },
        { value: '16', label: '16' },
      ]);
      if (cf === null) return;
      if (cf !== 'default') advConcurrent = Number(cf);

      const ret = await promptText(ask, 'Retries [Enter to skip]', '10');
      if (ret === null) return;
      if (ret && ret !== '10') advRetries = Number(ret);

      const to = await promptText(ask, 'Socket timeout seconds [Enter to skip]');
      if (to === null) return;
      if (to) advTimeout = Number(to);

      const sec = await promptText(ask, 'Download sections (e.g. *0:00-0:30) [Enter to skip]');
      if (sec === null) return;
      if (sec) advSections = sec;

      const sort = await promptText(ask, 'Format sort (e.g. res,ext:mp4:m4a) [Enter to skip]');
      if (sort === null) return;
      if (sort) advSort = sort;

      const sponsorChoices = await promptMultiSelect(ask, 'SponsorBlock (select to mark/remove)', [
        { value: 'sponsor', label: 'Sponsor' },
        { value: 'intro', label: 'Intro' },
        { value: 'outro', label: 'Outro' },
        { value: 'interaction', label: 'Interaction' },
        { value: 'selfpromo', label: 'Selfpromo' },
        { value: 'preview', label: 'Preview' },
        { value: 'music_offtopic', label: 'Music Offtopic' },
      ]);
      if (sponsorChoices === null) return;
      if (sponsorChoices.length) advSponsor = sponsorChoices;
    }

    // Wire buildArgsOptions (see src/cli/utils.ts:157)
    if (!cliOptions.output && (cliOptions as Record<string, string>).name) {
      cliOptions.output = (cliOptions as Record<string, string>).name;
    }
    const baseOptions: ArgsOptions = buildArgsOptions(
      cliOptions as unknown as Record<string, string | boolean | string[]>,
    );

    if (writeSubs) baseOptions.writeSubs = true;
    if (subLangs.length) baseOptions.subLangs = subLangs;
    if (embedSubs) baseOptions.embedSubs = true;
    if (writeAutoSubs) baseOptions.writeAutoSubs = true;
    if (embedThumbnail) baseOptions.embedThumbnail = true;
    if (embedMetadata) baseOptions.embedMetadata = true;
    if (embedChapters) baseOptions.embedChapters = true;
    if (cookies) baseOptions.cookies = cookies;
    if (cookiesFromBrowser) baseOptions.cookiesFromBrowser = cookiesFromBrowser;
    if (noPlaylist) baseOptions.noPlaylist = true;
    if (yesPlaylist) baseOptions.yesPlaylist = true;
    if (playlistItems) baseOptions.playlistItems = playlistItems;
    if (advConcurrent !== undefined) baseOptions.concurrentFragments = advConcurrent;
    if (advRetries !== undefined) baseOptions.retries = advRetries;
    if (advTimeout !== undefined) baseOptions.socketTimeout = advTimeout;
    if (advSections) baseOptions.downloadSections = advSections;
    if (advSort) baseOptions.formatSort = advSort.split(',').map((s) => s.trim()).filter(Boolean);
    if (advSponsor && advSponsor.length) {
      baseOptions.sponsorblockMark = advSponsor;
      // also wire remove if user wants  -  we mark same cats
      baseOptions.sponsorblockRemove = advSponsor;
    }

    // Step 10  -  Preview command via getCommand() + confirm before run (see src/builder/base-builder.ts:348)
    let builder: import('../builder/download-builder').Download;
    if (audioOnly) {
      const fmt: FormatOptions<'audioonly'> = {
        ...baseOptions,
        format: {
          filter: 'audioonly',
          type: type || 'mp3',
          quality: 0,
        } as unknown as FormatOptions<'audioonly'>['format'],
      };
      builder = ytdlp.download(url, fmt as unknown as FormatOptions<'audioonly'>) as unknown as import('../builder/download-builder').Download;
    } else {
      const fmtOptions: FormatOptions<'videoonly'> = {
        ...baseOptions,
        format: format as string,
      };
      builder = ytdlp.download(url, fmtOptions as unknown as FormatOptions<'videoonly'>) as unknown as import('../builder/download-builder').Download;
    }

    const commandStr = builder.getCommand();
    console.log(`\n${Style.info('Command preview:')}`);
    console.log(`  ${Style.muted(commandStr)}\n`);

    const proceed = await promptConfirm(ask, 'Proceed with download?', true);
    if (proceed === null || !proceed) {
      console.log(Style.warning('Cancelled.'));
      return;
    }

    console.log(`\n${Style.info('Starting download...')}\n`);

    if (audioOnly) builder.on('progress', progressHandler('Downloading Audio'));
    else builder.on('progress', progressHandler('Downloading Video'));

    const result = await builder.run();
    console.log(`\n\n${Style.success('Download Complete!')}`);
    if (result.filePaths.length) console.log(result.filePaths.map((p) => ` - ${p}`).join('\n'));
    if (result.info && (result.info as unknown as { title?: string }).title) {
      console.log(Style.muted(`  Title: ${(result.info as unknown as { title: string }).title}`));
    }
  } catch (err) {
    console.error(`\n${Style.error('Error occurred:')} ${err}`);
  } finally {
    close();
  }
}

/**
 * Formats and prints video info.
 */
function printVideoInfo(info: VideoInfo) {
  console.log(`\n${Style.title('Video Information')}`);
  console.log(`  ${color('Title:', Colors.fg.cyan)}       ${info.title}`);
  console.log(`  ${color('Uploader:', Colors.fg.cyan)}    ${info.uploader} ${Style.muted(`(${info.uploader_id})`)}`);
  console.log(`  ${color('Channel:', Colors.fg.cyan)}     ${info.channel} ${info.channel_follower_count ? Style.muted(`(${info.channel_follower_count.toLocaleString()} subs)`) : ''}`);
  console.log(`  ${color('Duration:', Colors.fg.cyan)}    ${info.duration_string || info.duration + 's'}`);
  console.log(`  ${color('Views:', Colors.fg.cyan)}       ${info.view_count?.toLocaleString()}`);
  if (info.like_count) console.log(`  ${color('Likes:', Colors.fg.cyan)}       ${info.like_count.toLocaleString()}`);
  if (info.comment_count) console.log(`  ${color('Comments:', Colors.fg.cyan)}    ${info.comment_count.toLocaleString()}`);
  console.log(`  ${color('Resolution:', Colors.fg.cyan)}  ${info.resolution || info.width + 'x' + info.height} ${info.fps ? `(${info.fps}fps)` : ''}`);
  console.log(`  ${color('Date:', Colors.fg.cyan)}        ${info.upload_date}`);
  console.log(`  ${color('URL:', Colors.fg.cyan)}         ${info.webpage_url}`);
  if (info.tags && info.tags.length > 0) {
    const tags = info.tags.slice(0, 5).join(', ') + (info.tags.length > 5 ? '...' : '');
    console.log(`  ${color('Tags:', Colors.fg.cyan)}        ${Style.muted(tags)}`);
  }
  if (info.description) {
    const desc = info.description.split('\n')[0].substring(0, 100) + (info.description.length > 100 ? '...' : '');
    console.log(`  ${color('Description:', Colors.fg.cyan)} ${Style.muted(desc)}`);
  }
}

/**
 * Formats and prints playlist info.
 */
function printPlaylistInfo(info: PlaylistInfo) {
  console.log(`\n${Style.title('Playlist Information')}`);
  console.log(`  ${color('Title:', Colors.fg.cyan)}       ${info.title}`);
  console.log(`  ${color('Count:', Colors.fg.cyan)}       ${info.playlist_count} videos`);
  console.log(`  ${color('URL:', Colors.fg.cyan)}         ${info.webpage_url}`);
  if (info.entries && info.entries.length > 0) {
    console.log(`\n${Style.info('First 5 entries:')}`);
    info.entries.slice(0, 5).forEach((entry, i) => {
      console.log(`  ${i + 1}. ${entry.title} ${Style.muted(`(${entry.duration_string || 'N/A'})`)}`);
    });
    if (info.entries.length > 5) console.log(`  ... and ${info.entries.length - 5} more`);
  }
}

/**
 * Interactive Info Flow
 */
export async function interactiveInfo(ytdlp: YtDlp, prefilledUrl?: string): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = prefilledUrl || (await promptText(ask, 'Video URL'));
    if (!url) return;
    console.log(Style.info('Fetching info...'));
    const info = (await ytdlp.getInfoAsync(url)) as VideoInfo | PlaylistInfo;
    if (info._type === 'playlist') printPlaylistInfo(info as PlaylistInfo);
    else printVideoInfo(info as VideoInfo);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n${Style.error('Error:')} ${message}`);
  } finally {
    close();
  }
}

/**
 * Main interactive mode menu.
 */
export async function runInteractive(): Promise<void> {
  const ytdlp = new YtDlp();
  console.clear();
  console.log(
    color(
      `
__   __ _____  ____   _      ____  
\\ \\ / /|_   _||  _ \\ | |    |  _ \\ 
 \\ V /   | |  | | | || |    | |_) |
  | |    | |  | |_| || |___ |  __/ 
  |_|    |_|  |____/ |_____||_|    
`,
      Colors.fg.red,
    ),
  );
  console.log(Style.muted('  Powerful yt-dlp wrapper for Node.js   -   masterpiece wizard (adaptive probe)\n'));
  const { ask, close } = createPrompter();
  try {
    const action = await promptSelect(ask, 'Choose Action', [
      { value: 'download', label: 'Download Video' },
      { value: 'audio', label: 'Download Audio Only' },
      { value: 'info', label: 'Get Video Info' },
      { value: 'update', label: 'Update yt-dlp Binary' },
      { value: 'ffmpeg', label: 'Download FFmpeg' },
    ]);
    if (action) {
      switch (action) {
        case 'download':
          await interactiveDownload(ytdlp, false);
          break;
        case 'audio':
          await interactiveDownload(ytdlp, true);
          break;
        case 'info':
          await interactiveInfo(ytdlp);
          break;
        case 'update': {
          console.log(Style.info('Updating yt-dlp...'));
          const res = await ytdlp.updateYtDlpAsync();
          console.log(Style.success(`Updated to ${res.version || 'latest'}`));
          break;
        }
        case 'ffmpeg': {
          console.log(Style.info('Downloading FFmpeg...'));
          const path = await ytdlp.downloadFFmpeg();
          if (path) console.log(Style.success(`FFmpeg available at: ${path}`));
          else console.log(Style.error('Failed to download FFmpeg.'));
          break;
        }
      }
    }
  } finally {
    close();
  }
}
