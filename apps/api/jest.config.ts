import type { Config } from 'jest';
import { createRequire } from 'node:module';
import { pathsToModuleNameMapper } from 'ts-jest';

const require = createRequire(import.meta.url);
const { compilerOptions } = require('../../tsconfig.base.json') as {
  compilerOptions?: {
    paths?: Record<string, string[]>;
  };
};
const paths = compilerOptions?.paths ?? {};

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  watchman: false,
  passWithNoTests: true,
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/apps/api/tsconfig.spec.json'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/apps/.*/dist/'],
  rootDir: '../../',
  testMatch: [
    '<rootDir>/apps/api/src/**/*.spec.ts',
    '<rootDir>/apps/api/src/**/*.test.ts'
  ],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(paths, {
      prefix: '<rootDir>/'
    }),
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};

export default config;
