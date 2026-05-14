#!/usr/bin/env node
/* Phase 12 release hardening check.
 * This script intentionally avoids importing Expo config so it can run in plain Node/CI.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`✓ ${message}`);
}

function warn(message) {
  console.warn(`⚠ ${message}`);
}

const appConfig = read("app.config.js");
const easConfig = JSON.parse(read("eas.json"));
const packageJson = JSON.parse(read("package.json"));

const requiredScripts = [
  "typecheck",
  "lint",
  "test",
  "e2e:maestro",
  "observability:check",
];

for (const scriptName of requiredScripts) {
  if (packageJson.scripts && packageJson.scripts[scriptName]) {
    pass(`script:${scriptName}`);
  } else {
    fail(`Missing package script: ${scriptName}`);
  }
}

if (/plugins:\s*\[\s*["']expo-router["']\s*\]/.test(appConfig)) {
  pass("native plugins remain limited to expo-router");
} else {
  fail("app.config.js plugins should remain [\"expo-router\"] while native Sentry is paused");
}

if (/projectId:\s*["'][^"']+["']/.test(appConfig)) {
  pass("EAS projectId configured");
} else {
  fail("Missing extra.eas.projectId in app.config.js");
}

if (/versionCode:\s*\d+/.test(appConfig)) {
  pass("Android versionCode configured");
} else {
  fail("Missing android.versionCode");
}

if (/buildNumber:\s*["'][^"']+["']/.test(appConfig)) {
  pass("iOS buildNumber configured");
} else {
  fail("Missing ios.buildNumber");
}

if (easConfig.build && easConfig.build.preview && easConfig.build.production) {
  pass("EAS preview and production profiles configured");
} else {
  fail("EAS preview/production build profiles are required");
}

if (!process.env.EXPO_PUBLIC_SENTRY_DSN) {
  warn("EXPO_PUBLIC_SENTRY_DSN is not set; crash reporting remains guarded/no-op.");
}

if (!process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY && !process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY) {
  warn("RevenueCat production keys are not set; monetization should remain paused.");
}

if (process.exitCode) {
  console.error("\nRelease hardening checks failed.");
} else {
  console.log("\nRelease hardening checks passed.");
}
