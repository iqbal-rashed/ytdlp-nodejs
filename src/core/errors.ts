export type YtDlpErrorDetails = {
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  args?: string[];
  hint?: string;
};

export class YtDlpError extends Error {
  public readonly exitCode?: number;
  public readonly stdout?: string;
  public readonly stderr?: string;
  public readonly args?: string[];
  public readonly hint?: string;

  constructor(message: string, details: YtDlpErrorDetails = {}) {
    super(message);
    this.name = 'YtDlpError';
    this.exitCode = details.exitCode;
    this.stdout = details.stdout;
    this.stderr = details.stderr;
    this.args = details.args;
    this.hint = details.hint;
  }
}
