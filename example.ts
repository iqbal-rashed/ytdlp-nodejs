import ytdlp from "./src/index";
import { createWriteStream } from "fs";

const file = createWriteStream("test.mp4");

const url = "https://www.youtube.com/watch?v=Qzc_aX8c8g4";

const stream = ytdlp.stream(url, {
    filter: "videoonly",
    quality: "2160p",
    defaultQuality: "none",
});

stream.pipe(file);
