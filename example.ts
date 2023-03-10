import ytdlp from "./src/index";

const yt = ytdlp.download(
    "https://www.youtube.com/watch?v=xEALTVLxrDw&list=RD6DtPF9W3ejI&index=4",
    {
        filter: "audioandvideo",
    }
);

yt.on("progress", (progress) => {
    console.log(progress);
});
