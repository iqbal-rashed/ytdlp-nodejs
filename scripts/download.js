/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { URL } = require('url');

const DOWNLOAD_URLS = {
  ytdlpWin64:
    'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe',
  ytdlpWin32:
    'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_x86.exe',
  ytdlpMacos:
    'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos',
  ytdlpLinux:
    'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp',
};

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const req = protocol.get(url, options, response => {
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        const redirectUrl = new URL(response.headers.location, url).toString();
        console.log(`Following redirect to: ${redirectUrl}`);

        request(redirectUrl, options).then(resolve).catch(reject);
        return;
      }

      resolve(response);
    });

    req.on('error', reject);

    // Set a timeout
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

async function downloadFile(url, outputPath) {
  try {
    const fileStream = fs.createWriteStream(outputPath);

    const response = await request(url);

    if (response.statusCode !== 200) {
      fileStream.close();
      fs.unlinkSync(outputPath);
      throw new Error(
        `Failed to download file: ${response.statusCode} ${response.statusMessage}`
      );
    }

    response.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', err => {
        fileStream.close();
        fs.unlinkSync(outputPath);
        reject(err);
      });

      response.on('error', err => {
        fileStream.close();
        fs.unlinkSync(outputPath);
        reject(err);
      });
    });
  } catch (error) {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    throw error;
  }
}

async function downloadYtDlp() {
  const platform = os.platform();
  const arch = os.arch();

  let downloadUrl;
  let fileName;

  if (platform === 'win32') {
    if (arch === 'x64') {
      downloadUrl = DOWNLOAD_URLS.ytdlpWin64;
      fileName = 'yt-dlp.exe';
    } else {
      downloadUrl = DOWNLOAD_URLS.ytdlpWin32;
      fileName = 'yt-dlp.exe';
    }
  } else if (platform === 'darwin') {
    downloadUrl = DOWNLOAD_URLS.ytdlpMacos;
    fileName = 'yt-dlp';
  } else if (platform === 'linux') {
    downloadUrl = DOWNLOAD_URLS.ytdlpLinux;
    fileName = 'yt-dlp';
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const binDir = path.join(__dirname, '..', 'bin');
  const outputPath = path.join(binDir, fileName);

  console.log(
    `Downloading yt-dlp for ${platform} (${arch}) from ${downloadUrl}...`
  );

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  try {
    await downloadFile(downloadUrl, outputPath);
    console.log(`yt-dlp downloaded successfully to: ${outputPath}`);

    if (platform !== 'win32') {
      try {
        fs.chmodSync(outputPath, 0o755);
        console.log('Made yt-dlp executable');
      } catch (err) {
        console.error('Error making yt-dlp executable:', err);
      }
    }

    return outputPath;
  } catch (error) {
    console.error(`Download failed: ${error.message}`);
    throw error;
  }
}

if (require.main === module) {
  downloadYtDlp()
    .then(filePath => {
      console.log(`yt-dlp is ready at: ${filePath}`);
    })
    .catch(err => {
      console.error('Failed to download yt-dlp:', err);
      process.exit(1);
    });
} else {
  module.exports = downloadYtDlp;
}
