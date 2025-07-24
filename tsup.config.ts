import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    clean: true,
    minify: true,
    shims: true,
  },
  {
    entry: ['src/scripts/downloadYtdlp.ts'],
    format: ['cjs'],
    splitting: false,
    clean: true,
    minify: true,
    shims: true,
  },
  {
    entry: ['src/utils/cli.ts'],
    format: ['cjs'],
    splitting: false,
    clean: true,
    minify: true,
    shims: true,
  },
]);
