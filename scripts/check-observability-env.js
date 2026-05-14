const requiredForProduction = [
  "EXPO_PUBLIC_SENTRY_DSN",
];

const optional = [
  "EXPO_PUBLIC_APP_ENV",
  "EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE",
];

const missing = requiredForProduction.filter((key) => !process.env[key]);

if (missing.length) {
  console.warn(`[observability] Missing production env vars: ${missing.join(", ")}`);
  console.warn("[observability] App will still run, but crash events will not be sent to Sentry.");
} else {
  console.log("[observability] Required production env vars are present.");
}

for (const key of optional) {
  console.log(`[observability] ${key}=${process.env[key] ?? "(not set)"}`);
}
