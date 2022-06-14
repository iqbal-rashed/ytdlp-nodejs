import { spawn } from "child_process";
import { ytdlpPath, ffmpegPath } from "./install";
import getFormatText from "./formatText";
import { PassThrough } from "stream";
import EventEmitter from "events";
import fs from "fs";

import {
    PROGRESS_STRING,
    formatBytes,
    percentage,
    secondsToHms,
} from "./helper";

import {
    FormatOptions,
    VideoInfo,
    ThumbnailsOptions,
    DownloadOptions,
    OutputType,
} from "./types";
import { outputType } from "./schema";
import path from "path";

class Download {
    private options: DownloadOptions | undefined;
    private url: string;
    private formatText: string;
    private eventEmitter: EventEmitter;

    on: {
        (
            eventName: "progress",
            listener: (...args: any[]) => void
        ): EventEmitter;
        (
            eventName: "finished",
            listener: (...args: any[]) => void
        ): EventEmitter;
        // (eventName: "end", listener: (...args: any[]) => void): EventEmitter;
        // (eventName: "error", listener: (...args: any[]) => void): EventEmitter;
        (
            eventName: string | symbol,
            listener: (...args: any[]) => void
        ): EventEmitter;
    };

    emit: (eventName: string | symbol, ...args: any[]) => boolean;
    listenerCount: (eventName: string | symbol) => number;
    constructor(url: string, options?: DownloadOptions) {
        this.url = url;
        this.options = options;
        this.formatText = getFormatText(options);
        this.eventEmitter = new EventEmitter();
        this.on = this.eventEmitter.on;
        this.emit = this.eventEmitter.emit;
        this.listenerCount = this.eventEmitter.listenerCount;

        this.downloadProcess(this.url, this.formatText, this.options?.output);
    }

    private downloadProcess(
        url: string,
        formatText: string,
        output: OutputType
    ) {
        const outputStr = this.getOutput(output);
        let newFormatText: string[];
        if (this.options?.filter === "extractaudio") {
            newFormatText = [...formatText.split(" ")];
        } else {
            newFormatText = ["-f", ...formatText.split(" ")];
        }
        console.log(newFormatText, outputStr);
        const downloadProcess = spawn(ytdlpPath, [
            url,
            "-o",
            outputStr,
            ...newFormatText,
            "--progress-template",
            PROGRESS_STRING,
            "--ffmpeg-location",
            ffmpegPath,
        ]);
        let prevTime: any;
        downloadProcess.stdout.on("data", (data) => {
            const dataStr = Buffer.from(data).toString();
            if (dataStr.includes("brightest")) {
                if (!prevTime) {
                    prevTime = Date.now();
                }
                const pObj = JSON.parse(dataStr.split("-")[1]);
                if (pObj.status === "finished") {
                    const fObj = {
                        status: "finished",
                        time: (Date.now() - prevTime) / 1000,
                        time_str: secondsToHms((Date.now() - prevTime) / 1000),
                        size: pObj.total,
                        size_str: formatBytes(pObj.total),
                    };
                    this.emit("finished", fObj);
                    return;
                }
                pObj.percent_str = `${percentage(
                    pObj.downloaded,
                    pObj.total
                ).toFixed(2)}%`;
                pObj.downloaded_str = formatBytes(pObj.downloaded);
                pObj.total_str = formatBytes(pObj.total);
                pObj.speed_str = `${formatBytes(pObj.speed)}/s`;
                pObj.eta_str = secondsToHms(pObj.eta);

                this.emit("progress", pObj);
            }
        });

        downloadProcess.stderr.on("data", (err) => {
            const errStr = Buffer.from(err).toString();
            throw new Error(errStr);
        });
    }
    private getOutput(output: OutputType): string {
        let outputStr: string = "";
        if (!output || output == "default") {
            return "%(title)s.%(ext)s";
        }
        const check = outputType.safeParse(output);
        if (!check.success) {
            const errorObj = check.error.issues[0];
            const errorText = `${errorObj.path} type error, ${errorObj.message}`;
            throw new TypeError(errorText);
        }

        const extReg =
            /(\.aac|\.flac|\.mp3|\.m4a|\.opus|\.vorbis|\.wav\.mkv|\.mp4|\.ogg|\.webm|\.flv)$/g;

        if (typeof output === "string") {
            // outputStr = output;

            if (fs.lstatSync(output).isDirectory()) {
                outputStr = path.join(output, "%(title)s.%(ext)s");
            } else if (extReg.test(output)) {
                if (!fs.existsSync(path.dirname(output))) {
                    throw new Error("Output path not valid");
                }
            }
        }

        if (typeof output === "object") {
            let newObj: { outDir: string; filename: string } = {
                outDir: "",
                filename: "",
            };

            if (!fs.existsSync(output.outDir)) {
                throw new Error("Output directory not valid");
            } else {
                newObj.outDir = output.outDir;
            }

            if (output.fileName) {
                if (extReg.test(output.fileName)) {
                    newObj.filename = output.fileName;
                } else {
                    throw new Error("File name not valid");
                }
            }
            outputStr = path.join(
                newObj.outDir,
                newObj.filename ? newObj.filename : "%(title)s.%(ext)s"
            );
        }

        return outputStr ? outputStr : "%(title)s.%(ext)s";
    }
}

function download(url: string, options?: DownloadOptions) {
    return new Download(url, options);
}

class GetStream {
    url: string;
    options: FormatOptions | undefined;
    passThrough: PassThrough;
    on: {
        (event: "close", listener: () => void): PassThrough;
        (event: "data", listener: (chunk: any) => void): PassThrough;
        (event: "end", listener: () => void): PassThrough;
        (event: "error", listener: (err: Error) => void): PassThrough;
        (event: "pause", listener: () => void): PassThrough;
        (event: "readable", listener: () => void): PassThrough;
        (event: "progress", listener: (...args: any[]) => void): PassThrough;
        (event: "finished", listener: (...args: any[]) => void): PassThrough;
        (event: "resume", listener: () => void): PassThrough;
        (
            event: string | symbol,
            listener: (...args: any[]) => void
        ): PassThrough;
    };
    emit: {
        (event: "close"): boolean;
        (event: "data", chunk: any): boolean;
        (event: "end"): boolean;
        (event: "error", err: Error): boolean;
        (event: "pause"): boolean;
        (event: "readable"): boolean;
        (event: "resume"): boolean;
        (event: string | symbol, ...args: any[]): boolean;
    };
    formatText: string;
    pipe: (
        destination: NodeJS.WritableStream,
        options?: {
            end?: boolean;
        }
    ) => void;

    constructor(url: string, options?: FormatOptions) {
        this.url = url;
        this.options = options;
        this.passThrough = new PassThrough();
        this.on = this.passThrough.on;
        this.emit = this.passThrough.emit;
        this.formatText = getFormatText(options);
        this.pipe = (
            destination: NodeJS.WritableStream,
            options?: { end?: boolean }
        ) => {
            this.passThrough.pipe(destination, options);
        };
        this.getStream(url, this.formatText);
    }

    private getStream(url: string, formatText: string) {
        const streamProcess = spawn(ytdlpPath, [
            url,
            "-o",
            "-",
            "-f",
            ...formatText.split(" "),
            "--progress-template",
            PROGRESS_STRING,
            "--ffmpeg-location",
            ffmpegPath,
        ]);

        let prevTime: any;

        streamProcess.stderr.on("data", (err) => {
            const errStr = Buffer.from(err).toString();
            if (errStr.includes("brightest")) {
                if (!prevTime) {
                    prevTime = Date.now();
                }
                const pObj = JSON.parse(errStr.split("-")[1]);
                if (pObj.status === "finished") {
                    const fObj = {
                        status: "finished",
                        time: (Date.now() - prevTime) / 1000,
                        time_str: secondsToHms((Date.now() - prevTime) / 1000),
                        size: pObj.total,
                        size_str: formatBytes(pObj.total),
                    };
                    this.emit("finished", fObj);
                    return;
                }
                pObj.percent_str = `${percentage(
                    pObj.downloaded,
                    pObj.total
                ).toFixed(2)}%`;
                pObj.downloaded_str = formatBytes(pObj.downloaded);
                pObj.total_str = formatBytes(pObj.total);
                pObj.speed_str = `${formatBytes(pObj.speed)}/s`;
                pObj.eta_str = secondsToHms(pObj.eta);

                this.emit("progress", pObj);
            }
        });
        streamProcess.stdout.pipe(this.passThrough);
    }
}

function getStream(url: string, options?: FormatOptions) {
    return new GetStream(url, options);
}

// function getStream(url: string, options?: FormatOptions) {
//     if (!validateUrl(url.trim())) throw new Error("Url not valid");
//     const formatText = getFormatText(options);
//     const fileStream = new PassThrough();
//     const streamProcess = spawn(ytdlpPath, [
//         url,
//         "-o",
//         "-",
//         "-f",
//         formatText,
//         "--progress-template",
//         PROGRESS_STRING,
//     ]);
//     let prevTime: any;
//     streamProcess.stderr.on("data", (err) => {
//         const errStr = Buffer.from(err).toString();
//         if (errStr.includes("brightest")) {
//             if (!prevTime) {
//                 prevTime = Date.now();
//             }
//             const pObj = JSON.parse(errStr.split("-")[1]);
//             if (pObj.status === "finished") {
//                 const fObj = {
//                     status: "finished",
//                     time: (Date.now() - prevTime) / 1000,
//                     time_str: secondsToHms((Date.now() - prevTime) / 1000),
//                     size: pObj.total,
//                     size_str: formatBytes(pObj.total),
//                 };
//                 fileStream.emit("finished", fObj);
//                 return;
//             }
//             pObj.percent_str = `${percentage(
//                 pObj.downloaded,
//                 pObj.total
//             ).toFixed(2)}%`;
//             pObj.downloaded_str = formatBytes(pObj.downloaded);
//             pObj.total_str = formatBytes(pObj.total);
//             pObj.speed_str = `${formatBytes(pObj.speed)}/s`;
//             pObj.eta_str = secondsToHms(pObj.eta);

//             fileStream.emit("progress", pObj);
//         }
//     });
//     streamProcess.stdout.pipe(fileStream);
//     return fileStream;
// }

function getFormats(url: string): Promise<object[]> {
    return new Promise(function (resolve, reject) {
        if (!validateUrl(url.trim())) reject(new Error("Url not valid"));
        const newUrl = normalizeUrl(url);
        const getFormatsProcess = spawn(ytdlpPath, [newUrl, "-J"]);

        getFormatsProcess.stderr.on("data", (err) => {
            const errStr = Buffer.from(err).toString();
            reject(new Error(errStr));
        });

        getFormatsProcess.stdout.on("data", (data) => {
            const dataStr = Buffer.from(data).toString();
            const dataObj = JSON.parse(dataStr);
            if (dataObj) {
                const formats = dataObj.formats;
                resolve(formats);
            } else {
                reject(new Error("Something went wrong!"));
            }
        });
    });
}

function getInfo(url: string): Promise<VideoInfo> {
    return new Promise(function (resolve, reject) {
        if (!validateUrl(url.trim())) reject(new Error("Url not valid"));
        const newUrl = normalizeUrl(url);
        const getInfoProcess = spawn(ytdlpPath, [newUrl, "-J"]);
        getInfoProcess.stderr.on("data", (err) => {
            const errStr = Buffer.from(err).toString();
            reject(new Error(errStr));
        });
        getInfoProcess.stdout.on("data", (data) => {
            const dataStr = Buffer.from(data).toString();
            const dataObj = JSON.parse(dataStr);
            resolve(dataObj);
        });
    });
}

function getThumbnails(
    url: string,
    { quality = "default", type = "jpg" }: ThumbnailsOptions = {
        quality: "default",
        type: "jpg",
    }
): string {
    if (!validateUrl(url)) {
        throw Error("Url not valid!");
    }
    const videoId = getVideoId(url);
    if (!videoId) {
        throw Error("video Id not valid!");
    }
    switch (quality) {
        case "max":
            return `https://i1.ytimg.com/vi${
                type === "webp" ? "_webp" : ""
            }/${videoId}/maxresdefault.${type}`;
        case "hq":
            return `https://i1.ytimg.com/vi${
                type === "webp" ? "_webp" : ""
            }/${videoId}/mqdefault.${type}`;
        case "mq":
            return `https://i1.ytimg.com/vi${
                type === "webp" ? "_webp" : ""
            }/${videoId}/hqdefault.${type}`;
        case "sd":
            return `https://i1.ytimg.com/vi${
                type === "webp" ? "_webp" : ""
            }/${videoId}/sddefault.${type}`;
        case "default":
            return `https://i1.ytimg.com/vi${
                type === "webp" ? "_webp" : ""
            }/${videoId}/default.${type}`;
        default:
            return "Please provide proper input for quality (max,hq,mq,sd,default)";
    }
}

function normalizeUrl(url: string): string {
    if (!validateUrl(url.trim())) throw new Error("Url not valid");
    const parsed = new URL(url.trim());
    const isVideo = parsed.searchParams.get("v");
    const isPlaylist = parsed.searchParams.get("list");
    if (isVideo) {
        return isVideo;
    } else if (isPlaylist) {
        return isPlaylist;
    } else {
        throw new Error("Url couldn't normalize");
    }
}

function getVideoId(url: string): string {
    if (!validateUrl(url.trim())) throw new Error("Url not valid");

    const parsed = new URL(url);
    const videoId = parsed.searchParams.get("v");
    if (!videoId) throw new Error("This is not Video url");
    return videoId;
}

function getPlaylistId(url: string): string {
    if (!validateUrl(url.trim())) throw new Error("Url not valid");

    const parsed = new URL(url);
    const listId = parsed.searchParams.get("list");
    if (!listId) throw new Error("This is not playlist url");
    return listId;
}

function validateId(id: string): boolean {
    const videoRegex = /^[a-zA-Z0-9-_]{11}$/;
    const playlistRegex = /^[a-zA-Z0-9-_]{34}$/;
    if (videoRegex.test(id.trim()) || playlistRegex.test(id.trim())) {
        return true;
    } else {
        return false;
    }
}

function validateUrl(url: string): boolean {
    const parsed = new URL(url.trim());
    const urlRegex =
        /https:\/\/www.youtube.com\/(playlist|watch|shorts)(\?|\/)/g;
    const checkUrl = urlRegex.test(parsed.toString());
    if (!checkUrl) return false;
    const isVideo = parsed.searchParams.get("v");
    const isPlaylist = parsed.searchParams.get("list");
    if (isVideo || isPlaylist) {
        return true;
    } else {
        return false;
    }
}

export = {
    validateId,
    validateUrl,
    getInfo,
    getPlaylistId,
    getVideoId,
    getThumbnails,
    getFormats,
    getStream,
    download,
};
