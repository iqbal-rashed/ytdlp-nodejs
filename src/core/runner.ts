import { spawn } from 'child_process';
import { PassThrough } from 'stream';
import { stringToProgress } from '../utils/progress';
import { DownloadedVideoInfo, VideoProgress } from '../types';
import { YtDlpError } from './errors';
import { detectYtDlpHint } from './hints';
import { parsePrintedOutput, parsePrintedVideoInfo } from './parsers/paths';

export type RunYtDlpResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

export type RunYtDlpOptions = {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  onProgress?: (progress: VideoProgress) => void;
  passThrough?: PassThrough;
  debugPrintCommandLine?: boolean;
};

export type SpawnYtDlpOptions = {
  debugPrintCommandLine?: boolean;
};

function emitProgress(
  data: string,
  onProgress?: (progress: VideoProgress) => void,
  emit?: (progress: VideoProgress) => void,
) {
  const progress = stringToProgress(data);
  if (progress) {
    onProgress?.(progress);
    emit?.(progress);
  }
}

export function spawnYtDlp(
  binaryPath: string,
  args: string[],
  options: SpawnYtDlpOptions = {},
) {
  if (options.debugPrintCommandLine) {
    console.error(`[ytdlp-nodejs] Command: ${binaryPath} ${args.join(' ')}`);
  }
  const child = spawn(binaryPath, args, { shell: false });
  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    const text = Buffer.from(data).toString();
    stdout += text;
    emitProgress(text, undefined, (progress) =>
      child.emit('progress', progress),
    );
  });

  child.stderr.on('data', (data) => {
    const text = Buffer.from(data).toString();
    stderr += text;
    emitProgress(text, undefined, (progress) =>
      child.emit('progress', progress),
    );
  });

  child.on('close', () => {
    const newOutput = parsePrintedOutput(stdout);
    const info = parsePrintedVideoInfo(stdout) as DownloadedVideoInfo | null;

    child.emit('finish', {
      output: newOutput,
      filePath: info?.filepath ?? '',
      info,
      stderr,
    });
  });

  return child;
}

export function runYtDlp(
  binaryPath: string,
  args: string[],
  options: RunYtDlpOptions = {},
): Promise<RunYtDlpResult> {
  return new Promise((resolve, reject) => {
    if (options.debugPrintCommandLine) {
      console.error(`[ytdlp-nodejs] Command: ${binaryPath} ${args.join(' ')}`);
    }
    const child = spawn(binaryPath, args, { shell: false });
    let stdout = '';
    let stderr = '';
    if (options.passThrough) {
      child.stdout.pipe(options.passThrough);
    }

    child.stdout.on('data', (data) => {
      if (options.passThrough) return;
      const text = Buffer.from(data).toString();
      stdout += text;
      options.onStdout?.(text);
      emitProgress(text, options.onProgress);
    });

    child.stderr.on('data', (data) => {
      const text = Buffer.from(data).toString();
      stderr += text;
      options.onStderr?.(text);
      emitProgress(text, options.onProgress);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        const hint = detectYtDlpHint(stderr);
        reject(
          new YtDlpError(`yt-dlp exited with code ${code}: ${stderr}`, {
            exitCode: code ?? undefined,
            stdout,
            stderr,
            args,
            hint,
          }),
        );
      }
    });

    child.on('error', (err) => {
      reject(
        new YtDlpError(`Failed to start yt-dlp process: ${err.message}`, {
          args,
        }),
      );
    });
  });
}
