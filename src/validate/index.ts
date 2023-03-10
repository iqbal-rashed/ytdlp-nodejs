import { thr } from "../utils";
import {
    DownloadKeyWord,
    DownloadOptions,
    StreamKeyWord,
    StreamOptions,
} from "../utils/types";
import { DownloadOptionsSchema, StreamOptionsSchema } from "./schema";

export function StreamOptionsValidate<T extends StreamKeyWord>(
    options?: StreamOptions<T>
) {
    return StreamOptionsSchema.safeParse(options);
}

export function DownloadOptionsValidate<T extends DownloadKeyWord>(
    options?: DownloadOptions<T>
) {
    return DownloadOptionsSchema.safeParse(options);
}

export function parseAndValidateUrl(url: string): string | undefined {
    try {
        const parsed = new URL(url.trim());
        const urlRegex =
            /https:\/\/www.youtube.com\/(playlist|watch|shorts)(\?|\/)/g;
        const checkUrl = urlRegex.test(parsed.toString());
        if (!checkUrl) thr();
        const videoId = parsed.searchParams.get("v");
        if (!videoId) thr();
        const videoRegex = /^[a-zA-Z0-9-_]{11}$/;
        if (!videoRegex.test(videoId!.trim())) thr();
        return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (err) {
        return undefined;
    }
}
