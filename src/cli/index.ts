/**
 * ytdlp-nodejs CLI
 * Main entry point for the command-line interface.
 */

import { parseCliArgs, printUsage } from './utils';
import { runInteractive } from './interactive';
import { runCommand } from './commands';

/**
 * Main CLI entry point.
 */
async function main(): Promise<void> {
  const { command, positionals, options } = parseCliArgs(process.argv.slice(2));

  // No command = interactive mode
  if (!command) {
    await runInteractive();
    return;
  }

  // Help command
  if (options.help || command === 'help') {
    printUsage();
    return;
  }

  // Run specific command
  await runCommand(command, positionals, options);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
