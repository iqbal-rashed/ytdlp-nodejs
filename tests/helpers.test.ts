import { YtDlp } from '../src';

const ytdlp = new YtDlp();

describe('Convenience Methods', () => {
  let downloadAsyncSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock the underlying downloadAsync method
    downloadAsyncSpy = jest.spyOn(ytdlp, 'downloadAsync').mockResolvedValue({
      output: JSON.stringify({ comments: [] }),
      filePaths: [],
      thumbnailPaths: [],
      subtitlePaths: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadAudio', () => {
    it('should set extractAudio and default format', async () => {
      await ytdlp.downloadAudio('https://www.youtube.com/watch?v=123');
      expect(downloadAsyncSpy).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=123',
        {
          extractAudio: true,
          audioFormat: 'mp3',
        },
      );
    });

    it('should allow custom format', async () => {
      await ytdlp.downloadAudio('https://www.youtube.com/watch?v=123', 'wav');
      expect(downloadAsyncSpy).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=123',
        {
          extractAudio: true,
          audioFormat: 'wav',
        },
      );
    });
  });

  describe('downloadVideo', () => {
    it('should set default video format', async () => {
      await ytdlp.downloadVideo('https://www.youtube.com/watch?v=123');
      expect(downloadAsyncSpy).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=123',
        {
          format: 'bestvideo+bestaudio/best',
        },
      );
    });

    it('should set specific quality format', async () => {
      await ytdlp.downloadVideo('https://www.youtube.com/watch?v=123', '720p');
      expect(downloadAsyncSpy).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=123',
        {
          format: expect.stringContaining('bestvideo[height<=720]'),
        },
      );
    });
  });

  describe('getSubtitles', () => {
    it('should use list-subs and skip-download', async () => {
      await ytdlp.getSubtitles('https://www.youtube.com/watch?v=123');
      expect(downloadAsyncSpy).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=123',
        {
          listSubs: true,
          skipDownload: true,
        },
      );
    });
  });

  describe('getComments', () => {
    it('should use write-comments and dump-json', async () => {
      await ytdlp.getComments('https://www.youtube.com/watch?v=123', 50);
      expect(downloadAsyncSpy).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=123',
        expect.objectContaining({
          writeComments: true,
          dumpSingleJson: true,
          skipDownload: true,
          extractorArgs: {
            youtube: ['max_comments=50', 'player_skip=webpage'],
          },
        }),
      );
    });
  });
});
