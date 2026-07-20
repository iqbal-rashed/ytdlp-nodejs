"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadYtDlp = downloadYtDlp;
exports.downloadYtDlpVerified = downloadYtDlpVerified;
exports.findYtdlpBinary = findYtdlpBinary;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const request_1 = require("../utils/request");
const paths_1 = require("./paths");
const crypto_1 = __importDefault(require("crypto"));
const DOWNLOAD_BASE_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download';
const PLATFORM_MAPPINGS = {
    win32: {
        x64: 'yt-dlp.exe',
        ia32: 'yt-dlp_x86.exe',
    },
    linux: {
        x64: 'yt-dlp',
        armv7l: 'yt-dlp_linux_armv7l',
        aarch64: 'yt-dlp_linux_aarch64',
        arm64: 'yt-dlp',
    },
    darwin: {
        x64: 'yt-dlp_macos',
        arm64: 'yt-dlp_macos',
    },
    android: {
        arm64: 'yt-dlp',
    },
};
function getYtdlpFilename() {
    const platform = process.platform;
    const arch = process.arch;
    if (!PLATFORM_MAPPINGS[platform] || !PLATFORM_MAPPINGS[platform][arch]) {
        throw new Error(`No yt-dlp build available for ${platform} ${arch}`);
    }
    const filename = PLATFORM_MAPPINGS[platform][arch];
    return filename;
}
async function downloadYtDlp(out) {
    const OUT_DIR = out || paths_1.BIN_DIR;
    const fileName = getYtdlpFilename();
    const downloadUrl = `${DOWNLOAD_BASE_URL}/${fileName}`;
    const outputPath = path.join(OUT_DIR, fileName);
    const isExists = fs.existsSync(outputPath);
    if (isExists)
        return outputPath;
    console.log(`Downloading yt-dlp...`, downloadUrl);
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }
    try {
        await (0, request_1.downloadFile)(downloadUrl, outputPath);
        console.log(`yt-dlp downloaded successfully to: ${outputPath}`);
        // Set executable permissions (Unix-like systems only)
        if (process.platform !== 'win32') {
            fs.chmodSync(outputPath, 0o755);
        }
        return outputPath;
    }
    catch (error) {
        console.error(`Download failed: ${error}`);
        throw error;
    }
}
async function sha256File(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.default.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}
async function getChecksum(fileName) {
    try {
        const checksums = await (0, request_1.fetchText)(`${DOWNLOAD_BASE_URL}/SHA2-256SUMS`);
        const lines = checksums.split(/\r?\n/);
        const match = lines.find((line) => line.includes(fileName));
        if (!match)
            return undefined;
        const [hash] = match.trim().split(/\s+/);
        return hash || undefined;
    }
    catch {
        return undefined;
    }
}
async function downloadYtDlpVerified(out) {
    const outputPath = await downloadYtDlp(out);
    const fileName = path.basename(outputPath);
    const checksum = await getChecksum(fileName);
    if (!checksum) {
        return { path: outputPath, verified: false };
    }
    const hash = await sha256File(outputPath);
    if (hash.toLowerCase() !== checksum.toLowerCase()) {
        throw new Error(`Checksum mismatch for ${fileName}. Expected ${checksum}, got ${hash}`);
    }
    return { path: outputPath, verified: true, checksum };
}
function findYtdlpBinary() {
    const platform = process.platform;
    const arch = process.arch;
    try {
        const binaryName = PLATFORM_MAPPINGS[platform][arch];
        const ytdlpPath = path.join(paths_1.BIN_DIR, binaryName);
        if (!fs.existsSync(ytdlpPath)) {
            throw new Error('Ytdlp binary not found. Please download it first.');
        }
        return ytdlpPath;
    }
    catch {
        return undefined;
    }
}
