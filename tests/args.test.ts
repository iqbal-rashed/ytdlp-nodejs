import { buildYtDlpArgs } from '../src/core/args';
import { createArgs } from '../src/utils/args';
import { PROGRESS_STRING } from '../src/utils/progress';

describe('args builder', () => {
  test('createArgs appends rawArgs after additionalOptions', () => {
    const args = createArgs({
      additionalOptions: ['--foo'],
      rawArgs: ['--bar'],
    });
    expect(args.slice(-2)).toEqual(['--foo', '--bar']);
  });

  test('createArgs defaults jsRuntime to node', () => {
    const args = createArgs({});
    expect(args).toContain('--js-runtime');
    expect(args).toContain('node');
  });

  test('createArgs respects provided jsRuntime', () => {
    const args = createArgs({ jsRuntime: 'deno' });
    expect(args).toContain('--js-runtime');
    expect(args).toContain('deno');
  });

  test('buildYtDlpArgs adds ffmpeg, progress template, extras, and url', () => {
    const args = buildYtDlpArgs({
      url: 'https://example.com',
      options: { verbose: true },
      ffmpegPath: '/tmp/ffmpeg',
      withProgressTemplate: true,
      extra: ['--print', 'title'],
    });

    expect(args).toContain('--ffmpeg-location');
    expect(args).toContain('/tmp/ffmpeg');
    expect(args).toContain('--progress-template');
    expect(args).toContain(PROGRESS_STRING);
    expect(args).toContain('--print');
    expect(args).toContain('title');
    expect(args[args.length - 1]).toBe('https://example.com');
  });
});
