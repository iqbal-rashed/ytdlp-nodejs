"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ytdlp_1 = require("../utils/ytdlp");
(0, ytdlp_1.downloadYtDlp)().catch((err) => {
    console.error('Failed to download yt-dlp:', err);
    process.exit(1);
});
