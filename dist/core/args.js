"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildYtDlpArgs = buildYtDlpArgs;
const args_1 = require("../utils/args");
const progress_1 = require("../utils/progress");
function buildYtDlpArgs({ url, options, ffmpegPath, withProgressTemplate, extra, }) {
    const args = (0, args_1.createArgs)(options || {});
    if (ffmpegPath) {
        args.push('--ffmpeg-location', ffmpegPath);
    }
    if (withProgressTemplate) {
        args.push('--progress-template', progress_1.PROGRESS_STRING);
    }
    if (extra && extra.length > 0) {
        args.push(...extra);
    }
    if (url) {
        args.push('--', url);
    }
    return args;
}
