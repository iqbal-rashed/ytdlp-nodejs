# Advanced Usage

This section covers more complex scenarios and configuration options for `ytdlp-nodejs`.

## Raw Arguments

Sometimes you may need to use a specific `yt-dlp` flag that isn't explicitly typed in `ytdlp-nodejs`. You can use the `rawArgs` option to pass any argument directly to the executable.

```typescript
await ytdlp.downloadAsync(url, {
  // Pass --match-filter "duration > 60"
  rawArgs: ['--match-filter', 'duration > 60'],
});
```

## JavaScript Runtime

Some extractors (like YouTube) require a JavaScript runtime to decrypt signatures. `ytdlp-nodejs` defaults to using the `node` runtime, but you can change this if needed.

```typescript
await ytdlp.execAsync(url, {
  jsRuntime: 'deno', // or 'phantomjs', 'none'
});
```

Supported runtimes: `node`, `deno`, `phantomjs`.

## Custom Binaries

If you want to use a specific version of `yt-dlp` or `ffmpeg` that is already installed on your system:

```typescript
const ytdlp = new YtDlp({
  binaryPath: '/path/to/custom/yt-dlp',
  ffmpegPath: '/path/to/custom/ffmpeg',
});
```

## Proxy Configuration

You can route traffic through a proxy:

```typescript
await ytdlp.downloadAsync(url, {
  proxy: 'http://user:pass@proxyhost:port',
});
```

## Cookie handling

For age-gated content or premium accounts, you can provide cookies.

### From Browser

Use cookies from a browser where you are logged in:

```typescript
await ytdlp.downloadAsync(url, {
  cookiesFromBrowser: 'chrome', // or 'firefox', 'edge'
});
```

### From File

Use a Netscape-formatted cookies file:

```typescript
await ytdlp.downloadAsync(url, {
  cookies: '/path/to/cookies.txt',
});
```

## Debugging

To see exactly what `yt-dlp` command is being executed, enable command logging:

```typescript
await ytdlp.execAsync(url, {
  debugPrintCommandLine: true,
  verbose: true,
});
```

This will print the full command to the console (stderr).
