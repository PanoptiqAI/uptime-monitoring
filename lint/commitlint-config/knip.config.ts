import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    // Main entry points
    'index.js',
    // Config files
    '*.config.{js,ts}',
  ],
  project: [
    '**/*.{js,ts,tsx}',
    // Exclude tests
    '!**/*.{test,spec}.{js,ts,tsx}',
    '!**/__tests__/**/*',
    '!**/__mocks__/**/*',
    // Exclude generated files
    '!**/*.generated.{js,ts,tsx}',
  ],
  ignoreDependencies: [
    // Commitlint dependencies
    '@commitlint/config-conventional',
    '@commitlint/lint',
    '@commitlint/load',
    '@commitlint/types',

    // Build tools
    'concurrently',
  ],
  ignoreBinaries: ['commitlint', 'knip', 'tsc', 'concurrently', 'biome'],
  rules: {
    // Critical rules that should cause builds to fail
    unlisted: 'error', // Fail on unlisted dependencies
    binaries: 'error', // Fail on unlisted binary dependencies

    // Less critical rules that can be warnings
    files: 'warn',
    duplicates: 'warn',
    exports: 'off', // Turn off exports warnings
    enumMembers: 'warn',
    dependencies: 'warn', // Make unused deps a warning rather than error
  },
};

export default config;
