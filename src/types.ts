import {
    videoonly,
    audioandvideo,
    audioonly,
    extractaudio,
    mergevideo,
    downloadAudioandvideo,
    downloadAudioonly,
    downloadExtractAudio,
    downloadMergeVideo,
    downloadVideoonly,
    outputType,
} from "./schema";
import { z } from "zod";

export type FormatOptions =
    | z.infer<typeof videoonly>
    | z.infer<typeof audioonly>
    | z.infer<typeof extractaudio>
    | z.infer<typeof mergevideo>
    | z.infer<typeof audioandvideo>;

export type DownloadOptions =
    | z.infer<typeof downloadVideoonly>
    | z.infer<typeof downloadAudioonly>
    | z.infer<typeof downloadExtractAudio>
    | z.infer<typeof downloadMergeVideo>
    | z.infer<typeof downloadAudioandvideo>;

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

export type OutputType = z.infer<typeof outputType>;
