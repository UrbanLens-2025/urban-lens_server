import type { Config } from 'jest';

const config: Config = {
  rootDir: '../..',
  testMatch: ['**/testing/integration/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  // Make @/ import alias work in tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  setupFiles: ['ts-node/register', 'tsconfig-paths/register'],
};

export default config;
