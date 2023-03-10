<br>
<p align="center">
  <img width="150" src="https://github.com/iqbal-rashed/ytdlp-nodejs/raw/main/logo.png">
</p>
<h1 align="center"> YTDLP-NODEJS </h1>
<p align="center">
  <b >A youtube video downloader library for nodejs based on ytdlp</b>
</p>

<br>

## Description

ytdlp-nodejs is a Node.js library that provides functionality to download videos from YouTube, get video streams and thumbnails. It is based on the popular Python library, [ytdlp](https://github.com/yt-dlp/yt-dlp), and has strong TypeScript type support.
has strong TypeScript type support.


## Installation

```bash
npm i ytdlp-nodejs
```


## Get Started
```javascript
const ytdlp = require('ytdlp-nodejs')
const {createWriteStream} = require('fs')
const url = "https://www.youtube.com/watch?v=Qzc_aX8c8g4";

const file = createWriteStream("test.mp4");
// get stream
const stream = ytdlp
    .stream(url, {
        filter: "videoonly",
        quality: "2160p",
    })
    .on("error", (err) => {
        console.log(err);
    })
    .pipe(file);

// download video
ytdlp
    .download(url, {
        filter: "mergevideo",
        quality: "1080p",
        output: {
          fileName: "hello.mp4",
          outDir: "test",
        },
    })
    .on("progress", (data) => {
        console.log(data);
    });
```

## API


`$ ytdlp.download(url: string, options?: DownloadOptions)`
<br>

`$ ytdlp.stream(url: string, options?: StreamOptions):stream`
<br>

`$ ytdlp.thumbnail(url: string, options?:ThumbnailsOptions): string`
<br>


### DownloadOptions
`filter:` "videoonly" | "audioonly" | "audioandvideo" | "mergevideo"
* `filter: "videoonly"` 
  *  `quality:` "2160p" |
    "1440p" |
    "1080p" |
    "720p" |
    "480p" |
    "360p" |
    "240p" |
    "144p" |
    "highest" |
    "lowest" (default: 'highest')
  * `format:` "mp4"  | "webm" (default:'mp4')

* `filter: "audioonly"` 
  *  `quality:` "highest" | "lowest" (default:'highest')

* `filter: "audioandvideo"` 
  * `quality:` "highest" | "lowest" (default:'highest')
  * `format:` "mp4"  | "webm" (default:'mp4')

* `filter: "audioonly"` 
  * `quality:` 0 to 10 (default:5)
  * `format:` "aac" | "flac" | "mp3" | "m4a" | "opus" | "vorbis" | "wav" | "alac" (default:'mp3')

* `filter: "mergevideo"` 
  *  `quality:` "2160p" |
    "1440p" |
    "1080p" |
    "720p" |
    "480p" |
    "360p" |
    "240p" |
    "144p" |
    "highest" |
    "lowest" (default: 'highest')
  * `format:` "mkv" | "mp4" | "ogg" | "webm" | "flv" (default:'mp4')
  * `embedSubs:` boolean (default:false)
  * `embedThumbnail:` boolean (default:false)

`output:` "string" | "object"
  * `string` : Path string
  * `object` : { `outDir:` string, `fileName:` string | 'default' }


### StreamOptions
`filter:` "videoonly" | "audioonly" | "audioandvideo" 
* `filter: "videoonly"` 
  *  `quality:` "2160p" |
    "1440p" |
    "1080p" |
    "720p" |
    "480p" |
    "360p" |
    "240p" |
    "144p" |
    "highest" |
    "lowest" (default: 'highest')

* `filter: "audioonly"` 
  *  `quality:` "highest" | "lowest" (default:'highest')

* `filter: "audioandvideo"` 
  * `quality:` "highest" | "lowest" (default:'highest')

* `filter: "extractaudio"` 
  * `quality:` 0 to 10 (default:5)
  * `format:` "aac" | "flac" | "mp3" | "m4a" | "opus" | "vorbis" | "wav" | "alac" (default:'mp3')

* `filter: "mergevideo"` 
  *  `quality:` "2160p" |
    "1440p" |
    "1080p" |
    "720p" |
    "480p" |
    "360p" |
    "240p" |
    "144p" |
    "highest" |
    "lowest" (default: 'highest')
  * `format:` "mkv" | "mp4" | "ogg" | "webm" | "flv" (default:'mp4')
  * `embedSubs:` boolean (default:false)
  * `embedThumbnail:` boolean (default:false)
  * `defaultQuality:` "highest" | "lowest" | "none" (default:'highest')

### ThumbnailsOptions
* `quality`: "max" | "hq" | "mq" | "sd" | "default" (default: 'default')
* `type`: "jpg" | "webp" (default: 'jpg')





## Contribution
If you want to contribute or report any bug, you welcome
<br>
Don't forget to give a star 😍
