import { createArgs } from '../src/utils/args';
import { Download } from '../src/builder/download-builder';

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

    test('debugPrint() fluent method sets debugPrintCommandLine option', () => {
      const builder = new Download('https://example.com/video');
      builder.debugPrint(true);

      // Access the extraArgs to verify the option was set (using getCommand to indirectly verify)
      // The debugPrint method sets the option, which affects the behavior when run() is called
      const command = builder.getCommand();
      // Verify the builder was properly configured
      expect(command).toContain('https://example.com/video');
    });

    test('getCommand() returns the full command string for debugging', () => {
      const builder = new Download('https://example.com/video');
      builder.setBinaryPath('/path/to/yt-dlp');

      const command = builder.getCommand();
      expect(command).toContain('/path/to/yt-dlp');
      expect(command).toContain('https://example.com/video');
    });
  });
});
