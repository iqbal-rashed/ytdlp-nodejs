import { PassThrough } from 'stream';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { runYtDlp } from '../src/core/runner';

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

type MockChildProcess = EventEmitter & {
  stdout: PassThrough;
  stderr: PassThrough;
};

describe('runner', () => {
  test('collects stdout and enforces shell:false', async () => {
    const spawnMock = spawn as jest.Mock;
    spawnMock.mockImplementation(() => {
      const child = new EventEmitter() as MockChildProcess;
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();

      process.nextTick(() => {
        child.stdout.write('hello');
        child.stdout.end();
        child.stderr.end();
        child.emit('close', 0);
      });
      return child;
    });

    const result = await runYtDlp('/bin/yt-dlp', ['--version']);
    expect(result.stdout).toBe('hello');
    expect(spawnMock).toHaveBeenCalledWith('/bin/yt-dlp', ['--version'], {
      shell: false,
    });
  });

  test('throws when process exits non-zero', async () => {
    const spawnMock = spawn as jest.Mock;
    spawnMock.mockImplementation(() => {
      const child = new EventEmitter() as MockChildProcess;
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();

      process.nextTick(() => {
        child.stderr.write('boom');
        child.stderr.end();
        child.emit('close', 1);
      });
      return child;
    });

    await expect(runYtDlp('/bin/yt-dlp', ['--bad'])).rejects.toThrow(
      'yt-dlp exited with code 1',
    );
  });
});
