import { initializeAnalytics } from "./analytics";
import { initializeCrashReporting } from "./crashReporting";
import { createFirebaseAnalyticsProvider } from "./providers/firebaseAnalyticsProvider";
import { createSentryCrashProvider } from "./providers/sentryCrashProvider";

let configured = false;

export function setupProductionObservability() {
  if (configured) return;

  initializeAnalytics(createFirebaseAnalyticsProvider());
  initializeCrashReporting(createSentryCrashProvider());

  configured = true;
}
