/**
 * CLI Interactive Flows
 * Provides interactive TUI flows for various CLI actions.
 */

import { ArgsOptions, FormatOptions, VideoInfo, VideoFormat } from '../types';
import { YtDlp } from '..';
import { CliConfig, loadConfig, updateConfig } from '../configs/config';
import {
  createPrompter,
  promptConfirm,
  promptMultiSelect,
  promptSelect,
  promptText,
} from './prompts';
import { applyConfigDefaults, formatTableRows, progressHandler } from './utils';

/**
 * Interactive video download flow.
 */
export async function interactiveDownload(
  ytdlp: YtDlp,
  config: CliConfig,
  audioOnly?: boolean,
): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = await promptText(ask, 'Video URL');
    if (!url) return;

    let formatChoice: string | FormatOptions<'audioonly'>['format'] | undefined;

    if (audioOnly) {
      formatChoice = {
        filter: 'audioonly',
        type: 'mp3',
        quality: 5,
      };
    } else {
      const formatMode = await promptSelect(ask, 'Format', [
        { value: 'best', label: 'Best available' },
        { value: 'worst', label: 'Worst available' },
        { value: 'audio-only', label: 'Audio only' },
        { value: 'picker', label: 'Pick from list' },
        { value: 'custom', label: 'Custom format string' },
      ]);
      if (!formatMode) return;

      if (formatMode === 'best' || formatMode === 'worst') {
        formatChoice = formatMode;
      }
      if (formatMode === 'audio-only') {
        formatChoice = {
          filter: 'audioonly',
          type: 'mp3',
          quality: 5,
        };
      }
      if (formatMode === 'custom') {
        const custom = await promptText(ask, 'yt-dlp format string');
        if (!custom) return;
        formatChoice = String(custom);
      }
      if (formatMode === 'picker') {
        const result = await ytdlp.getFormatsAsync(String(url));
        let formatOptions: { value: string; label: string }[] = [];
        if (result.source === 'json' && result.formats) {
          formatOptions = result.formats.map((f: VideoFormat) => ({
            value: f.format_id,
            label:
              `${f.format_id} ${f.ext || ''} ${f.resolution || ''} ${f.format_note || ''}`.trim(),
          }));
        }
        const selection = await promptSelect(
          ask,
          'Pick a format',
          formatOptions,
        );
        if (!selection) return;
        formatChoice = String(selection);
      }
    }

    const options: ArgsOptions = {};
    applyConfigDefaults(options, config);

    const shouldPrintPaths = await promptConfirm(
      ask,
      'Return output file paths after download?',
      true,
    );
    if (shouldPrintPaths === null) return;

    const runProgress = await promptConfirm(ask, 'Show progress', true);
    if (runProgress === null) return;

    const formatOptions: FormatOptions<'audioonly'> = {
      ...options,
      format: formatChoice,
      onProgress: runProgress ? progressHandler('Downloading') : undefined,
      printPaths: Boolean(shouldPrintPaths),
      onPaths: shouldPrintPaths
        ? (paths) => {
            if (runProgress) process.stdout.write('\n');
            console.log(paths.join('\n'));
          }
        : undefined,
    };

    await ytdlp.downloadAsync(String(url), formatOptions);
    if (!shouldPrintPaths && runProgress) process.stdout.write('\n');
  } finally {
    close();
  }
}

/**
 * Interactive video info flow.
 */
export async function interactiveInfo(ytdlp: YtDlp): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = await promptText(ask, 'Video URL');
    if (!url) return;
    const info = await ytdlp.getInfoAsync(String(url));
    console.log(JSON.stringify(info, null, 2));
  } finally {
    close();
  }
}

/**
 * Interactive formats listing flow.
 */
export async function interactiveFormats(ytdlp: YtDlp): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = await promptText(ask, 'Video URL');
    if (!url) return;
    const result = await ytdlp.getFormatsAsync(String(url));
    if (result.source === 'json' && result.formats) {
      const rows = result.formats.map((f: VideoFormat) => ({
        formatId: f.format_id,
        extension: f.ext || '',
        resolution: f.resolution || '',
        note: f.format_note || '',
        raw: '',
      }));
      console.log(formatTableRows(rows));
    } else {
      console.log('No formats found');
    }
  } finally {
    close();
  }
}

/**
 * Interactive direct URLs flow.
 */
export async function interactiveUrls(ytdlp: YtDlp): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = await promptText(ask, 'Video URL');
    if (!url) return;
    const urls = await ytdlp.getDirectUrlsAsync(String(url));
    console.log(urls.join('\n'));
  } finally {
    close();
  }
}

/**
 * Interactive subtitles download flow.
 */
export async function interactiveSubtitles(
  ytdlp: YtDlp,
  config: CliConfig,
): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = await promptText(ask, 'Video URL');
    if (!url) return;

    let languages: string[] = [];
    try {
      const info = (await ytdlp.getInfoAsync(String(url))) as VideoInfo;
      languages = [
        ...Object.keys(info.subtitles || {}),
        ...Object.keys(info.automatic_captions || {}),
      ];
    } catch {
      languages = [];
    }

    const selectedLanguages = await promptMultiSelect(
      ask,
      'Subtitle languages',
      languages.length > 0
        ? languages.map((lang) => ({ value: lang, label: lang }))
        : [{ value: 'en', label: 'en' }],
    );
    if (!selectedLanguages) return;

    const format = await promptSelect(ask, 'Subtitle format', [
      { value: 'vtt', label: 'vtt' },
      { value: 'srt', label: 'srt' },
      { value: 'ass', label: 'ass' },
    ]);
    if (!format) return;

    const embed = await promptConfirm(
      ask,
      'Embed subtitles',
      config.subtitles?.embed ?? false,
    );
    if (embed === null) return;

    const includeAuto = await promptConfirm(
      ask,
      'Include auto subtitles',
      config.subtitles?.auto ?? false,
    );
    if (includeAuto === null) return;

    const options: ArgsOptions = {
      writeSubs: true,
      writeAutoSubs: Boolean(includeAuto),
      subLangs: selectedLanguages as string[],
      subFormat: String(format),
      embedSubs: Boolean(embed),
      skipDownload: true,
    };
    applyConfigDefaults(options, config);

    await ytdlp.execAsync(String(url), options);
  } finally {
    close();
  }
}

/**
 * Interactive SponsorBlock download flow.
 */
export async function interactiveSponsorblock(
  ytdlp: YtDlp,
  config: CliConfig,
): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = await promptText(ask, 'Video URL');
    if (!url) return;

    const categories = await promptMultiSelect(
      ask,
      'SponsorBlock categories',
      [
        { value: 'sponsor', label: 'sponsor' },
        { value: 'intro', label: 'intro' },
        { value: 'outro', label: 'outro' },
        { value: 'selfpromo', label: 'selfpromo' },
        { value: 'interaction', label: 'interaction' },
        { value: 'preview', label: 'preview' },
        { value: 'filler', label: 'filler' },
      ],
      config.sponsorblock?.categories,
    );
    if (!categories) return;

    const mode = await promptSelect(
      ask,
      'SponsorBlock mode',
      [
        { value: 'mark', label: 'Mark as chapters' },
        { value: 'remove', label: 'Remove/cut' },
      ],
      config.sponsorblock?.mode ?? 'remove',
    );
    if (!mode) return;

    const options: ArgsOptions = {};
    applyConfigDefaults(options, config);
    if (mode === 'mark') options.sponsorblockMark = categories as string[];
    if (mode === 'remove') options.sponsorblockRemove = categories as string[];

    await ytdlp.downloadAsync(String(url), options);
  } finally {
    close();
  }
}

/**
 * Interactive sections/time range download flow.
 */
export async function interactiveSections(
  ytdlp: YtDlp,
  config: CliConfig,
): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = await promptText(ask, 'Video URL');
    if (!url) return;

    const sections = await promptText(
      ask,
      'Section range (e.g. *10:15-20:00 or chapter:Intro)',
    );
    if (!sections) return;

    const splitChapters = await promptConfirm(ask, 'Split chapters', false);
    if (splitChapters === null) return;

    const options: ArgsOptions = {
      downloadSections: String(sections),
      splitChapters: Boolean(splitChapters),
    };
    applyConfigDefaults(options, config);
    await ytdlp.downloadAsync(String(url), options);
  } finally {
    close();
  }
}

/**
 * Interactive yt-dlp update flow.
 */
export async function interactiveUpdate(ytdlp: YtDlp): Promise<void> {
  const result = await ytdlp.updateYtDlpAsync();
  console.log(
    `Updated via ${result.method}. Binary: ${result.binaryPath}${
      result.version ? ` (version ${result.version})` : ''
    }`,
  );
}

/**
 * Interactive settings configuration flow.
 */
export async function interactiveSettings(config: CliConfig): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const downloadDir = await promptText(
      ask,
      'Default download directory',
      config.downloadDir ?? '',
    );
    if (downloadDir === null) return;

    const defaultFormat = await promptText(
      ask,
      'Default format',
      config.defaultFormat ?? '',
    );
    if (defaultFormat === null) return;

    const subLangs = await promptText(
      ask,
      'Subtitle languages (comma-separated)',
      (config.subtitles?.languages || []).join(','),
    );
    if (subLangs === null) return;

    const subFormat = await promptText(
      ask,
      'Subtitle format',
      config.subtitles?.format ?? 'vtt',
    );
    if (subFormat === null) return;

    const embedSubs = await promptConfirm(
      ask,
      'Embed subtitles',
      config.subtitles?.embed ?? false,
    );
    if (embedSubs === null) return;

    const sponsorCategories = await promptText(
      ask,
      'SponsorBlock categories (comma-separated)',
      (config.sponsorblock?.categories || []).join(','),
    );
    if (sponsorCategories === null) return;

    const sponsorMode = await promptSelect(
      ask,
      'SponsorBlock mode',
      [
        { value: 'mark', label: 'Mark as chapters' },
        { value: 'remove', label: 'Remove/cut' },
      ],
      config.sponsorblock?.mode ?? 'remove',
    );
    if (!sponsorMode) return;

    const proxy = await promptText(ask, 'Proxy', config.proxy ?? '');
    if (proxy === null) return;

    const cookiesPath = await promptText(
      ask,
      'Cookies file path',
      config.cookiesPath ?? '',
    );
    if (cookiesPath === null) return;

    const concurrency = await promptText(
      ask,
      'Concurrent fragments',
      config.concurrency?.toString() ?? '',
    );
    if (concurrency === null) return;

    const verbose = await promptConfirm(
      ask,
      'Verbose logging',
      config.verbose ?? false,
    );
    if (verbose === null) return;

    await updateConfig({
      downloadDir: String(downloadDir) || undefined,
      defaultFormat: String(defaultFormat) || undefined,
      subtitles: {
        languages: String(subLangs)
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        format: String(subFormat) || undefined,
        embed: Boolean(embedSubs),
      },
      sponsorblock: {
        categories: String(sponsorCategories)
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        mode: sponsorMode as 'mark' | 'remove',
      },
      proxy: String(proxy) || undefined,
      cookiesPath: String(cookiesPath) || undefined,
      concurrency: Number(concurrency) || undefined,
      verbose: Boolean(verbose),
    });
  } finally {
    close();
  }
}

/**
 * Main interactive mode menu.
 */
export async function runInteractive(): Promise<void> {
  const ytdlp = new YtDlp();
  const config = await loadConfig();

  console.log('ytdlp-nodejs');
  const { ask, close } = createPrompter();
  try {
    const action = await promptSelect(ask, 'Choose an action', [
      { value: 'download', label: 'Download video' },
      { value: 'audio', label: 'Download audio only' },
      { value: 'info', label: 'Get info (JSON summary)' },
      { value: 'formats', label: 'List formats' },
      { value: 'urls', label: 'Get direct URLs' },
      { value: 'subs', label: 'Subtitles flow' },
      { value: 'sponsorblock', label: 'SponsorBlock flow' },
      { value: 'sections', label: 'Download sections/time range' },
      { value: 'update', label: 'Update yt-dlp' },
      { value: 'settings', label: 'Settings' },
    ]);

    if (!action) return;

    switch (action) {
      case 'download':
        await interactiveDownload(ytdlp, config);
        break;
      case 'audio':
        await interactiveDownload(ytdlp, config, true);
        break;
      case 'info':
        await interactiveInfo(ytdlp);
        break;
      case 'formats':
        await interactiveFormats(ytdlp);
        break;
      case 'urls':
        await interactiveUrls(ytdlp);
        break;
      case 'subs':
        await interactiveSubtitles(ytdlp, config);
        break;
      case 'sponsorblock':
        await interactiveSponsorblock(ytdlp, config);
        break;
      case 'sections':
        await interactiveSections(ytdlp, config);
        break;
      case 'update':
        await interactiveUpdate(ytdlp);
        break;
      case 'settings':
        await interactiveSettings(config);
        break;
      default:
        break;
    }
  } finally {
    close();
  }

  console.log('Done');
}
