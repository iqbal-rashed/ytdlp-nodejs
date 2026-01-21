# Playlists

`ytdlp-nodejs` fully supports downloading and fetching information from playlists.

## Get Playlist Information

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

async function getPlaylistInfo() {
  const info = await ytdlp.getInfoAsync(
    'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
  );

  if (info._type === 'playlist') {
    console.log('Playlist title:', info.title);
    console.log('Video count:', info.entries?.length);

    // List all videos in the playlist
    info.entries?.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.title}`);
    });
  }
}

getPlaylistInfo();
```

## Download Entire Playlist

```typescript
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

async function downloadPlaylist() {
  await ytdlp.downloadAsync(
    'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
    {
      output: './playlist/%(playlist_index)s - %(title)s.%(ext)s',
      onProgress: (p) => {
        console.log(`Downloading: ${p.percentage_str}`);
      },
    },
  );
}

downloadPlaylist();
```

## Download Specific Videos from Playlist

Use `playlistItems` to select specific videos:

```typescript
await ytdlp.downloadAsync(playlistUrl, {
  playlistItems: '1-5', // First 5 videos
  // playlistItems: '1,3,5', // Videos 1, 3, and 5
  // playlistItems: '5-',    // From video 5 to the end
});
```

## Playlist Options

| Option            | Description                                |
| ----------------- | ------------------------------------------ |
| `flatPlaylist`    | Only get video IDs, not full info (faster) |
| `playlistStart`   | Start from this video index                |
| `playlistEnd`     | Stop at this video index                   |
| `playlistItems`   | Specific items to download (e.g., "1-3,5") |
| `playlistReverse` | Download in reverse order                  |
| `playlistRandom`  | Download in random order                   |

## Channel Downloads

You can also download from YouTube channels:

```typescript
// Download all videos from a channel
await ytdlp.downloadAsync('https://www.youtube.com/@ChannelName/videos', {
  output: './channel/%(upload_date)s - %(title)s.%(ext)s',
  dateafter: '20240101', // Only videos after this date
});
```
