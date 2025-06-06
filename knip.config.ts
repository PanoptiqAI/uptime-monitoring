import type { KnipConfig } from 'knip';

// Root knip configuration that applies to all packages
const config: KnipConfig = {
  // These are likely generated files or configuration files that should be ignored
  ignoreExportsUsedInFile: true,
  // Performance optimization: cache results
  cacheLocation: '.turbo/knip',
  entry: [
    // Main entry points
    'index.ts',
    'main.ts',
    'components/**/*.ts',
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
    // Performance optimization: exclude more build artifacts
    '!**/.turbo/**/*',
    '!**/dist/**/*',
    '!**/build/**/*',
    '!**/coverage/**/*',
  ],
  ignoreDependencies: [
    // Workspace dependencies
    '@panoptiq/tsconfig',

    // Build tools and utilities
    'concurrently',
    'ts-node',
    'knip',
    '@manypkg/find-root',
    'lodash',
    '@types/lodash',
    'parse-domain',
    'vercel',
    'convex',
    'lefthook',
    'yaml',
  ],
  ignoreBinaries: [
    // Common CLI tools
    'read',
    'open',
    'rimraf',
    'playwright',
    'only-allow',
    'vite',
    'tsc',
    'knip',
    'concurrently',
    'biome',
  ],
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
