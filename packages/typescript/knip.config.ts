import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    // No entry points needed for a config-only package
  ],
  project: ['**/*.{json}'],
  ignoreDependencies: [
    // Build tools
    'concurrently',
  ],
  ignoreBinaries: ['knip', 'concurrently', 'biome'],
  rules: {
    // Critical rules that should cause builds to fail
    unlisted: 'error', // Fail on unlisted dependencies
    binaries: 'error', // Fail on unlisted binary dependencies
    files: 'error', // Fail on unused files

    // Less critical rules that can be warnings
    duplicates: 'warn',
    exports: 'warn',
    enumMembers: 'warn',
    dependencies: 'warn', // Make unused deps a warning rather than error
  },
};

export default config;
