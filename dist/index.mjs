import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mod = require('./index.js');

export const BIN_DIR = mod.BIN_DIR;
export const Download = mod.Download;
export const createDownload = mod.createDownload;
export const Stream = mod.Stream;
export const createStreamBuilder = mod.createStreamBuilder;
export const Exec = mod.Exec;
export const createExec = mod.createExec;
export const YtDlp = mod.YtDlp;
export const helpers = mod.helpers;

export default mod;
