import os from "os";
import fs from "fs";
import path from "path";
import { https } from "follow-redirects";
import urls from "./urls.json";
import CliProgress from "cli-progress";
import extract from "extract-zip";

function getOsUrl(type: "ytdlp" | "ffmpeg"): string {
    if (os.platform() === "win32") {
        if (os.arch() === "x64") {
            return type === "ytdlp"
                ? urls.ytdlpWin64
                : type === "ffmpeg"
                ? urls.ffmpegWin64
                : "";
        } else if (os.arch() === "x32") {
            return type === "ytdlp"
                ? urls.ytdlpWin32
                : type === "ffmpeg"
                ? urls.ffmpegWin32
                : "";
        } else {
            console.log("Your os not supported");
            process.exit(1);
        }
    } else if (os.platform() === "darwin") {
        return type === "ytdlp"
            ? urls.ytdlpMacos
            : type === "ffmpeg"
            ? urls.ffmpegMacos
            : "";
    } else if (os.platform() === "linux") {
        return type === "ytdlp"
            ? urls.ytdlpLinux
            : type === "ffmpeg"
            ? urls.ytdlpLinux
            : "";
    } else {
        console.log("Your os not supported");
        process.exit(1);
    }
}

const ytdlpUrl = getOsUrl("ytdlp");
const ffmpegUrl = getOsUrl("ffmpeg");
const ytdlpPath = path.join(__dirname, "bin", path.basename(ytdlpUrl));
const ffmpegPath = path.join(
    __dirname,
    "bin",
    os.platform() === "win32" ? "ffmpeg.exe" : "ffmpeg"
);
const ffmpegZip = path.join(__dirname, "bin", path.basename(ffmpegUrl));

function install() {
    if (!fs.existsSync(path.dirname(ytdlpPath))) {
        fs.mkdirSync(path.dirname(ytdlpPath));
    }

    downloadFile(ytdlpUrl, ytdlpPath, (err) => {
        if (err) {
            return console.log(
                "Download yt-dlp failed to some reason, Please try again"
            );
        }
        downloadFile(ffmpegUrl, ffmpegZip, (err) => {
            if (err) {
                return console.log(
                    "Failed to download ffmpeg, Please try again"
                );
            }
            console.log("Download Completed, Please re-run the application");
        });
    });
}

function downloadFile(
    url: string,
    savePath: string,
    callback: (...args: any[]) => void
) {
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

    https.get(url, (res) => {
        if (res.statusCode !== 200) {
            return callback("Response status was " + res.statusCode);
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
                callback();
            } catch (error: any) {
                file.close();
                callback(error.message);
            }
        } else {
            file.close();
            callback();
        }
    });

    file.on("error", (err) => {
        fs.unlinkSync(savePath);
        progressBar.stop();
        return callback(err.message);
    });
}

function isNotInstalled() {
    return !fs.existsSync(ytdlpPath) || !fs.existsSync(ffmpegPath);
}

if (isNotInstalled()) {
    install();
}

export { ytdlpPath, ffmpegPath, isNotInstalled, install };
