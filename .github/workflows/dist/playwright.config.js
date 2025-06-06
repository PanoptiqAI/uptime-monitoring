"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// playwright.config.ts
var playwright_config_exports = {};
__export(playwright_config_exports, {
  default: () => playwright_config_default
});
module.exports = __toCommonJS(playwright_config_exports);
var import_test = require("@playwright/test");
var playwright_config_default = (0, import_test.defineConfig)({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 0,
  /* Limit workers on CI to avoid overwhelming servers */
  workers: process.env.CI ? 1 : void 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
    ["playwright-ctrf-json-reporter"]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Take screenshot on failure */
    screenshot: "only-on-failure",
    /* Viewport size */
    viewport: { width: 1280, height: 720 }
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...import_test.devices["Desktop Chrome"] }
    }
  ],
  /* Set timeout for each test - higher for CI due to single worker */
  timeout: process.env.CI ? 90 * 1e3 : 30 * 1e3,
  /* Set global timeout for the whole test run */
  globalTimeout: process.env.CI ? 10 * 60 * 1e3 : 5 * 60 * 1e3,
  /* Set expect timeout */
  expect: {
    timeout: 10 * 1e3
  }
});
