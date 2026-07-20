"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ffmpeg_1 = require("../utils/ffmpeg");
(0, ffmpeg_1.downloadFFmpeg)().catch((err) => {
    console.error('Failed to download ffmpeg:', err);
    process.exit(1);
});
