import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ignores: ['dist/**/*'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ignores: ['dist/**/*'],
    plugins: {
      js,
    },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ignores: ['dist/**/*'],
    extends: [tseslint.configs.recommended],
  },
]);
