import ytdlp from "./src/index";

const yt = ytdlp.download("https://www.youtube.com/watch?v=6DtPF9W3ejI", {
    filter: "audioandvideo",
});

yt.on("progress", (progress) => {
    console.log(progress);
});
