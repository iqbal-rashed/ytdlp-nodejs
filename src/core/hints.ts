const JS_RUNTIME_HINT =
  'yt-dlp reported a missing JavaScript runtime. Install Node.js or a supported browser runtime for full YouTube support. See README troubleshooting for details.';

export function detectYtDlpHint(stderr: string): string | undefined {
  const normalized = stderr.toLowerCase();
  if (
    normalized.includes('javascript runtime') ||
    normalized.includes('js runtime') ||
    normalized.includes('node.js') ||
    normalized.includes('nodejs') ||
    normalized.includes('phantomjs') ||
    normalized.includes('chromium') ||
    normalized.includes('firefox')
  ) {
    return JS_RUNTIME_HINT;
  }
  return undefined;
}
