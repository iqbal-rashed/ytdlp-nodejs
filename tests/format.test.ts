import {
  getContentType,
  getContentTypeFromArgs,
  getFileExtension,
  getFileExtensionFromArgs,
  parseFormatOptions,
} from '../src/utils/format';

describe('format utilities', () => {
  describe('parseFormatOptions', () => {
    test('returns empty array for no format', () => {
      expect(parseFormatOptions()).toEqual([]);
    });

    test('returns -f flag for string format', () => {
      expect(parseFormatOptions('best')).toEqual(['-f', 'best']);
    });

    test('returns audio extraction args for audioonly filter', () => {
      const args = parseFormatOptions({
        filter: 'audioonly',
        type: 'mp3',
        quality: 5,
      });
      expect(args).toContain('-x');
      expect(args).toContain('--audio-format');
      expect(args).toContain('mp3');
    });
  });

  describe('getContentType', () => {
    test('returns video/mp4 for undefined format', () => {
      expect(getContentType()).toBe('video/mp4');
    });

    test('returns video/mp4 for string format', () => {
      expect(getContentType('best')).toBe('video/mp4');
    });

    test('returns audio/mp3 for audioonly mp3', () => {
      expect(getContentType({ filter: 'audioonly', type: 'mp3' })).toBe(
        'audio/mp3',
      );
    });

    test('returns audio/flac for audioonly flac', () => {
      expect(getContentType({ filter: 'audioonly', type: 'flac' })).toBe(
        'audio/flac',
      );
    });
  });

  describe('getContentTypeFromArgs (issue #43)', () => {
    test('returns null when extractAudio is false', () => {
      expect(getContentTypeFromArgs({ extractAudio: false })).toBeNull();
    });

    test('returns null when options is undefined', () => {
      expect(getContentTypeFromArgs()).toBeNull();
    });

    test('returns audio/mpeg for extractAudio with mp3', () => {
      expect(
        getContentTypeFromArgs({ extractAudio: true, audioFormat: 'mp3' }),
      ).toBe('audio/mpeg');
    });

    test('returns audio/mpeg as default for extractAudio without format', () => {
      expect(getContentTypeFromArgs({ extractAudio: true })).toBe('audio/mpeg');
    });

    test('returns audio/flac for extractAudio with flac', () => {
      expect(
        getContentTypeFromArgs({ extractAudio: true, audioFormat: 'flac' }),
      ).toBe('audio/flac');
    });

    test('returns audio/aac for extractAudio with aac', () => {
      expect(
        getContentTypeFromArgs({ extractAudio: true, audioFormat: 'aac' }),
      ).toBe('audio/aac');
    });
  });

  describe('getFileExtension', () => {
    test('returns mp4 for undefined format', () => {
      expect(getFileExtension()).toBe('mp4');
    });

    test('returns mp3 for audioonly filter', () => {
      expect(getFileExtension({ filter: 'audioonly' })).toBe('mp3');
    });

    test('returns specified type', () => {
      expect(getFileExtension({ filter: 'audioonly', type: 'flac' })).toBe(
        'flac',
      );
    });
  });

  describe('getFileExtensionFromArgs', () => {
    test('returns null when extractAudio is false', () => {
      expect(getFileExtensionFromArgs({ extractAudio: false })).toBeNull();
    });

    test('returns mp3 as default for extractAudio', () => {
      expect(getFileExtensionFromArgs({ extractAudio: true })).toBe('mp3');
    });

    test('returns specified audioFormat', () => {
      expect(
        getFileExtensionFromArgs({ extractAudio: true, audioFormat: 'flac' }),
      ).toBe('flac');
    });
  });
});
