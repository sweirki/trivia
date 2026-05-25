import Constants from "expo-constants";

import type { CrashContext, CrashProvider } from "../crashReporting";

type SentryUser = {
  id?: string;
};

type SentryModule = {
  init: (options: {
    dsn: string;
    environment?: string;
    enabled?: boolean;
    tracesSampleRate?: number;
    release?: string;
    dist?: string;
  }) => void;
  captureException: (error: unknown, context?: { extra?: CrashContext }) => void;
  setUser: (user: SentryUser | null) => void;
  addBreadcrumb: (breadcrumb: {
    message: string;
    category?: string;
    data?: CrashContext;
  }) => void;
};

function getExtraValue(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const value = extra?.[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getSentryDsn() {
  return (
    process.env.EXPO_PUBLIC_SENTRY_DSN ??
    getExtraValue("sentryDsn") ??
    getExtraValue("SENTRY_DSN")
  );
}

function loadSentry(): SentryModule | null {
  try {
    // Loaded lazily so local/test builds keep working until @sentry/react-native
    // is installed and configured for production builds.
    return require("@sentry/react-native") as SentryModule;
  } catch {
    return null;
  }
}

let initialized = false;

export function createSentryCrashProvider(): CrashProvider | null {
  const dsn = getSentryDsn();
  const sentry = loadSentry();

  if (!dsn || !sentry) {
    return null;
  }

  if (!initialized) {
    sentry.init({
      dsn,
      environment: process.env.EXPO_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
      enabled: process.env.NODE_ENV !== "test",
      tracesSampleRate: Number(process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0),
      release: Constants.expoConfig?.version,
      dist: String((Constants.expoConfig as any)?.android?.versionCode ?? (Constants.expoConfig as any)?.ios?.buildNumber ?? "dev"),
    });
    initialized = true;
  }

  return {
    captureError(error: unknown, context: CrashContext = {}) {
      sentry.captureException(error, { extra: context });
    },

    setUser(userId: string | null) {
      sentry.setUser(userId ? { id: userId } : null);
    },

    addBreadcrumb(message: string, context: CrashContext = {}) {
      sentry.addBreadcrumb({
        category: "app",
        message,
        data: context,
      });
    },
  };
}


