import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';


export default defineConfig([
  { files: ['**/*.{js,mjs,cjs}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.browser } },
  {
    rules: {
      semi: [2, 'always'],
      quotes: [2, 'single', {
        allowTemplateLiterals: true,
      }],
      indent: [2, 2, {
        SwitchCase: 1,
      }],
      'comma-dangle': [2, 'always-multiline'],
    },
  },
  // prevent undefined variable errors
  {
    files: ['src/main.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
        MAIN_WINDOW_VITE_DEV_SERVER_URL: 'readonly',
        MAIN_WINDOW_VITE_NAME: 'readonly',
      },
    },
  },
]);
