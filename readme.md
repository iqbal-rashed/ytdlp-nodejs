# yt-dlp-wrapper

A TypeScript wrapper for the yt-dlp executable that supports both ESM and CommonJS.

## Installation

```bash
npm install yt-dlp-wrapper
```

Make sure you have yt-dlp installed and available in your PATH. You can download it from [https://github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Usage

### ESM (ES Modules)

```javascript
import ytDlp, { YtDlp } from 'yt-dlp-wrapper';

// Using the default instance
async function example() {
  try {
    // Get video info
    const info = await ytDlp.getInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log(`Video title: ${info.title}`);
    
    // Download a video
    await ytDlp.download({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      format: 'best',
      output: '%(title)s.%(ext)s'
    });
    
    // Extract audio only
    await ytDlp.downloadAudio('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      audioFormat: 'mp3',
      output: '%(title)s.%(ext)s'
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### CommonJS

```javascript
const { default: ytDlp, YtDlp } = require('yt-dlp-wrapper');

// Using the default instance
async function example() {
  try {
    // Get video info
    const info = await ytDlp.getInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log(`Video title: ${info.title}`);
    
    // Download a video
    await ytDlp.download({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      format: 'best',
      output: '%(title)s.%(ext)s'
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Creating a Custom Instance

You can create your own instance with a custom path to the yt-dlp executable:

```javascript
import { YtDlp } from 'yt-dlp-wrapper';

const customYtDlp = new YtDlp('/path/to/yt-dlp');

// Now use customYtDlp instead of the default instance
```

## API

### YtDlp Class

#### Constructor

```typescript
constructor(binaryPath?: string)
```

- `binary