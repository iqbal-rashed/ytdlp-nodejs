/**
 * CLI Commands
 * Provides non-interactive command handlers.
 */
import { CliOptionValue } from './utils';
/**
 * Runs a CLI command.
 */
export declare function runCommand(command: string, positionals: string[], options: Record<string, CliOptionValue>): Promise<void>;
