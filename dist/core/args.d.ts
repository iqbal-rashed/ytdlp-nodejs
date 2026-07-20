import { ArgsOptions } from '../types';
export type BuildArgsOptions = {
    url?: string;
    options?: ArgsOptions;
    ffmpegPath?: string;
    withProgressTemplate?: boolean;
    extra?: string[];
};
export declare function buildYtDlpArgs({ url, options, ffmpegPath, withProgressTemplate, extra, }: BuildArgsOptions): string[];
