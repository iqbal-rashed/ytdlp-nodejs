import { VideoProgress } from '../types';

export const PROGRESS_STRING =
  '~ytdlp-progress-%(progress)#j';

export function formatBytes(bytes: string | number, decimals = 2) {
  const newBytes = Number(bytes);

  if (newBytes === 0 || isNaN(newBytes)) return newBytes + ' Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(newBytes) / Math.log(k));

  return parseFloat((newBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function toFixedNumber(num: number, digits: number, base?: number) {
  const pow = Math.pow(base || 10, digits);
  return Math.round(num * pow) / pow;
}

export function percentage(
  partialValue: string | number,
  totalValue: string | number
) {
  return toFixedNumber((100 * Number(partialValue)) / Number(totalValue), 2);
}

export function secondsToHms(d: number | string) {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
  const sDisplay = s >= 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
  return hDisplay + mDisplay + sDisplay;
}

export function stringToProgress(str: string): VideoProgress | undefined {
  try {
    if (!str.includes('~ytdlp-progress-')) throw new Error();

    const jsonStr = str.trim().replace('~ytdlp-progress-', '');
    if (!jsonStr) throw new Error();

    const object = JSON.parse(jsonStr);

    const total_bytes = Number(object.total_bytes);
    const total = isNaN(total_bytes)
      ? Number(object.total_bytes_estimate)
      : total_bytes;

    return {
      filename: object.filename,
      status: object.status,
      downloaded: Number(object.downloaded_bytes),
      downloaded_str: formatBytes(object.downloaded_bytes),
      total: total,
      total_str: formatBytes(total),
      speed: Number(object.speed),
      speed_str: formatBytes(object.speed) + '/s',
      eta: Number(object.eta),
      eta_str: secondsToHms(object.eta),
      percentage: percentage(object.downloaded_bytes, total),
      percentage_str: percentage(object.downloaded_bytes, total) + '%',
    };
  } catch {
    return undefined;
  }
}
