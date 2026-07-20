/**
 * CLI Utilities
 * Provides argument parsing, formatting, and helper functions.
 */
import { ArgsOptions, FormatTableRow } from '../types';
export type CliOptionValue = string | boolean | string[];
/**
 * Gets the package version from package.json.
 */
export declare function getPackageVersion(): string;
/**
 * Converts kebab-case to camelCase.
 */
export declare function toCamelCase(input: string): string;
/**
 * Parses CLI arguments into structured format.
 */
export declare function parseCliArgs(argv: string[]): {
    command: string | undefined;
    positionals: string[];
    options: Record<string, CliOptionValue>;
};
/**
 * Formats format table rows for display.
 */
export declare function formatTableRows(rows: FormatTableRow[]): string;
/**
 * Builds ArgsOptions from CLI options.
 */
export declare function buildArgsOptions(cliOptions: Record<string, CliOptionValue>): ArgsOptions;
/**
 * Creates a progress handler for console output.
 */
export declare function progressHandler(prefix: string): (progress: {
    percentage_str?: string;
}) => void;
/**
 * Prints CLI usage help.
 */
export declare function printUsage(): void;
