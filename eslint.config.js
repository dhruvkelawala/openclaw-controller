const { defineConfig } = require('eslint/config');
const globals = require('globals');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier');

module.exports = defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    // Config files use CommonJS
    files: ['*.config.js', 'metro.config.js', 'index.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);