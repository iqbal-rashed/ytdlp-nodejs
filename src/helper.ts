export const PROGRESS_STRING =
    'brightest-{"status":"%(progress.status)s","downloaded":"%(progress.downloaded_bytes)s","total":"%(progress.total_bytes)s","speed":"%(progress.speed)s","eta":"%(progress.eta)s"}';

export function formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

export function percentage(partialValue: any, totalValue: any) {
    return (100 * partialValue) / totalValue;
}

export function secondsToHms(d: any) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s >= 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
}
