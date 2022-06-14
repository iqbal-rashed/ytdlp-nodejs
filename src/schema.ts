import { z } from "zod";

const videoQuality = z.enum([
    "2160p",
    "1440p",
    "1080p",
    "720p",
    "480p",
    "360p",
    "240p",
    "144p",
    "highest",
    "lowest",
]);

const outputType = z
    .string()
    .min(1)
    .or(
        z
            .object({
                outDir: z.string().min(1),
                fileName: z
                    .string()
                    .min(1)
                    .or(z.enum(["default"]))
                    .optional(),
            })
            .optional()
    );

export const videoonly = z.object({
    filter: z.enum(["videoonly"]),
    quality: videoQuality.optional(),
    format: z.enum(["mp4", "webm"]).optional(),
    embedSubs: z.boolean().optional(),
    embedThumbnail: z.boolean().optional(),
    defaultQuality: z.enum(["highest", "lowest", "none"]).optional(),
});

export const downloadVideoonly = videoonly.extend({
    output: outputType,
});

export const audioonly = z.object({
    filter: z.enum(["audioonly"]),
    quality: z.enum(["highest", "lowest"]).optional(),
});

export const downloadAudioonly = audioonly.extend({
    output: outputType,
});

export const audioandvideo = z.object({
    filter: z.enum(["audioandvideo"]),
    quality: z.enum(["highest", "lowest"]).optional(),
    embedSubs: z.boolean().optional(),
    embedThumbnail: z.boolean().optional(),
});

export const downloadAudioandvideo = audioandvideo.extend({
    output: outputType,
});

export const extractaudio = z.object({
    filter: z.enum(["extractaudio"]),
    quality: z.number().nonnegative().optional(),
    format: z
        .enum(["aac", "flac", "mp3", "m4a", "opus", "vorbis", "wav", "alac"])
        .optional(),
});

export const downloadExtractAudio = extractaudio.extend({
    output: outputType,
});

export const mergevideo = z.object({
    filter: z.enum(["mergevideo"]),
    quality: videoQuality.optional(),
    format: z.enum(["mkv", "mp4", "ogg", "webm", "flv"]).optional(),
    defaultQuality: z.enum(["highest", "lowest", "none"]).optional(),
    embedSubs: z.boolean().optional(),
    embedThumbnail: z.boolean().optional(),
});

export const downloadMergeVideo = mergevideo.extend({
    output: outputType,
});

export { outputType };

// .regex(
//     /(\.aac|\.flac|\.mp3|\.m4a|\.opus|\.vorbis|\.wav\.mkv|\.mp4|\.ogg|\.webm|\.flv)$/g,
//     "File extension not valid"
// ),
