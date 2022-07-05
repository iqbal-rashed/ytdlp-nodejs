import ytdlp from "./src/index";
import { createWriteStream } from "fs";

const url = "https://www.youtube.com/watch?v=Qzc_aX8c8g4";
const file = createWriteStream("test.mp4");

ytdlp
    .stream(url, {
        filter: "videoonly",
        quality: "720p",
    })
    .on("error", (err) => {
        console.log(err);
    })
    .pipe(file);

ytdlp
    .download(url, {
        filter: "mergevideo",
        output: {
            fileName: "hello.mp4",
            outDir: "test",
        },
    })
    .on("progress", (data) => {
        console.log(data);
    });
