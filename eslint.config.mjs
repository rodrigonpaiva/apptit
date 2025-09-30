import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextFiles = ['apps/web/**/*.{ts,tsx,js,jsx}'];
const nextRecommended = {
  ...nextPlugin.flatConfig.recommended,
  files: nextFiles
};
const nextCoreWebVitals = {
  ...nextPlugin.flatConfig.coreWebVitals,
  files: nextFiles
};

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
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
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.base.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommendedTypeChecked.rules,
      'no-unused-vars': 'off',
      'import/order': ['warn', { 'newlines-between': 'always' }],
      'import/no-unresolved': 'off'
    },
    settings: {
      'import/resolver': {
        typescript: true
      }
    }
  },
  {
    ...nextRecommended,
    rules: {
      ...nextRecommended.rules,
      '@next/next/no-html-link-for-pages': 'off'
    }
  },
  {
    ...nextCoreWebVitals,
    rules: {
      ...nextCoreWebVitals.rules,
      '@next/next/no-html-link-for-pages': 'off'
    }
  },
  {
    files: ['apps/api-e2e/**/*.spec.ts'],
    plugins: {
      jest: jestPlugin
    },
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      ...(jestPlugin.configs.recommended?.rules ?? {})
    }
  }
);
