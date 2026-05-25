import {
  evaluateReleaseReadiness,
  summarizeReleaseReadiness,
} from "../config/releaseReadiness";

const baseInput = {
  environment: "production" as const,
  appName: "Trivia",
  slug: "trivia",
  version: "1.0.0",
  iosBuildNumber: "2",
  androidVersionCode: 2,
  projectId: "project-id",
  sentryDsn: "https://example@sentry.io/1",
  revenueCatAppleKey: "appl_key",
  revenueCatGoogleKey: "goog_key",
  nativeSentryPluginEnabled: false,
};

describe("releaseReadiness", () => {
  it("passes a complete production configuration", () => {
    const report = evaluateReleaseReadiness(baseInput);

    expect(report.ready).toBe(true);
    expect(report.blockingIssueCount).toBe(0);
    expect(report.warningCount).toBe(0);
    expect(summarizeReleaseReadiness(report)).toBe("production release checks passed.");
  });

  it("blocks invalid release metadata", () => {
    const report = evaluateReleaseReadiness({
      ...baseInput,
      slug: "",
      androidVersionCode: 0,
      projectId: null,
    });

    expect(report.ready).toBe(false);
    expect(report.issues.map((issue) => issue.id)).toEqual(
      expect.arrayContaining([
        "slug-missing",
        "android-version-code-invalid",
        "eas-project-missing",
      ])
    );
  });

  it("keeps the native Sentry plugin paused", () => {
    const report = evaluateReleaseReadiness({
      ...baseInput,
      nativeSentryPluginEnabled: true,
    });

    expect(report.ready).toBe(false);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "native-sentry-plugin-enabled",
          severity: "error",
        }),
      ])
    );
  });

  it("warns but does not block when production observability keys are intentionally absent", () => {
    const report = evaluateReleaseReadiness({
      ...baseInput,
      sentryDsn: "",
      revenueCatAppleKey: "",
      revenueCatGoogleKey: "",
    });

    expect(report.ready).toBe(true);
    expect(report.warningCount).toBe(2);
  });
});


