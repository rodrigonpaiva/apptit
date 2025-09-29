import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let nextPlugin = null;
try {
  nextPlugin = require('@next/eslint-plugin-next');
} catch (error) {
  console.warn('[@apptit] @next/eslint-plugin-next not installed; Next.js specific lint rules disabled.');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [, eslintRecommendedRules, tsTypeCheckedRules] =
  tsPlugin.configs['flat/recommended-type-checked'];

const baseTsRuleSet = {
  ...js.configs.recommended.rules,
  ...(eslintRecommendedRules?.rules ?? {}),
  ...(tsTypeCheckedRules?.rules ?? {})
};

const nodeGlobals = {
  require: 'readonly',
  module: 'readonly',
  process: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  console: 'readonly'
};

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'node_modules',
      'dist',
      '**/dist/**',
      '.next',
      '**/.next/**',
      'coverage',
      'test-output',
      'tmp',
      '**/generated/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.base.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      ...(nextPlugin ? { next: nextPlugin } : {})
    },
    rules: {
      ...baseTsRuleSet,
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error'
    }
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        ...(js.configs.recommended.languageOptions?.globals ?? {}),
        ...nodeGlobals
      }
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  ...(nextPlugin
    ? [
        {
          files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
          plugins: { next: nextPlugin },
          rules: {
            ...nextPlugin.configs.recommended.rules
          }
        }
      ]
    : [])
];
