import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['tests/**/*.spec.ts', 'playwright.config.ts'],
  playwright: {
    config: ['playwright.config.ts'],
  },
  ignore: ['playwright-report/**', 'test-results/**'],
  ignoreDependencies: ['concurrently'],
  ignoreBinaries: ['biome', 'knip', 'tsc', 'concurrently', 'playwright'],
};

export default config;
