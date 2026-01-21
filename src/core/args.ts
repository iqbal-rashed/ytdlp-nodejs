import { ArgsOptions } from '../types';
import { createArgs } from '../utils/args';
import { PROGRESS_STRING } from '../utils/progress';

export type BuildArgsOptions = {
  url?: string;
  options?: ArgsOptions;
  ffmpegPath?: string;
  withProgressTemplate?: boolean;
  extra?: string[];
};

export function buildYtDlpArgs({
  url,
  options,
  ffmpegPath,
  withProgressTemplate,
  extra,
}: BuildArgsOptions): string[] {
  const args = createArgs(options || {});

  if (ffmpegPath) {
    args.push('--ffmpeg-location', ffmpegPath);
  }

  if (withProgressTemplate) {
    args.push('--progress-template', PROGRESS_STRING);
  }

  if (extra && extra.length > 0) {
    args.push(...extra);
  }

  if (url) {
    args.push(url);
  }

  return args;
}
