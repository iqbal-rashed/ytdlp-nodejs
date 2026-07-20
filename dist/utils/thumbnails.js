"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractThumbnails = extractThumbnails;
function extractThumbnails(consoleOutput) {
    const thumbnails = [];
    const lines = consoleOutput.split("\n").slice(1);
    for (const line of lines) {
        const match = line.match(/(\d+)\s+(\S+)\s+(\S+)\s+(https:\/\/[\S]+)/);
        if (match) {
            thumbnails.push({
                id: parseInt(match[1], 10),
                width: match[2] === "unknown" ? "unknown" : parseInt(match[2], 10),
                height: match[3] === "unknown" ? "unknown" : parseInt(match[3], 10),
                url: match[4],
            });
        }
    }
    return thumbnails;
}
