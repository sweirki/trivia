import {
  initializeAnalytics,
  initializeCrashReporting,
  setAnalyticsEnabled,
  setCrashReportingEnabled,
  trackEvent,
  captureError,
  setAnalyticsUserId,
} from "@/observability";

describe("observability", () => {
  afterEach(() => {
    initializeAnalytics(null);
    initializeCrashReporting(null);
    setAnalyticsEnabled(true);
    setCrashReportingEnabled(true);
  });

  it("does not throw when analytics provider is missing", async () => {
    await expect(trackEvent("app_opened")).resolves.toBeUndefined();
  });

  it("does not throw when crash provider is missing", async () => {
    await expect(captureError(new Error("test"), { screen: "unit" })).resolves.toBeUndefined();
  });

  it("routes events to an installed analytics provider", async () => {
    const track = jest.fn();

    initializeAnalytics({
      trackEvent: track,
    });

    await trackEvent("game_started", { mode: "classic" });

    expect(track).toHaveBeenCalledWith("game_started", {
      mode: "classic",
      userId: null,
    });
  });


  it("routes crash context to an installed crash provider", async () => {
    const capture = jest.fn();

    initializeCrashReporting({
      captureError: capture,
    });

    await captureError("boom", { screen: "unit", ignored: { nested: true } as never });

    expect(capture).toHaveBeenCalledWith(expect.any(Error), {
      screen: "unit",
      userId: null,
    });
  });

  it("updates the analytics provider user id", async () => {
    const setUserIdMock = jest.fn();

    initializeAnalytics({
      trackEvent: jest.fn(),
      setUserId: setUserIdMock,
    });

    await setAnalyticsUserId("user-123");

    expect(setUserIdMock).toHaveBeenCalledWith("user-123");
  });


  it("records sync diagnostics as analytics events and breadcrumbs", async () => {
    const track = jest.fn();
    const breadcrumb = jest.fn();

    initializeAnalytics({
      trackEvent: track,
    });

    initializeCrashReporting({
      captureError: jest.fn(),
      addBreadcrumb: breadcrumb,
    });

    const { recordSyncDiagnostic } = require("@/observability");

    await recordSyncDiagnostic({
      area: "player",
      status: "succeeded",
      userId: "user-123",
      localVersion: 7,
      queueSize: 0,
    });

    expect(track).toHaveBeenCalledWith("sync_state_changed", expect.objectContaining({
      area: "player",
      status: "succeeded",
      userId: "user-123",
      localVersion: 7,
      queueSize: 0,
    }));
    expect(breadcrumb).toHaveBeenCalledWith("sync.player.succeeded", expect.objectContaining({
      area: "player",
      status: "succeeded",
    }));
  });

});


