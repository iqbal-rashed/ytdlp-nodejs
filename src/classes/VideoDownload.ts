import EmitterEvent from "./EmitterEvent";
import { DownloadOptions } from "../utils/types";
import { DownloadOptionsValidate, parseAndValidateUrl } from "../validate";
import { PROGRESS_STRING } from "../utils";
import { spawn } from "child_process";
import { getBinPath } from "../utils/binfile";
import { parseDownloadOptions, stringToProgress } from "../utils/helper";
import { OutputTypeSchema } from "../validate/schema";
import path from "path";
import fs from "fs";

class VideoDownload extends EmitterEvent {
    constructor(url: string, options?: DownloadOptions<any>) {
        super();

        const parseUrl = parseAndValidateUrl(url);
        if (!parseUrl) {
            this.emit("error", new Error("Url not valid"));
            return this;
        }

        if (!DownloadOptionsValidate(options).success) {
            this.emit("error", new Error("Options not validate"));
            return this;
        }

        let parseOptions = parseDownloadOptions(options);

        try {
            const output = this.getOutput(options?.output);
            parseOptions = parseOptions.concat(["-o", output]);
        } catch (err: any) {
            this.emit("error", err);
            return this;
        }

        const binPath = getBinPath();
        if (!binPath) return this;

        const { ytdlpPath } = binPath;

        const process = spawn(ytdlpPath, [
            parseUrl,
            ...parseOptions,
            "--progress-template",
            PROGRESS_STRING,
        ]);

        process.stdout.on("data", (data) => {
            const dataStr = Buffer.from(data).toString();
            if (dataStr.includes("Requested format is not available.")) {
                process.stdout.emit(
                    "error",
                    new Error("Requested format is not available.")
                );
            }
            if (dataStr.includes("has already been downloaded")) {
                process.stdout.emit("error", new Error("File already exists."));
            }
            const result = stringToProgress(dataStr);
            result && this.emit("progress", result);
        });

        process.stdout.on("error", (err) => {
            this.emit("error", err);
        });

        process.stdout.on("end", () => {
            this.emit("finished", undefined);
        });

        return this;
    }

    private getOutput(
        output?:
            | string
            | {
                  outDir: string;
                  fileName?: string | undefined;
              }
            | undefined
    ): string {
        let outputStr: string = "";
        if (!output || output == "default") {
            return "%(title)s %(height)sp .%(ext)s";
        }
        const check = OutputTypeSchema.safeParse({ output });
        if (!check.success) {
            const errorObj = check.error.issues[0];
            const errorText = `${errorObj.path} type error, ${errorObj.message}`;
            throw new Error(errorText);
        }

        const extReg =
            /(\.aac|\.flac|\.mp3|\.m4a|\.opus|\.vorbis|\.wav\.mkv|\.mp4|\.ogg|\.webm|\.flv)$/g;

        if (typeof output === "string") {
            output = path.resolve(output);
            if (fs.lstatSync(output).isDirectory()) {
                outputStr = path.join(output, "%(title)s %(height)sp .%(ext)s");
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
            let outDir = path.resolve(output.outDir);

            if (!fs.existsSync(outDir)) {
                throw new Error("Output directory not valid");
            } else {
                newObj.outDir = outDir;
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
                newObj.filename
                    ? newObj.filename
                    : "%(title)s %(height)sp .%(ext)s"
            );
        }

        return outputStr ? outputStr : "%(title)s %(height)sp .%(ext)s";
    }
}

export default VideoDownload;
