import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';


export default defineConfig([
  globalIgnores(['.vite/*']),
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
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
]);
