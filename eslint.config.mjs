import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nx from '@nx/eslint-plugin';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/src/generated/**', '**/node_modules/**', '.nx/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@nx': nx },
    rules: {
      '@nx/enforce-module-boundaries': ['error', {
        enforceBuildableLibDependency: true,
        depConstraints: [
          { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
          ...['gateway', 'identity', 'kitchen'].map(scope => ({ sourceTag: `scope:${scope}`, onlyDependOnLibsWithTags: ['scope:shared'] })),
          { sourceTag: 'scope:web', onlyDependOnLibsWithTags: ['type:contracts'] },
        ],
      }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  { files: ['**/*.mjs'], languageOptions: { globals: { process: 'readonly', console: 'readonly', fetch: 'readonly', URL: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', AbortSignal: 'readonly', structuredClone: 'readonly' } } },
);
