import { spawn } from 'child_process';
import { PassThrough } from 'stream';
import { stringToProgress } from '../utils/progress';
import { VideoProgress } from '../types';
import { YtDlpError } from './errors';
import { detectYtDlpHint } from './hints';

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
  parseStdoutProgress?: boolean;
  parseStderrProgress?: boolean;
};

export type SpawnYtDlpOptions = {
  emitProgress?: boolean;
  parseStdoutProgress?: boolean;
  parseStderrProgress?: boolean;
};

function emitProgress(
  data: string,
  onProgress?: (progress: VideoProgress) => void,
  emit?: (progress: VideoProgress) => void
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
  options: SpawnYtDlpOptions = {}
) {
  const child = spawn(binaryPath, args, { shell: false });
  const parseStdoutProgress =
    options.parseStdoutProgress !== false && options.emitProgress !== false;
  const parseStderrProgress =
    options.parseStderrProgress !== false && options.emitProgress !== false;

  if (parseStdoutProgress) {
    child.stdout.on('data', (data) => {
      emitProgress(data.toString(), undefined, (progress) =>
        child.emit('progress', progress)
      );
    });
  }

  if (parseStderrProgress) {
    child.stderr.on('data', (data) => {
      emitProgress(data.toString(), undefined, (progress) =>
        child.emit('progress', progress)
      );
    });
  }

  return child;
}

export function runYtDlp(
  binaryPath: string,
  args: string[],
  options: RunYtDlpOptions = {}
): Promise<RunYtDlpResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args, { shell: false });
    let stdout = '';
    let stderr = '';
    const parseStdoutProgress =
      options.parseStdoutProgress !== false && !options.passThrough;
    const parseStderrProgress = options.parseStderrProgress !== false;

    if (options.passThrough) {
      child.stdout.pipe(options.passThrough);
    }

    child.stdout.on('data', (data) => {
      if (options.passThrough) return;
      const text = data.toString();
      stdout += text;
      options.onStdout?.(text);
      if (parseStdoutProgress) {
        emitProgress(text, options.onProgress);
      }
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      options.onStderr?.(text);
      if (parseStderrProgress) {
        emitProgress(text, options.onProgress);
      }
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
          })
        );
      }
    });

    child.on('error', (err) => {
      reject(
        new YtDlpError(`Failed to start yt-dlp process: ${err.message}`, {
          args,
        })
      );
    });
  });
}
