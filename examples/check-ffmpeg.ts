import { YtDlp } from '../src/index';

const ytdlp = new YtDlp();


async function isInstallation() {
    try {
        const isInstalled = await ytdlp.checkInstallationAsync({ ffmpeg: true });
        return isInstalled;
    } catch (error) {
        console.log('test', error);
    }
}

ytdlp.downloadFFmpeg().then(async () => {
    const installed = await isInstallation()
    console.log(installed)
});