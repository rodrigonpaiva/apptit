/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: '../../',
  watchman: false,
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        sourceMaps: 'inline',
        module: {
          type: 'es6'
        },
        jsc: {
          target: 'es2022',
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: true
          },
          transform: {
            decoratorMetadata: true
          }
        }
      }
    ]
  },
  testMatch: ['<rootDir>/apps/api-e2e/src/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  modulePathIgnorePatterns: [
    '<rootDir>/apps/api/dist/',
    '<rootDir>/dist/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/'
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/apps/api/dist/',
    '<rootDir>/dist/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
