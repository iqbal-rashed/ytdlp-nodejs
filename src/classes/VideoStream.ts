import EmitterEvent from "./EmitterEvent";
import { StreamOptions, PipeType } from "../utils/types";
import { PassThrough } from "stream";
import { StreamOptionsValidate, parseAndValidateUrl } from "../validate";
import { getBinPath } from "../utils/binfile";
import { PROGRESS_STRING } from "../utils";
import { spawn } from "child_process";
import { parseStreamOptions, stringToProgress } from "../utils/helper";

class VideoStream extends EmitterEvent {
    pipe: PipeType<this>;

    private passThrough = new PassThrough();

    constructor(url: string, options?: StreamOptions<any>) {
        super();
        this.pipe = (
            destination: NodeJS.WritableStream,
            options?: { end?: boolean }
        ) => {
            this.passThrough.pipe(destination, options);
            return this;
        };

        const parseUrl = parseAndValidateUrl(url);
        if (!parseUrl) {
            this.emit("error", new Error("Url not valid"));
            return this;
        }
        if (!StreamOptionsValidate<any>(options).success) {
            this.emit("error", new Error("Options not validate"));
            return this;
        }

        const parseOptions = parseStreamOptions(options);

        const binPath = getBinPath();
        if (!binPath) return this;

        const { ytdlpPath } = binPath;

        const process = spawn(ytdlpPath, [
            url,
            "-o",
            "-",
            ...parseOptions,
            "--progress-template",
            PROGRESS_STRING,
        ]);

        process.stderr.on("data", (chunk) => {
            const str = Buffer.from(chunk).toString();
            if (str.includes("Requested format is not available.")) {
                process.stderr.emit(
                    "error",
                    new Error("Requested format is not available.")
                );
            }
            const result = stringToProgress(str);
            result && this.emit("progress", result);
        });

        process.stderr.on("end", () => {
            this.emit("finished", undefined);
        });

        process.stdout.pipe(this.passThrough);

        process.stdout.on("error", (err) => {
            this.emit("error", err);
        });
        process.stderr.on("error", (err) => {
            this.emit("error", err);
        });

        return this;
    }
}

export default VideoStream;
