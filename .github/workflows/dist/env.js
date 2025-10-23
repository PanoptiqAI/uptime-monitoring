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

// env.ts
var env_exports = {};
__export(env_exports, {
  env: () => env
});
module.exports = __toCommonJS(env_exports);
function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
function getOptionalEnv(key) {
  return process.env[key];
}
var env = {
  PANOPTIQ_LANDING_URL: getRequiredEnv("PANOPTIQ_LANDING_URL"),
  PANOPTIQ_LANDING_HEALTHZ_URL: getRequiredEnv("PANOPTIQ_LANDING_HEALTHZ_URL"),
  PANOPTIQ_STUDIO_URL: getRequiredEnv("PANOPTIQ_STUDIO_URL"),
  PANOPTIQ_STUDIO_HEALTHZ_URL: getRequiredEnv("PANOPTIQ_STUDIO_HEALTHZ_URL"),
  PANOPTIQ_STUDIO_EXPLORE_URL: getRequiredEnv("PANOPTIQ_STUDIO_EXPLORE_URL"),
  PANOPTIQ_STUDIO_ORG_URL: getRequiredEnv("PANOPTIQ_STUDIO_ORG_URL"),
  PANOPTIQ_STUDIO_USERS_URL: getRequiredEnv("PANOPTIQ_STUDIO_USERS_URL"),
  PANOPTIQ_CORE_API_HEALTHZ_URL: getRequiredEnv(
    "PANOPTIQ_CORE_API_HEALTHZ_URL"
  ),
  PANOPTIQ_STATUS_URL: getOptionalEnv("PANOPTIQ_STATUS_URL")
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  env
});
