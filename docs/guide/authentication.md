# Authentication

Some content requires authentication to access. `ytdlp-nodejs` supports multiple authentication methods.

## Using Browser Cookies

The easiest way to authenticate is to use cookies from a browser where you're already logged in:

```typescript
await ytdlp.downloadAsync(url, {
  cookiesFromBrowser: 'chrome', // or 'firefox', 'edge', 'safari', 'opera', 'brave'
});
```

### Browser Profiles

For browsers with multiple profiles:

```typescript
await ytdlp.downloadAsync(url, {
  cookiesFromBrowser: 'chrome:Profile 1',
});
```

## Using Cookie Files

You can export cookies to a Netscape-format file and use it:

```typescript
await ytdlp.downloadAsync(url, {
  cookies: '/path/to/cookies.txt',
});
```

### Exporting Cookies

Use a browser extension like "Get cookies.txt" to export your cookies.

## Username & Password

For sites that support direct authentication:

```typescript
await ytdlp.downloadAsync(url, {
  username: 'your_username',
  password: 'your_password',
});
```

## Two-Factor Authentication

```typescript
await ytdlp.downloadAsync(url, {
  username: 'your_username',
  password: 'your_password',
  twofactor: '123456', // 2FA code
});
```

## Video Password

For password-protected videos (like Vimeo):

```typescript
await ytdlp.downloadAsync(url, {
  videoPassword: 'video_password',
});
```

## API Keys

Some extractors require API keys:

```typescript
await ytdlp.downloadAsync(url, {
  rawArgs: ['--extractor-args', 'youtube:api_key=YOUR_API_KEY'],
});
```

## Age-Restricted Content

For age-restricted YouTube videos, use browser cookies from a logged-in account:

```typescript
await ytdlp.downloadAsync(url, {
  cookiesFromBrowser: 'chrome',
  // Alternatively, add age gate bypass
  rawArgs: ['--extractor-args', 'youtube:skip=dash'],
});
```

## Troubleshooting Authentication

### "Sign in to confirm you're not a bot"

This YouTube error requires valid cookies:

```typescript
await ytdlp.downloadAsync(url, {
  cookiesFromBrowser: 'chrome',
  // Force fresh cookies
  noCacheDir: true,
});
```

### Cookie Permission Errors

On some systems, you may need elevated permissions to access browser cookies. Run your script with appropriate permissions or use a cookie file instead.
