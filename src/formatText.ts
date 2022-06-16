import { FormatOptions, DownloadOptions } from "./types";

import {
    videoonly,
    audioandvideo,
    audioonly,
    extractaudio,
    mergevideo,
} from "./schema";

export default function (options?: FormatOptions | DownloadOptions): string {
    let formatText: string = "";

    if (!options) {
        formatText = "best*[vcodec!=none][acodec!=none]";
    }

    if (options?.filter === "audioandvideo") {
        checkType(audioandvideo, options);

        switch (options.quality) {
            case "highest":
                formatText = `b*[vcodec!=none][acodec!=none]`;
                break;

            case "lowest":
                formatText = `w*[vcodec!=none][acodec!=none]`;
                break;

            default:
                formatText = `b*[vcodec!=none][acodec!=none]`;
                break;
        }
    }

    if (options?.filter === "audioonly") {
        checkType(audioonly, options);

        switch (options.quality) {
            case "highest":
                formatText = "best*[vcodec=none]";
                break;

            case "lowest":
                formatText = "worst*[vcodec=none]";
                break;

            default:
                formatText = "best*[vcodec=none]";
                break;
        }
    }

    if (options?.filter === "videoonly") {
        checkType(videoonly, options);

        switch (options.quality) {
            case "highest":
                formatText = `b*[acodec=none][ext=${
                    options.format ? options.format : "mp4"
                }]`;
                break;

            case "lowest":
                formatText = `w*[acodec=none][ext=${
                    options.format ? options.format : "mp4"
                }]`;
                break;

            default:
                formatText = `b*[height=${options.quality?.slice(
                    0,
                    -1
                )}][acodec=none][ext=${
                    options.format ? options.format : "mp4"
                }]${
                    options.defaultQuality === "highest"
                        ? "/bv*"
                        : options.defaultQuality === "lowest"
                        ? "/wv*"
                        : options.defaultQuality === "none"
                        ? ""
                        : "/bv*"
                }`;
                break;
        }
    }

    if (options?.filter === "extractaudio") {
        checkType(extractaudio, options);

        formatText = `--extract-audio --audio-format ${
            options.format ? options.format : "mp3"
        } --audio-quality ${options.quality ? options.quality : "5"}`;
    }

    if (options?.filter === "mergevideo") {
        checkType(mergevideo, options);

        switch (options.quality) {
            case "highest":
                formatText = `bv*+ba --merge-output-format ${
                    options.format ? options.format : "mp4"
                }`;
                break;

            case "lowest":
                formatText = `wv*+wa --merge-output-format ${
                    options.format ? options.format : "mp4"
                }`;
                break;

            default:
                formatText = `bv*[height<=${options.quality?.slice(0, -1)}]+ba${
                    options.defaultQuality === "highest"
                        ? "/bv*+ba"
                        : options.defaultQuality === "lowest"
                        ? "/wv*+wa"
                        : options.defaultQuality === "none"
                        ? ""
                        : "/bv*+ba"
                } --merge-output-format ${
                    options.format ? options.format : "mp4"
                }`;
                break;
        }
    }

    if (options && (options as any).embedSubs) {
        formatText = `${formatText} --embed-subs`;
    }

    if (options && (options as any).embedThumbnail) {
        formatText = `${formatText} --embed-thumbnail`;
    }

    return formatText;
}

function checkType(type: any, value: FormatOptions | DownloadOptions) {
    const check = type.safeParse(value);

    if (!check.success) {
        const errorObj = check.error.issues[0];
        const errorText = `${errorObj.path} type error, ${errorObj.message}`;
        throw new TypeError(errorText);
    }
}
