export declare function downloadYtDlp(out?: string): Promise<string>;
export declare function downloadYtDlpVerified(out?: string): Promise<{
    path: string;
    verified: boolean;
    checksum?: string;
}>;
export declare function findYtdlpBinary(): any;
