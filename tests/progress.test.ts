import { stringToProgress } from '../src/utils/progress';

describe('progress parsing', () => {
  test('parses progress template output', () => {
    const output =
      '~ytdlp-progress-{"filename":"file.mp4","status":"downloading","downloaded_bytes":1024,"total_bytes":2048,"speed":512,"eta":2}';
    const progress = stringToProgress(output);
    expect(progress).toBeDefined();
    expect(progress?.filename).toBe('file.mp4');
    expect(progress?.percentage).toBe(50);
  });
});
