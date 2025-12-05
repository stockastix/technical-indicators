import typescriptEslint from '@typescript-eslint/eslint-plugin';
import _import from 'eslint-plugin-import';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // ignore eslint airbnb until this issue is solved
  // https://github.com/airbnb/javascript/issues/2961
  ...compat.extends(/* "airbnb-base", */ 'prettier'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: fixupPluginRules(_import),
    },

    // for some reason, does not exclude coverage/
    files: ['src/**/*.ts'],
    // ineffective! I have to --ignore-pattern from CLI
    ignores: ['coverage/*'],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        NodeJS: true,
      },

      parser: tsParser,
      ecmaVersion: 13,
      sourceType: 'module',
    },

    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },

    rules: {
      'import/no-unresolved': 'off',

      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          json: 'never',
          // ts: 'never',
        },
      ],

      'no-cond-assign': [2, 'except-parens'],
      'no-return-assign': [2, 'except-parens'],
    },
  },
];
