/**
 * HTTP Request Utilities
 * Provides functions for making HTTP/HTTPS requests and downloading files.
 * @module utils/request
 */
import * as https from 'https';
import * as http from 'http';
/**
 * Makes an HTTP/HTTPS GET request with automatic redirect handling.
 * @param url - Target URL
 * @param options - Additional request options
 * @returns Promise resolving to the HTTP response
 * @example
 * const response = await request('https://example.com/file.txt');
 * console.log(response.statusCode);
 */
export declare function request(url: string, options?: https.RequestOptions): Promise<http.IncomingMessage>;
/**
 * Downloads a file from a URL to the local filesystem with progress reporting.
 * @param url - URL of the file to download
 * @param outputPath - Local path to save the file
 * @throws Error if download fails or HTTP status is not 200
 * @example
 * await downloadFile('https://example.com/file.zip', '/tmp/file.zip');
 */
export declare function downloadFile(url: string, outputPath: string): Promise<void>;
/**
 * Fetches text content from a URL.
 * @param url - URL to fetch
 * @param options - Additional request options
 * @returns Promise resolving to the response body as a string
 * @throws Error if HTTP status is not 200
 * @example
 * const html = await fetchText('https://example.com');
 */
export declare function fetchText(url: string, options?: https.RequestOptions): Promise<string>;
