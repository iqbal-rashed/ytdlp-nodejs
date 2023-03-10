import path from "path";
import { formatBytes, percentage, secondsToHms, thr } from ".";
import { OutputTypeSchema } from "../validate/schema";
import {
    DownloadKeyWord,
    DownloadOptions,
    OutputType,
    ProgressType,
    StreamKeyWord,
    StreamOptions,
} from "./types";

import fs from "fs";

export function stringToProgress(str: string): ProgressType | undefined {
    try {
        if (!str.includes("bright")) thr();

        const jsonStr = str.split("\r")?.[1]?.trim()?.split("-")?.[1];
        if (!jsonStr) thr();

        const object = JSON.parse(jsonStr);

        const total = isNaN(Number(object.total))
            ? Number(object.total_estimate)
            : Number(object.total);

        return {
            status: object.status,
            downloaded: Number(object.downloaded),
            downloaded_str: formatBytes(object.downloaded),
            total: total,
            total_str: formatBytes(total),
            speed: Number(object.speed),
            speed_str: formatBytes(object.speed) + "/s",
            eta: Number(object.eta),
            eta_str: secondsToHms(object.eta),
            percentage: percentage(object.downloaded, total),
            percentage_str: percentage(object.downloaded, total) + "%",
        };
    } catch (err) {
        return undefined;
    }
}

const ByQuality = {
    "2160p": "bv*[height<=2160]",
    "1440p": "bv*[height<=1440]",
    "1080p": "bv*[height<=1080]",
    "720p": "bv*[height<=720]",
    "480p": "bv*[height<=480]",
    "360p": "bv*[height<=360]",
    "240p": "bv*[height<=240]",
    "144p": "bv*[height<=133]",
    highest: "bv*",
    lowest: "wv*",
};

export function parseStreamOptions<T extends StreamKeyWord>(
    options?: StreamOptions<T>
): string[] {
    if (!options || Object.keys(options).length === 0) {
        return ["-f", "b*[vcode!=none][acodec!=none]"];
    }

    let formatArr: string[] = [];
    const { filter, quality, command } = options;

    if (command && command.length) {
        return command;
    }

    if (filter === "audioonly") {
        formatArr = ["-f", quality == "lowest" ? "wa" : "ba"];
    }
    if (filter === "videoonly") {
        formatArr = [
            "-f",
            (quality ? ByQuality[quality] : "bv*") + "[acodec=none]",
        ];
    }
    if (filter === "audioandvideo") {
        formatArr = [
            "-f",
            (quality == "lowest" ? "w*" : "b*") +
                "[vcodec!=none][acodec!=none]",
        ];
    }

    return formatArr;
}

export function parseDownloadOptions<T extends DownloadKeyWord>(
    options?: DownloadOptions<T>
) {
    if (!options || Object.keys(options).length === 0) {
        return ["-f", "bv*+ba"];
    }

    let formatArr: string[] = [];
    const { filter, quality, command, format, output } = options;

    if (command && command.length) {
        return command;
    }

    if (filter === "audioonly") {
        formatArr = [
            "-x",
            "--audio-format",
            format ? format : "mp3",
            "--audio-quality",
            output ? output.toString() : "5",
        ];
    }

    if (filter === "videoonly") {
        formatArr = [
            "-f",
            (quality ? ByQuality[quality] : "bv*") + "[acodec=none]",
        ];
    }
    if (filter === "audioandvideo") {
        formatArr = [
            "-f",
            (quality == "lowest" ? "w*" : "b*") +
                "[vcodec!=none][acodec!=none][ext=" +
                (format ? format : "mp4") +
                "]",
        ];
    }

    if (filter === "mergevideo") {
        formatArr = ["-f", (quality ? ByQuality[quality] : "bv*") + "+ba"];
    }

    if ((options as any).embedSubs) {
        formatArr = formatArr.concat("--embed-subs");
    }
    if ((options as any).embedThumbnail) {
        formatArr = formatArr.concat("--embed-thumbnail");
    }

    return formatArr;
}
