import {
    DownloadOptions,
    StreamOptions,
    StreamKeyWord,
    DownloadKeyWord,
} from "./utils/types";
import VideoDownload from "./classes/VideoDownload";
import VideoStream from "./classes/VideoStream";
import { getThumbnails } from "./functions/index";

function download<F extends DownloadKeyWord>(
    url: string,
    options?: DownloadOptions<F>
): VideoDownload {
    const d = new VideoDownload(url, options);
    return d;
}

function stream<F extends StreamKeyWord>(
    url: string,
    options?: StreamOptions<F>
): VideoStream {
    const s = new VideoStream(url, options);
    return s;
}

const ytdlp = {
    download,
    stream,
    thumbnail: getThumbnails,
};

export = ytdlp;
