import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: true,
    splitting: false,
    clean: true,
    minify: true,
    shims: true,
  },
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: false,
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
    outDir: 'dist/scripts',
  },
  {
    entry: ['src/cli/index.ts'],
    format: ['cjs'],
    splitting: false,
    clean: true,
    minify: true,
    shims: true,
    outDir: 'dist/cli',
    external: ['../index', '..', /^[a-z@]/], // Don't bundle node_modules or main library
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
