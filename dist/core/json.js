"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJson = parseJson;
function parseJson(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
        throw new Error('Empty JSON output from yt-dlp.');
    }
    return JSON.parse(trimmed);
}
