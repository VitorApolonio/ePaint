import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  globalIgnores(['.vite/*']),
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], plugins: { tseslint }, extends: [tseslint.configs.strict] },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], languageOptions: { globals: globals.browser } },
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
);
