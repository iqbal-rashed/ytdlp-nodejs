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

export const OutputTypeSchema = z
    .object({
        output: z
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
            ),
    })
    .optional();

export const StreamOptionsSchema = z
    .discriminatedUnion("filter", [
        z.object({
            filter: z.literal("audioandvideo"),
            quality: z.enum(["highest", "lowest"]).optional(),
            command: z.array(z.string()).optional(),
        }),
        z.object({
            filter: z.literal("audioonly"),
            quality: z.number().nonnegative().max(10).optional(),
            command: z.array(z.string()).optional(),
        }),
        z.object({
            filter: z.literal("videoonly"),
            quality: videoQuality.optional(),
            command: z.array(z.string()).optional(),
        }),
    ])
    .optional();

export const DownloadOptionsSchema = z
    .discriminatedUnion("filter", [
        z.object({
            filter: z.literal("audioandvideo"),
            quality: z.enum(["highest", "lowest"]).optional(),
            format: z.enum(["mp4", "webm"]).optional(),
            embedSubs: z.boolean().optional(),
            embedThumbnail: z.boolean().optional(),
        }),
        z.object({
            filter: z.literal("audioonly"),
            quality: z.number().nonnegative().max(10).optional(),
            format: z
                .enum([
                    "aac",
                    "flac",
                    "mp3",
                    "m4a",
                    "opus",
                    "vorbis",
                    "wav",
                    "alac",
                ])
                .optional(),
        }),
        z.object({
            filter: z.literal("videoonly"),
            quality: videoQuality.optional(),
            format: z.enum(["mp4", "webm"]).optional(),
            embedSubs: z.boolean().optional(),
            embedThumbnail: z.boolean().optional(),
        }),
        z.object({
            filter: z.literal("mergevideo"),
            quality: videoQuality.optional(),
            format: z
                .enum(["avi", "flv", "mkv", "mov", "mp4", "webm"])
                .optional(),
            embedSubs: z.boolean().optional(),
            embedThumbnail: z.boolean().optional(),
        }),
    ])
    .and(OutputTypeSchema)
    .optional();
