/**
 * HTTP Request Utilities
 * Provides functions for making HTTP/HTTPS requests and downloading files.
 * @module utils/request
 */

import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import * as fs from 'fs';

/**
 * Makes an HTTP/HTTPS GET request with automatic redirect handling.
 * @param url - Target URL
 * @param options - Additional request options
 * @returns Promise resolving to the HTTP response
 * @example
 * const response = await request('https://example.com/file.txt');
 * console.log(response.statusCode);
 */
export function request(
  url: string,
  options: https.RequestOptions = {},
): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const req = protocol.get(url, options, (response) => {
      if (
        response.statusCode! >= 300 &&
        response.statusCode! < 400 &&
        response.headers.location
      ) {
        const redirectUrl = new URL(response.headers.location, url).toString();
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

/**
 * Downloads a file from a URL to the local filesystem with progress reporting.
 * @param url - URL of the file to download
 * @param outputPath - Local path to save the file
 * @throws Error if download fails or HTTP status is not 200
 * @example
 * await downloadFile('https://example.com/file.zip', '/tmp/file.zip');
 */
export async function downloadFile(
  url: string,
  outputPath: string,
): Promise<void> {
  try {
    const fileStream = fs.createWriteStream(outputPath);

    const response = await request(url);

    if (response.statusCode !== 200) {
      fileStream.close();
      fs.unlinkSync(outputPath);
      throw new Error(
        `Failed to download file: ${response.statusCode} ${response.statusMessage}`,
      );
    }

    const totalSize = parseInt(response.headers['content-length'] || '0', 10);
    let downloadedSize = 0;

    response.on('data', (chunk) => {
      downloadedSize += chunk.length;
      const progress = (downloadedSize / totalSize) * 100;
      process.stdout.write(`Progress: ${Math.round(progress)}%\r`);
    });

    response.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('\nDownload complete!');
        resolve();
      });

      fileStream.on('error', (err) => {
        fileStream.close();
        fs.unlinkSync(outputPath);
        reject(err);
      });

      response.on('error', (err) => {
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

/**
 * Fetches text content from a URL.
 * @param url - URL to fetch
 * @param options - Additional request options
 * @returns Promise resolving to the response body as a string
 * @throws Error if HTTP status is not 200
 * @example
 * const html = await fetchText('https://example.com');
 */
export async function fetchText(
  url: string,
  options: https.RequestOptions = {},
): Promise<string> {
  const response = await request(url, options);

  if (response.statusCode !== 200) {
    throw new Error(
      `Failed to fetch text: ${response.statusCode} ${response.statusMessage}`,
    );
  }

  return new Promise((resolve, reject) => {
    let data = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => resolve(data));
    response.on('error', reject);
  });
}
