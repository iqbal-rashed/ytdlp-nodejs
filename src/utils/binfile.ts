import os from "os";
import path from "path";
import CliProgress from "cli-progress";
import { https } from "follow-redirects";
import fs from "fs";
import extract from "extract-zip";

const urls = {
    ytdlpWin64:
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
    ytdlpWin32:
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_x86.exe",
    ytdlpMacos:
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
    ytdlpLinux:
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
    ffmpegWin64:
        "https://github.com/iqbal-rashed/ytdlp-nodejs/releases/download/ffmpeg-release/ffmpeg-win64.zip",
    ffmpegWin32:
        "https://github.com/iqbal-rashed/ytdlp-nodejs/releases/download/ffmpeg-release/ffmpeg-win32.zip",
    ffmpegLinux:
        "https://github.com/iqbal-rashed/ytdlp-nodejs/releases/download/ffmpeg-release/ffmpeg-linux64.zip",
    ffmpegMacos:
        "https://github.com/iqbal-rashed/ytdlp-nodejs/releases/download/ffmpeg-release/ffmpeg-macos.zip",
};

const BIN_PATH = path.join(path.resolve("node_modules"), "__bin");

export type BinPathType = {
    ytdlpPath: string;
    ffmpegPath: string;
};

export function getBinPath(): BinPathType | undefined {
    let ytdlp = "";
    let ffmpeg = "";
    if (os.platform() === "win32") {
        if (os.arch() === "x64") {
            ytdlp = "yt-dlp.exe";
            ffmpeg = "ffmpeg.exe";
        } else if (os.arch() === "x32") {
            ytdlp = "yt-dlp_x86.exe";
            ffmpeg = "ffmpeg.exe";
        } else {
            throw new Error("Your os is not supported");
        }
    } else if (os.platform() === "darwin") {
        ytdlp = "yt-dlp_macos";
        ffmpeg = "ffmpeg";
    } else if (os.platform() === "linux") {
        ytdlp = "yt-dlp";
        ffmpeg = "ffmpeg";
    } else {
        throw new Error("Your os is not supported");
    }
    const ytdlpPath = path.join(BIN_PATH, ytdlp);
    const ffmpegPath = path.join(BIN_PATH, ffmpeg);

    if (!fs.existsSync(ytdlpPath) || !fs.existsSync(ffmpegPath)) {
        install();
        return undefined;
    }
    return {
        ytdlpPath,
        ffmpegPath,
    };
}

function getUrlByOs() {
    if (os.platform() === "win32") {
        if (os.arch() === "x64") {
            return {
                ffmpeg: urls.ffmpegWin64,
                ytdlp: urls.ytdlpWin64,
            };
        } else if (os.arch() === "x32") {
            return {
                ffmpeg: urls.ffmpegWin32,
                ytdlp: urls.ytdlpWin32,
            };
        } else {
            throw new Error("Your os not supported");
        }
    } else if (os.platform() === "darwin") {
        return {
            ffmpeg: urls.ffmpegMacos,
            ytdlp: urls.ytdlpMacos,
        };
    } else if (os.platform() === "linux") {
        return {
            ffmpeg: urls.ffmpegLinux,
            ytdlp: urls.ytdlpLinux,
        };
    } else {
        throw new Error("Your os not supported");
    }
}

async function downloadFile(fileUrl: string, savePath: string) {
    return new Promise<string>((resolve, reject) => {
        const progressBar = new CliProgress.SingleBar(
            {
                format: `Download ${path.basename(
                    savePath
                )} {bar} {percentage}% | {eta_formatted} remaining...`,
            },
            CliProgress.Presets.shades_classic
        );

        const file = fs.createWriteStream(savePath);

        let receivedBytes: number = 0;

        https.get(fileUrl, (res) => {
            if (res.statusCode !== 200) {
                fs.unlinkSync(savePath);
                return reject(
                    new Error("Response status was " + res.statusCode)
                );
            }

            const totalBytes = res.headers["content-length"];
            progressBar.start(totalBytes ? parseInt(totalBytes) : 100, 0);
            res.on("data", (chunk) => {
                receivedBytes += chunk.length;
                progressBar.update(receivedBytes);
            });

            res.pipe(file);
            res.on("error", (err) => {
                fs.unlinkSync(savePath);
                reject(new Error(err.message));
            });
        });

        file.on("finish", async () => {
            progressBar.stop();
            if (path.extname(savePath) === ".zip") {
                try {
                    const dirname = path.dirname(savePath);
                    await extract(savePath, { dir: dirname });
                    fs.rmSync(savePath);
                    file.close();
                    resolve("successful");
                } catch (error: any) {
                    file.close();
                    reject(error.message);
                }
            } else {
                file.close();
                resolve("successful");
            }
        });

        file.on("error", (err) => {
            fs.unlinkSync(savePath);
            progressBar.stop();
            reject(new Error(err.message));
        });
    });
}

export async function install() {
    console.log("Bin file not found, Start download automatically");

    if (!fs.existsSync(BIN_PATH)) {
        fs.mkdirSync(BIN_PATH);
    }

    const { ffmpeg, ytdlp } = getUrlByOs();
    await downloadFile(ytdlp, path.join(BIN_PATH, path.basename(ytdlp)));
    await downloadFile(ffmpeg, path.join(BIN_PATH, path.basename(ffmpeg)));
    console.log("Bin file downloaded completed, please restart");
}
