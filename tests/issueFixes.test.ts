import { createArgs } from '../src/utils/args';

describe('issue fixes', () => {
  describe('#62 jsRuntime option', () => {
    test('adds --js-runtime when jsRuntime is specified', () => {
      const args = createArgs({ jsRuntime: 'node' });
      expect(args).toContain('--js-runtime');
      expect(args).toContain('node');
    });

    test('defaults to node js-runtime when not specified', () => {
      const args = createArgs({});
      expect(args).toContain('--js-runtime');
      expect(args).toContain('node');
    });

    test('supports deno runtime', () => {
      const args = createArgs({ jsRuntime: 'deno' });
      expect(args).toContain('--js-runtime');
      expect(args).toContain('deno');
    });
  });

  describe('#59 debugPrintCommandLine option', () => {
    // debugPrintCommandLine is handled at the runner level, not as a yt-dlp arg
    // It prints the command to stderr before execution
    test('does not add any flag to args (handled at runner level)', () => {
      const args = createArgs({ debugPrintCommandLine: true });
      // Should not contain --print-command-line (not a valid yt-dlp flag)
      expect(args).not.toContain('--print-command-line');
    });

    test('does not add --print-command-line when false', () => {
      const args = createArgs({ debugPrintCommandLine: false });
      expect(args).not.toContain('--print-command-line');
    });

    test('does not add --print-command-line when not specified', () => {
      const args = createArgs({});
      expect(args).not.toContain('--print-command-line');
    });
  });
});
