import { YtDlp } from '../src/index';

const ytdlp = new YtDlp()

ytdlp.getUrlsAsync("https://www.youtube.com/watch?v=bZQbkFJZ2C0").then(v => {
    console.log(v)
}).catch(err => {
    console.log("Error", err)
})