"use strict";
/**
 * CLI Interactive Flows
 * Provides interactive TUI flows for various CLI actions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactiveDownload = interactiveDownload;
exports.interactiveInfo = interactiveInfo;
exports.runInteractive = runInteractive;
const __1 = require("..");
const prompts_1 = require("./prompts");
const utils_1 = require("./utils");
const style_1 = require("./style");
/**
 * Ask for extra `exec` arguments (custom flags).
 */
async function promptExecArgs(ask) {
    const extra = await (0, prompts_1.promptText)(ask, 'Extra args (e.g. --embed-subs) [Enter to skip]');
    if (!extra)
        return [];
    return extra
        .split(' ')
        .map((s) => s.trim())
        .filter(Boolean);
}
/**
 * Interactive video download flow.
 */
async function interactiveDownload(ytdlp, audioOnly = false, prefilledUrl) {
    const { ask, close } = (0, prompts_1.createPrompter)();
    try {
        const url = prefilledUrl || (await (0, prompts_1.promptText)(ask, 'Video URL'));
        if (!url)
            return;
        let format;
        let type;
        if (audioOnly) {
            const audioChoice = await (0, prompts_1.promptSelect)(ask, 'Audio Format/Quality', [
                { value: 'mp3', label: 'MP3 (Best compatibility)' },
                { value: 'm4a', label: 'M4A (Better quality)' },
                { value: 'wav', label: 'WAV (Uncompressed)' },
                { value: 'best', label: 'Best Quality (Auto)' },
            ]);
            if (!audioChoice)
                return;
            type = audioChoice === 'best' ? undefined : audioChoice;
        }
        else {
            const qualityChoice = await (0, prompts_1.promptSelect)(ask, 'Video Quality', [
                { value: 'best', label: 'Best Available' },
                { value: '2160', label: '4K (2160p)' },
                { value: '1440', label: '2K (1440p)' },
                { value: '1080', label: 'Full HD (1080p)' },
                { value: '720', label: 'HD (720p)' },
                { value: '480', label: 'SD (480p)' },
                { value: 'worst', label: 'Smallest File' },
            ]);
            if (!qualityChoice)
                return;
            if (qualityChoice === 'best')
                format = 'best';
            else if (qualityChoice === 'worst')
                format = 'worst';
            else
                format = `bestvideo[height<=${qualityChoice}]+bestaudio/best[height<=${qualityChoice}]`;
        }
        const execArgs = await promptExecArgs(ask);
        console.log(`\n${style_1.Style.info('Starting download...')}\n`);
        const options = (0, utils_1.buildArgsOptions)({});
        if (execArgs.length > 0) {
            options.rawArgs = execArgs;
        }
        if (audioOnly) {
            // For audio, we use simpler args logic for now or custom logic
            // But since we removed config, we just use raw args or helpers
            // We will use the library's fluent or helper methods ideally, but here we use downloadAsync for flexibility
            // Construct audio-specific format options
            const formatOptions = {
                ...options,
                format: {
                    filter: 'audioonly',
                    type: type || 'mp3',
                    quality: 0, // Best
                },
                onProgress: (0, utils_1.progressHandler)('Downloading Audio'),
            };
            const result = await ytdlp.downloadAsync(url, formatOptions);
            console.log(`\n\n${style_1.Style.success('Download Complete!')}`);
            if (result.filePaths.length)
                console.log(result.filePaths.map((p) => ` - ${p}`).join('\n'));
        }
        else {
            const formatOptions = {
                ...options,
                format: format,
                mergeOutputFormat: 'mp4',
                onProgress: (0, utils_1.progressHandler)('Downloading Video'),
            };
            const result = await ytdlp.downloadAsync(url, formatOptions);
            console.log(`\n\n${style_1.Style.success('Download Complete!')}`);
            if (result.filePaths.length)
                console.log(result.filePaths.map((p) => ` - ${p}`).join('\n'));
        }
    }
    catch (err) {
        console.error(`\n${style_1.Style.error('Error occurred:')} ${err}`);
    }
    finally {
        close();
    }
}
/**
 * Formats and prints video info.
 */
function printVideoInfo(info) {
    console.log(`\n${style_1.Style.title('Video Information')}`);
    console.log(`  ${(0, style_1.color)('Title:', style_1.Colors.fg.cyan)}       ${info.title}`);
    console.log(`  ${(0, style_1.color)('Uploader:', style_1.Colors.fg.cyan)}    ${info.uploader} ${style_1.Style.muted(`(${info.uploader_id})`)}`);
    console.log(`  ${(0, style_1.color)('Channel:', style_1.Colors.fg.cyan)}     ${info.channel} ${info.channel_follower_count ? style_1.Style.muted(`(${info.channel_follower_count.toLocaleString()} subs)`) : ''}`);
    console.log(`  ${(0, style_1.color)('Duration:', style_1.Colors.fg.cyan)}    ${info.duration_string || info.duration + 's'}`);
    console.log(`  ${(0, style_1.color)('Views:', style_1.Colors.fg.cyan)}       ${info.view_count?.toLocaleString()}`);
    if (info.like_count) {
        console.log(`  ${(0, style_1.color)('Likes:', style_1.Colors.fg.cyan)}       ${info.like_count.toLocaleString()}`);
    }
    if (info.comment_count) {
        console.log(`  ${(0, style_1.color)('Comments:', style_1.Colors.fg.cyan)}    ${info.comment_count.toLocaleString()}`);
    }
    console.log(`  ${(0, style_1.color)('Resolution:', style_1.Colors.fg.cyan)}  ${info.resolution || info.width + 'x' + info.height} ${info.fps ? `(${info.fps}fps)` : ''}`);
    console.log(`  ${(0, style_1.color)('Date:', style_1.Colors.fg.cyan)}        ${info.upload_date}`);
    console.log(`  ${(0, style_1.color)('URL:', style_1.Colors.fg.cyan)}         ${info.webpage_url}`);
    if (info.tags && info.tags.length > 0) {
        const tags = info.tags.slice(0, 5).join(', ') + (info.tags.length > 5 ? '...' : '');
        console.log(`  ${(0, style_1.color)('Tags:', style_1.Colors.fg.cyan)}        ${style_1.Style.muted(tags)}`);
    }
    if (info.description) {
        const desc = info.description.split('\n')[0].substring(0, 100) +
            (info.description.length > 100 ? '...' : '');
        console.log(`  ${(0, style_1.color)('Description:', style_1.Colors.fg.cyan)} ${style_1.Style.muted(desc)}`);
    }
}
/**
 * Formats and prints playlist info.
 */
function printPlaylistInfo(info) {
    console.log(`\n${style_1.Style.title('Playlist Information')}`);
    console.log(`  ${(0, style_1.color)('Title:', style_1.Colors.fg.cyan)}       ${info.title}`);
    console.log(`  ${(0, style_1.color)('Count:', style_1.Colors.fg.cyan)}       ${info.playlist_count} videos`);
    console.log(`  ${(0, style_1.color)('URL:', style_1.Colors.fg.cyan)}         ${info.webpage_url}`);
    if (info.entries && info.entries.length > 0) {
        console.log(`\n${style_1.Style.info('First 5 entries:')}`);
        info.entries.slice(0, 5).forEach((entry, i) => {
            console.log(`  ${i + 1}. ${entry.title} ${style_1.Style.muted(`(${entry.duration_string || 'N/A'})`)}`);
        });
        if (info.entries.length > 5) {
            console.log(`  ... and ${info.entries.length - 5} more`);
        }
    }
}
/**
 * Interactive Info Flow
 */
async function interactiveInfo(ytdlp, prefilledUrl) {
    const { ask, close } = (0, prompts_1.createPrompter)();
    try {
        const url = prefilledUrl || (await (0, prompts_1.promptText)(ask, 'Video URL'));
        if (!url)
            return;
        console.log(style_1.Style.info('Fetching info...'));
        // Force type to 'video' mostly, but we handle playlist response
        // types.ts says getInfoAsync returns Union, checking _type separates them.
        const info = (await ytdlp.getInfoAsync(url));
        if (info._type === 'playlist') {
            printPlaylistInfo(info);
        }
        else {
            printVideoInfo(info);
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`\n${style_1.Style.error('Error:')} ${message}`);
    }
    finally {
        close();
    }
}
/**
 * Main interactive mode menu.
 */
async function runInteractive() {
    const ytdlp = new __1.YtDlp();
    console.clear();
    console.log((0, style_1.color)(`
__   __ _____  ____   _      ____  
\\ \\ / /|_   _||  _ \\ | |    |  _ \\ 
 \\ V /   | |  | | | || |    | |_) |
  | |    | |  | |_| || |___ |  __/ 
  |_|    |_|  |____/ |_____||_|    
`, style_1.Colors.fg.red));
    console.log(style_1.Style.muted('  Powerful yt-dlp wrapper for Node.js\n'));
    const { ask, close } = (0, prompts_1.createPrompter)();
    try {
        const action = await (0, prompts_1.promptSelect)(ask, 'Choose Action', [
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
                    console.log(style_1.Style.info('Updating yt-dlp...'));
                    const res = await ytdlp.updateYtDlpAsync();
                    console.log(style_1.Style.success(`Updated to ${res.version || 'latest'}`));
                    break;
                }
                case 'ffmpeg': {
                    console.log(style_1.Style.info('Downloading FFmpeg...'));
                    const path = await ytdlp.downloadFFmpeg();
                    if (path) {
                        console.log(style_1.Style.success(`FFmpeg available at: ${path}`));
                    }
                    else {
                        console.log(style_1.Style.error('Failed to download FFmpeg.'));
                    }
                    break;
                }
            }
        }
    }
    finally {
        close();
    }
}
