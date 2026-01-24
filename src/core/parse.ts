export function parsePrintedOutput(output: string): string {
  return output
    .replace(/~ytdlp-progress-\{[\s\S]*?\}\n?/g, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.includes('__YTDLP_FILEPATH__:'))
    .filter((line) => !line.includes('__YTDLP_VIDEO_INFO__:'))
    .filter((line) => !line.includes('__YTDLP_BEFORE_DL__:'))
    .join('\n');
}

/**
 * Parses video info JSON from yt-dlp output.
 */
export function parsePrintedVideoInfo(
  output: string,
): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  const lines = output.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('__YTDLP_VIDEO_INFO__:')) {
      const jsonStr = trimmed.replace('__YTDLP_VIDEO_INFO__:', '').trim();
      try {
        // Replace 'N/A' and 'NA' strings with null for proper JSON parsing
        const cleanedJsonStr = jsonStr
          .replace(/:"N\/A"/g, ':null')
          .replace(/:"NA"/g, ':null')
          .replace(/:""/g, ':"NA"'); // Preserve empty strings temporarily
        const parsed = JSON.parse(cleanedJsonStr);

        // Convert 'NA' placeholder back to empty strings and handle type conversions
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (value === 'NA') {
            result[key] = null;
          } else if (typeof value === 'string' && value === 'N/A') {
            result[key] = null;
          } else if (
            (key.includes('_count') ||
              key.includes('_timestamp') ||
              key === 'autonumber' ||
              key === 'video_autonumber' ||
              key === 'n_entries' ||
              key === 'playlist_count' ||
              key === 'release_year' ||
              key === 'start_time' ||
              key === 'end_time' ||
              key === 'epoch' ||
              key === 'duration' ||
              key === 'age_limit') &&
            typeof value === 'string'
          ) {
            // Convert numeric string fields to numbers
            const num = Number(value);
            result[key] = isNaN(num) ? null : num;
          } else if (
            (key === 'is_live' ||
              key === 'was_live' ||
              key === 'channel_is_verified') &&
            typeof value === 'string'
          ) {
            // Convert boolean string fields to booleans
            result[key] = value === 'true' || value === 'True';
          } else if (
            (key === 'categories' ||
              key === 'tags' ||
              key === 'creators' ||
              key === 'cast') &&
            typeof value === 'string'
          ) {
            // Parse array fields
            if (value === 'NA' || value === 'N/A' || value === '') {
              result[key] = null;
            } else {
              // Arrays are typically comma-separated in yt-dlp output
              result[key] = value.split(',').map((s) => s.trim());
            }
          } else {
            result[key] = value;
          }
        }
        results.push(result);
      } catch {
        // Skip invalid JSON entries
      }
    }
  }

  return results;
}

/**
 * Parses video info from a before_dl output line.
 * Returns null if the line doesn't contain before_dl info.
 */
export function parseBeforeDownloadInfo(
  line: string,
): Record<string, unknown> | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('__YTDLP_BEFORE_DL__:')) {
    return null;
  }

  const jsonStr = trimmed.replace('__YTDLP_BEFORE_DL__:', '').trim();
  try {
    const cleanedJsonStr = jsonStr
      .replace(/:"N\/A"/g, ':null')
      .replace(/:"NA"/g, ':null')
      .replace(/:""/, ':"NA"');
    const parsed = JSON.parse(cleanedJsonStr);

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === 'NA' || value === 'N/A') {
        result[key] = null;
      } else if (
        (key.includes('_count') ||
          key.includes('_timestamp') ||
          key === 'autonumber' ||
          key === 'video_autonumber' ||
          key === 'n_entries' ||
          key === 'playlist_count' ||
          key === 'release_year' ||
          key === 'start_time' ||
          key === 'end_time' ||
          key === 'epoch' ||
          key === 'duration' ||
          key === 'age_limit') &&
        typeof value === 'string'
      ) {
        const num = Number(value);
        result[key] = isNaN(num) ? null : num;
      } else if (
        (key === 'is_live' ||
          key === 'was_live' ||
          key === 'channel_is_verified') &&
        typeof value === 'string'
      ) {
        result[key] = value === 'true' || value === 'True';
      } else if (
        (key === 'categories' ||
          key === 'tags' ||
          key === 'creators' ||
          key === 'cast') &&
        typeof value === 'string'
      ) {
        if (value === 'NA' || value === 'N/A' || value === '') {
          result[key] = null;
        } else {
          result[key] = value.split(',').map((s: string) => s.trim());
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return null;
  }
}
