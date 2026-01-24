export function parseJson<T>(raw: string): T {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Empty JSON output from yt-dlp.');
  }
  return JSON.parse(trimmed) as T;
}
