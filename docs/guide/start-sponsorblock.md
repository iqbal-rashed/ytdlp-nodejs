# SponsorBlock

[SponsorBlock](https://sponsor.ajay.app/) is a crowdsourced project to skip sponsor segments in YouTube videos. `ytdlp-nodejs` seamlessly integrates SponsorBlock functionality.

## Programmatic Usage

You can use SponsorBlock options in `downloadAsync`:

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

await ytdlp.downloadAsync(url, {
  // Mark segments as chapters
  sponsorblockMark: ['sponsor', 'intro', 'outro', 'selfpromo'],

  // Or remove segments entirely from the downloaded file
  sponsorblockRemove: ['sponsor', 'selfpromo'],
});
```

## Using the Fluent Builder API

```typescript
const result = await ytdlp
  .download(url)
  .options({
    sponsorblockMark: ['sponsor', 'intro'],
    sponsorblockRemove: ['selfpromo'],
  })
  .run();
```

## Categories

Common categories include:

- `sponsor`: Paid promotion
- `intro`: Animation/intro sequence
- `outro`: End credits/outro
- `selfpromo`: Self-promotion
- `interaction`: "Like and subscribe" reminders
- `preview`: Preview of next video
- `music_offtopic`: Non-music parts in music videos

## Modes

- **Mark**: Creates chapters in the video file for these segments.
- **Remove**: Physically cuts these segments from the video.

> **Note**: Removing segments requires FFmpeg to be installed.
