"use strict";
/**
 * ytdlp-nodejs CLI
 * Main entry point for the command-line interface.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const interactive_1 = require("./interactive");
const commands_1 = require("./commands");
/**
 * Main CLI entry point.
 */
async function main() {
    const { command, positionals, options } = (0, utils_1.parseCliArgs)(process.argv.slice(2));
    // No command = interactive mode
    if (!command) {
        await (0, interactive_1.runInteractive)();
        return;
    }
    // Help command
    if (options.help || command === 'help') {
        (0, utils_1.printUsage)();
        return;
    }
    // Run specific command
    await (0, commands_1.runCommand)(command, positionals, options);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
