import { YtDlp } from '../src/index';

async function listFormats() {
  const ytdlp = new YtDlp();
  // Using getFormatsAsync which uses JSON output for reliable format data
  const result = await ytdlp.getFormatsAsync(
    'https://www.youtube.com/watch?v=_AL4IwHuHlY',
  );

  if (result.source === 'json') {
    console.log('Formats from JSON:', result.formats?.length, 'formats found');
    console.log(result.formats?.slice(0, 5)); // Show first 5 formats
  } else {
    console.log('Formats from table:', result.table?.rows);
  }
}

listFormats().catch((error) => {
  console.error('Error:', error);
});
