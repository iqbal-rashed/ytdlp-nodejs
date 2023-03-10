type VideoQuality =
    | "2160p"
    | "1440p"
    | "1080p"
    | "720p"
    | "480p"
    | "360p"
    | "240p"
    | "144p"
    | "highest"
    | "lowest";

type StreamQualityOptions = {
    videoonly: VideoQuality;
    audioonly: "highest" | "lowest";
    audioandvideo: "highest" | "lowest";
};
type DownloadQualityOptions = {
    videoonly: VideoQuality;
    audioonly: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    audioandvideo: "highest" | "lowest";
    mergevideo: VideoQuality;
};

type DownloadFormatOptions = {
    videoonly: "mp4" | "webm";
    audioandvideo: "mp4" | "webm";
    mergevideo: "mkv" | "mp4" | "ogg" | "webm" | "flv";
    audioonly:
        | "aac"
        | "flac"
        | "mp3"
        | "m4a"
        | "opus"
        | "vorbis"
        | "wav"
        | "alac";
};

export type OutputType = {
    output?:
        | {
              outDir: string;
              fileName?: string | "default";
          }
        | string;
};

//! export type from here
export type StreamKeyWord = keyof StreamQualityOptions;

export type StreamOptions<F extends StreamKeyWord> = {
    filter: F;
    quality?: StreamQualityOptions[F];
    command?: string[];
};

export type DownloadKeyWord = keyof DownloadQualityOptions;

export type DownloadOptions<F extends DownloadKeyWord> = (F extends "mergevideo"
    ? {
          filter: F;
          quality?: DownloadQualityOptions[F];
          format?: DownloadFormatOptions[F];
          embedSubs?: boolean;
          embedThumbnail?: boolean;
          command?: string[];
      }
    : {
          filter: F;
          quality?: DownloadQualityOptions[F];
          format?: DownloadFormatOptions[F];
          embedSubs?: boolean;
          embedThumbnail?: boolean;
          command?: string[];
      }) &
    OutputType;

export type AsyncOptions<F extends DownloadKeyWord> = {
    onProgress: () => void;
} & DownloadOptions<F>;

export type PipeType<T> = (
    destination: NodeJS.WritableStream,
    options?: {
        end?: boolean;
    }
) => T;

export interface VideoInfo {
    id: string;
    title: string;
    formats: object[];
    thumbnails: object[];
    thumbnail: string;
    description: string;
    uploader: string;
    duration: string;
    view_count: string;
    upload_date: string;
}

export type ThumbnailsOptions = {
    quality?: "max" | "hq" | "mq" | "sd" | "default";
    type?: "jpg" | "webp";
};

export type ProgressType = {
    status: "downloading" | "finished";
    downloaded: number;
    downloaded_str: string;
    total: number;
    total_str: string;
    speed: number;
    speed_str: string;
    eta: number;
    eta_str: string;
    percentage: number;
    percentage_str: string;
};
