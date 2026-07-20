/**
 * CLI Prompt Utilities
 * Provides readline-based prompting for the interactive CLI.
 */
/**
 * Creates a readline-based prompter.
 */
export declare function createPrompter(): {
    ask: (message: string) => Promise<string>;
    close: () => any;
};
/**
 * Prompts for text input with optional default value.
 * Returns null if user enters 'q' to quit.
 */
export declare function promptText(ask: (message: string) => Promise<string>, message: string, initialValue?: string): Promise<string | null>;
/**
 * Prompts for yes/no confirmation.
 */
export declare function promptConfirm(ask: (message: string) => Promise<string>, message: string, initialValue?: boolean): Promise<boolean | null>;
/**
 * Prompts for single selection from a list.
 */
export declare function promptSelect(ask: (message: string) => Promise<string>, message: string, options: Array<{
    value: string;
    label: string;
}>, initialValue?: string): Promise<string | null>;
