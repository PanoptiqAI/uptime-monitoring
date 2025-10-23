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
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 3,
  workers: 2,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
    ["playwright-ctrf-json-reporter"]
  ],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: process.env.IGNORE_HTTPS_ERRORS === "true",
    navigationTimeout: 60 * 1e3,
    actionTimeout: 30 * 1e3
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...import_test.devices["Desktop Chrome"],
        // Disable GPU to avoid issues with missing hardware acceleration on CI
        launchOptions: {
          args: [
            "--disable-gpu",
            "--disable-gpu-rasterization",
            "--disable-gpu-compositing",
            "--disable-software-rasterizer"
          ]
        }
      }
    }
  ],
  timeout: 60 * 1e3,
  globalTimeout: 10 * 60 * 1e3,
  expect: {
    timeout: 15 * 1e3
  },
  maxFailures: 5
});
