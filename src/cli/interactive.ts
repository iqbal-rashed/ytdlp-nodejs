/**
 * CLI Interactive Flows
 * Provides interactive TUI flows for various CLI actions.
 */

import {
  ArgsOptions,
  FormatOptions,
  AudioFormat,
  VideoInfo,
  PlaylistInfo,
} from '../types';
import { YtDlp } from '..';
import { createPrompter, promptSelect, promptText } from './prompts';
import { buildArgsOptions, progressHandler } from './utils';
import { Colors, Style, color } from './style';

/**
 * Ask for extra `exec` arguments (custom flags).
 */
async function promptExecArgs(
  ask: (message: string) => Promise<string>,
): Promise<string[]> {
  const extra = await promptText(
    ask,
    'Extra args (e.g. --embed-subs) [Enter to skip]',
  );
  if (!extra) return [];
  return extra
    .split(' ')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Interactive video download flow.
 */
export async function interactiveDownload(
  ytdlp: YtDlp,
  audioOnly: boolean = false,
  prefilledUrl?: string,
): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = prefilledUrl || (await promptText(ask, 'Video URL'));
    if (!url) return;

    let format: string | undefined;
    let type: AudioFormat | undefined;

    if (audioOnly) {
      const audioChoice = await promptSelect(ask, 'Audio Format/Quality', [
        { value: 'mp3', label: 'MP3 (Best compatibility)' },
        { value: 'm4a', label: 'M4A (Better quality)' },
        { value: 'wav', label: 'WAV (Uncompressed)' },
        { value: 'best', label: 'Best Quality (Auto)' },
      ]);
      if (!audioChoice) return;
      type = audioChoice === 'best' ? undefined : (audioChoice as AudioFormat);
    } else {
      const qualityChoice = await promptSelect(ask, 'Video Quality', [
        { value: 'best', label: 'Best Available' },
        { value: '2160', label: '4K (2160p)' },
        { value: '1440', label: '2K (1440p)' },
        { value: '1080', label: 'Full HD (1080p)' },
        { value: '720', label: 'HD (720p)' },
        { value: '480', label: 'SD (480p)' },
        { value: 'worst', label: 'Smallest File' },
      ]);
      if (!qualityChoice) return;

      if (qualityChoice === 'best') format = 'best';
      else if (qualityChoice === 'worst') format = 'worst';
      else
        format = `bestvideo[height<=${qualityChoice}]+bestaudio/best[height<=${qualityChoice}]`;
    }

    const execArgs = await promptExecArgs(ask);

    console.log(`\n${Style.info('Starting download...')}\n`);

    const options: ArgsOptions = buildArgsOptions({});
    if (execArgs.length > 0) {
      options.rawArgs = execArgs;
    }

    if (audioOnly) {
      // For audio, we use simpler args logic for now or custom logic
      // But since we removed config, we just use raw args or helpers
      // We will use the library's fluent or helper methods ideally, but here we use downloadAsync for flexibility

      // Construct audio-specific format options
      const formatOptions: FormatOptions<'audioonly'> = {
        ...options,
        format: {
          filter: 'audioonly',
          type: type || 'mp3',
          quality: 0, // Best
        },
        onProgress: progressHandler('Downloading Audio'),
      };
      const result = await ytdlp.downloadAsync(url, formatOptions);
      console.log(`\n\n${Style.success('Download Complete!')}`);
      if (result.filePaths.length)
        console.log(result.filePaths.map((p) => ` - ${p}`).join('\n'));
    } else {
      const formatOptions: FormatOptions<'videoonly'> = {
        ...options,
        format: format,
        mergeOutputFormat: 'mp4',
        onProgress: progressHandler('Downloading Video'),
      };

      const result = await ytdlp.downloadAsync(url, formatOptions);
      console.log(`\n\n${Style.success('Download Complete!')}`);
      if (result.filePaths.length)
        console.log(result.filePaths.map((p) => ` - ${p}`).join('\n'));
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
  console.log(
    `  ${color('Uploader:', Colors.fg.cyan)}    ${info.uploader} ${Style.muted(`(${info.uploader_id})`)}`,
  );
  console.log(
    `  ${color('Channel:', Colors.fg.cyan)}     ${info.channel} ${info.channel_follower_count ? Style.muted(`(${info.channel_follower_count.toLocaleString()} subs)`) : ''}`,
  );
  console.log(
    `  ${color('Duration:', Colors.fg.cyan)}    ${info.duration_string || info.duration + 's'}`,
  );
  console.log(
    `  ${color('Views:', Colors.fg.cyan)}       ${info.view_count?.toLocaleString()}`,
  );

  if (info.like_count) {
    console.log(
      `  ${color('Likes:', Colors.fg.cyan)}       ${info.like_count.toLocaleString()}`,
    );
  }
  if (info.comment_count) {
    console.log(
      `  ${color('Comments:', Colors.fg.cyan)}    ${info.comment_count.toLocaleString()}`,
    );
  }

  console.log(
    `  ${color('Resolution:', Colors.fg.cyan)}  ${info.resolution || info.width + 'x' + info.height} ${info.fps ? `(${info.fps}fps)` : ''}`,
  );
  console.log(`  ${color('Date:', Colors.fg.cyan)}        ${info.upload_date}`);
  console.log(`  ${color('URL:', Colors.fg.cyan)}         ${info.webpage_url}`);

  if (info.tags && info.tags.length > 0) {
    const tags =
      info.tags.slice(0, 5).join(', ') + (info.tags.length > 5 ? '...' : '');
    console.log(
      `  ${color('Tags:', Colors.fg.cyan)}        ${Style.muted(tags)}`,
    );
  }

  if (info.description) {
    const desc =
      info.description.split('\n')[0].substring(0, 100) +
      (info.description.length > 100 ? '...' : '');
    console.log(
      `  ${color('Description:', Colors.fg.cyan)} ${Style.muted(desc)}`,
    );
  }
}

/**
 * Formats and prints playlist info.
 */
function printPlaylistInfo(info: PlaylistInfo) {
  console.log(`\n${Style.title('Playlist Information')}`);
  console.log(`  ${color('Title:', Colors.fg.cyan)}       ${info.title}`);
  console.log(
    `  ${color('Count:', Colors.fg.cyan)}       ${info.playlist_count} videos`,
  );
  console.log(`  ${color('URL:', Colors.fg.cyan)}         ${info.webpage_url}`);

  if (info.entries && info.entries.length > 0) {
    console.log(`\n${Style.info('First 5 entries:')}`);
    info.entries.slice(0, 5).forEach((entry, i) => {
      console.log(
        `  ${i + 1}. ${entry.title} ${Style.muted(`(${entry.duration_string || 'N/A'})`)}`,
      );
    });
    if (info.entries.length > 5) {
      console.log(`  ... and ${info.entries.length - 5} more`);
    }
  }
}

/**
 * Interactive Info Flow
 */
export async function interactiveInfo(
  ytdlp: YtDlp,
  prefilledUrl?: string,
): Promise<void> {
  const { ask, close } = createPrompter();
  try {
    const url = prefilledUrl || (await promptText(ask, 'Video URL'));
    if (!url) return;

    console.log(Style.info('Fetching info...'));
    // Force type to 'video' mostly, but we handle playlist response
    // types.ts says getInfoAsync returns Union, checking _type separates them.
    const info = (await ytdlp.getInfoAsync(url)) as VideoInfo | PlaylistInfo;

    if (info._type === 'playlist') {
      printPlaylistInfo(info as PlaylistInfo);
    } else {
      printVideoInfo(info as VideoInfo);
    }
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
  console.log(Style.muted('  Powerful yt-dlp wrapper for Node.js\n'));

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
          if (path) {
            console.log(Style.success(`FFmpeg available at: ${path}`));
          } else {
            console.log(Style.error('Failed to download FFmpeg.'));
          }
          break;
        }
      }
    }
  } finally {
    close();
  }
}
