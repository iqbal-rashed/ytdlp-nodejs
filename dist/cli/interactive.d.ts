/**
 * CLI Interactive Flows
 * Provides interactive TUI flows for various CLI actions.
 */
import { YtDlp } from '..';
/**
 * Interactive video download flow.
 */
export declare function interactiveDownload(ytdlp: YtDlp, audioOnly?: boolean, prefilledUrl?: string): Promise<void>;
/**
 * Interactive Info Flow
 */
export declare function interactiveInfo(ytdlp: YtDlp, prefilledUrl?: string): Promise<void>;
/**
 * Main interactive mode menu.
 */
export declare function runInteractive(): Promise<void>;
