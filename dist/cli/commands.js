"use strict";
/**
 * CLI Commands
 * Provides non-interactive command handlers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const __1 = require("..");
const utils_1 = require("./utils");
const style_1 = require("./style");
const interactive_1 = require("./interactive");
/**
 * Handles format results output.
 */
function handleFormatsResult(result) {
    if (result.source === 'json') {
        const rows = result.formats.map((format) => ({
            formatId: format.format_id,
            extension: format.ext || '',
            resolution: format.resolution || '',
            note: format.format_note || '',
            raw: '',
        }));
        console.log((0, utils_1.formatTableRows)(rows));
    }
    else {
        console.log((0, utils_1.formatTableRows)(result.table.rows));
    }
}
/**
 * Runs a CLI command.
 */
async function runCommand(command, positionals, options) {
    const ytdlp = new __1.YtDlp();
    if (command === 'download') {
        const url = positionals[0];
        if (!url) {
            (0, utils_1.printUsage)();
            return;
        }
        await (0, interactive_1.interactiveDownload)(ytdlp, false, String(url));
        return;
    }
    if (command === 'info') {
        const url = positionals[0];
        if (!url) {
            (0, utils_1.printUsage)();
            return;
        }
        await (0, interactive_1.interactiveInfo)(ytdlp, String(url));
        return;
    }
    if (command === 'formats') {
        const url = positionals[0];
        if (!url) {
            (0, utils_1.printUsage)();
            return;
        }
        const result = await ytdlp.getFormatsAsync(String(url));
        handleFormatsResult(result);
        return;
    }
    if (command === 'audio') {
        const url = positionals[0];
        if (!url) {
            (0, utils_1.printUsage)();
            return;
        }
        await (0, interactive_1.interactiveDownload)(ytdlp, true, String(url));
        return;
    }
    if (command === 'video') {
        const url = positionals[0];
        if (!url) {
            (0, utils_1.printUsage)();
            return;
        }
        const argsOptions = (0, utils_1.buildArgsOptions)(options);
        const quality = options.quality ? String(options.quality) : 'best';
        const result = await ytdlp.downloadVideo(String(url), quality, argsOptions);
        if (result.filePaths.length > 0) {
            console.log(result.filePaths.join('\n'));
        }
        return;
    }
    if (command === 'ffmpeg') {
        console.log(style_1.Style.info('Downloading FFmpeg...'));
        const path = await ytdlp.downloadFFmpeg();
        if (path) {
            console.log(style_1.Style.success(`FFmpeg available at: ${path}`));
        }
        else {
            console.log(style_1.Style.error('Failed to download FFmpeg.'));
        }
        return;
    }
    if (command === 'update') {
        const result = await ytdlp.updateYtDlpAsync();
        console.log(style_1.Style.success(`Updated via ${result.method}. Binary: ${result.binaryPath}${result.version ? ` (version ${result.version})` : ''}`));
        return;
    }
    (0, utils_1.printUsage)();
}
