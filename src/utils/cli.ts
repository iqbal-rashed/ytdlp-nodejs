// #!/usr/bin/env node

import { parseArgs } from 'node:util';
import { BIN_DIR } from '..';
import fs from 'fs';
import path from 'path';
import { downloadYtDlp } from './ytdlp';
import { downloadFFmpeg } from './ffmpeg';

const args = process.argv.slice(2);

const { values } = parseArgs({
  args,
  options: {
    download: {
      type: 'string',
      short: 'd',
      choices: ['ffmpeg', 'ytdlp'],
      default: 'ffmpeg',
    },
    out: {
      type: 'string',
      short: 'o',
      default: BIN_DIR,
    },
  },
});

const outDir = path.resolve(values.out);
if (!fs.existsSync(outDir)) {
  try {
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`Created directory: ${outDir}`);
  } catch (err) {
    console.error(`Error creating directory ${outDir}:`, err);
    process.exit(1);
  }
}

if (values.download == 'ytdlp') {
  downloadYtDlp(outDir);
} else if (values.download == 'ffmpeg') {
  downloadFFmpeg(outDir);
} else {
  console.error('Please select ffmpeg or ytdlp to download');
}
