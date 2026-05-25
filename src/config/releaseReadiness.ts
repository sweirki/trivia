// src/config/releaseReadiness.ts
// Phase 12: release-hardening checks kept pure so they are safe in Jest, CI, and app startup.

export type ReleaseEnvironmentName = "development" | "preview" | "production";

export type ReleaseCheckSeverity = "error" | "warning";

export type ReleaseCheckIssue = {
  id: string;
  severity: ReleaseCheckSeverity;
  message: string;
};

export type ReleaseReadinessInput = {
  environment: ReleaseEnvironmentName;
  appName?: string | null;
  slug?: string | null;
  version?: string | null;
  iosBuildNumber?: string | null;
  androidVersionCode?: number | null;
  projectId?: string | null;
  sentryDsn?: string | null;
  revenueCatAppleKey?: string | null;
  revenueCatGoogleKey?: string | null;
  nativeSentryPluginEnabled?: boolean;
};

export type ReleaseReadinessReport = {
  environment: ReleaseEnvironmentName;
  ready: boolean;
  blockingIssueCount: number;
  warningCount: number;
  issues: ReleaseCheckIssue[];
};

function isPresent(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
}

function addIssue(
  issues: ReleaseCheckIssue[],
  severity: ReleaseCheckSeverity,
  id: string,
  message: string
) {
  issues.push({ id, severity, message });
}

export function evaluateReleaseReadiness(
  input: ReleaseReadinessInput
): ReleaseReadinessReport {
  const issues: ReleaseCheckIssue[] = [];

  if (!isPresent(input.appName)) {
    addIssue(issues, "error", "app-name-missing", "App name is required before release.");
  }

  if (!isPresent(input.slug)) {
    addIssue(issues, "error", "slug-missing", "Expo slug is required before release.");
  }

  if (!isPresent(input.version)) {
    addIssue(issues, "error", "version-missing", "App version is required before release.");
  }

  if (!isPresent(input.projectId)) {
    addIssue(issues, "error", "eas-project-missing", "EAS projectId is required for release builds.");
  }

  if (input.androidVersionCode == null || input.androidVersionCode < 1) {
    addIssue(issues, "error", "android-version-code-invalid", "Android versionCode must be a positive number.");
  }

  if (!isPresent(input.iosBuildNumber)) {
    addIssue(issues, "error", "ios-build-number-missing", "iOS buildNumber is required before release.");
  }

  if (input.nativeSentryPluginEnabled) {
    addIssue(
      issues,
      "error",
      "native-sentry-plugin-enabled",
      "Native Sentry plugin is intentionally paused; keep app config plugins limited to expo-router."
    );
  }

  if (input.environment === "production") {
    if (!isPresent(input.sentryDsn)) {
      addIssue(
        issues,
        "warning",
        "sentry-dsn-missing",
        "Production crash reporting DSN is missing; release can proceed only if this is intentional."
      );
    }

    if (!isPresent(input.revenueCatAppleKey) && !isPresent(input.revenueCatGoogleKey)) {
      addIssue(
        issues,
        "warning",
        "revenuecat-keys-missing",
        "RevenueCat production keys are missing; monetization should remain paused."
      );
    }
  }

  const blockingIssueCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return {
    environment: input.environment,
    ready: blockingIssueCount === 0,
    blockingIssueCount,
    warningCount,
    issues,
  };
}

export function summarizeReleaseReadiness(report: ReleaseReadinessReport) {
  if (report.ready && report.warningCount === 0) {
    return `${report.environment} release checks passed.`;
  }

  if (report.ready) {
    return `${report.environment} release checks passed with ${report.warningCount} warning(s).`;
  }

  return `${report.environment} release checks blocked by ${report.blockingIssueCount} issue(s).`;
}


