export const PROGRESS_STRING =
    'bright-{"status":"%(progress.status)s","downloaded":"%(progress.downloaded_bytes)s","total":"%(progress.total_bytes)s","total_estimate":"%(progress.total_bytes_estimate)s","speed":"%(progress.speed)s","eta":"%(progress.eta)s"}';

export function formatBytes(bytes: string | number, decimals = 2) {
    let newBytes = Number(bytes);

    if (newBytes === 0 || isNaN(newBytes)) return newBytes + " Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(newBytes) / Math.log(k));

    return parseFloat((newBytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function toFixedNumber(num: number, digits: number, base?: number) {
    var pow = Math.pow(base || 10, digits);
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
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s >= 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
}

export function thr() {
    throw new Error();
}
