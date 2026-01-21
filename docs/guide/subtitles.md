# Subtitles

`ytdlp-nodejs` allows you to download subtitles, including auto-generated captions, and optionally embed them into the video file.

## Downloading Subtitles

To download subtitles alongside the video:

```typescript
await ytdlp.downloadAsync(url, {
  writeSubs: true,
  subLangs: ['en', 'es'], // Languages: English and Spanish
});
```

This will save `.vtt` (default) files next to the video.

## Embedding Subtitles

To embed the subtitles directly into the video container (e.g., MKV or MP4):

```typescript
await ytdlp.downloadAsync(url, {
  writeSubs: true,
  subLangs: ['en'],
  embedSubs: true,
  format: 'mergevideo', // Required for embedding in some containers like mp4
});
```

## Auto-Generated Captions

YouTube generates captions automatically. To download these:

```typescript
await ytdlp.downloadAsync(url, {
  writeAutoSubs: true,
  subLangs: ['en'],
});
```

## Subtitle Formats

You can specify the preferred subtitle format:

```typescript
await ytdlp.downloadAsync(url, {
  writeSubs: true,
  subFormat: 'srt', // Convert to SRT
});
```

## List Available Subtitles

You can check available subtitles in the video info:

```typescript
const info = await ytdlp.getInfoAsync(url);
console.log('Manual subs:', Object.keys(info.subtitles || {}));
console.log('Auto subs:', Object.keys(info.automatic_captions || {}));
```
