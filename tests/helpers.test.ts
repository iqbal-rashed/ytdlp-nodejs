import { YtDlp } from '../src';

const ytdlp = new YtDlp();

describe('Convenience Methods', () => {
  let downloadAsyncSpy: jest.SpyInstance;
  let execAsyncSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock the underlying downloadAsync method
    downloadAsyncSpy = jest.spyOn(ytdlp, 'downloadAsync').mockResolvedValue({
      output: '',
      filePaths: [],
    });

    // Mock the execAsync method for getSubtitles and getComments
    execAsyncSpy = jest.spyOn(ytdlp, 'execAsync').mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: 0,
      command: '',
      output: '',
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
    it('should request metadata and return manual and automatic subtitle tracks', async () => {
      execAsyncSpy.mockResolvedValueOnce({
        stdout: '',
        stderr: '',
        exitCode: 0,
        command: '',
        output: JSON.stringify({
          subtitles: {
            en: [{ ext: 'vtt', url: 'https://example.com/en.vtt', name: 'English' }],
          },
          automatic_captions: {
            es: [{ ext: 'json3', url: 'https://example.com/es.json3' }],
          },
        }),
      });

      await expect(
        ytdlp.getSubtitles('https://www.youtube.com/watch?v=123'),
      ).resolves.toEqual([
        {
          language: 'en',
          languages: ['en'],
          ext: 'vtt',
          autoCaption: false,
          url: 'https://example.com/en.vtt',
          name: 'English',
        },
        {
          language: 'es',
          languages: ['es'],
          ext: 'json3',
          autoCaption: true,
          url: 'https://example.com/es.json3',
        },
      ]);
      await ytdlp.getSubtitles('https://www.youtube.com/watch?v=123');
      expect(execAsyncSpy).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=123',
        {
          dumpSingleJson: true,
          skipDownload: true,
        },
      );
    });

    it('should return an empty array when metadata is not JSON', async () => {
      execAsyncSpy.mockResolvedValueOnce({
        stdout: '', stderr: '', exitCode: 0, command: '', output: 'not json',
      });
      await expect(ytdlp.getSubtitles('https://example.com')).resolves.toEqual([]);
    });
  });

  describe('getComments', () => {
    it('should use write-comments and dump-json', async () => {
      await ytdlp.getComments('https://www.youtube.com/watch?v=123', 50);
      expect(execAsyncSpy).toHaveBeenCalledWith(
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

  describe('getVersionAsync', () => {
    it('uses the binary version probe without constructing a URL-based command', async () => {
      const versionSpy = jest
        .spyOn(
          ytdlp as unknown as {
            getVersionAsyncUsingBinary: (path: string) => Promise<string>;
          },
          'getVersionAsyncUsingBinary',
        )
        .mockResolvedValue('2026.07.27');

      await expect(ytdlp.getVersionAsync()).resolves.toBe('2026.07.27');
      expect(versionSpy).toHaveBeenCalledWith(ytdlp.binaryPath);
      expect(execAsyncSpy).not.toHaveBeenCalled();
    });
  });
});
