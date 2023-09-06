import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  // setupFilesAfterEnv: ['./tests/bootstrap.ts'],

  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '.*.test.ts$',
  coverageDirectory: './tests/coverage',
  collectCoverageFrom: ['_src/controllers/*.ts', '_src/services/*.ts', '_src/utils/*.ts', '_src/views/*.ts'],
  coveragePathIgnorePatterns: ['_src/utils/set-project-root.util.ts'],
  testEnvironment: 'node',
};
export default config;
