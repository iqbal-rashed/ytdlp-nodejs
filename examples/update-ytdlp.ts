import { YtDlp } from 'ytdlp-nodejs';

async function update() {
  const ytdlp = new YtDlp();
  const result = await ytdlp.updateYtDlpAsync();
  console.log(result);
}

update().catch((error) => {
  console.error('Error:', error);
});
