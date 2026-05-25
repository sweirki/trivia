import { addCrashBreadcrumb, captureError, type CrashContext } from "./crashReporting";
import { trackEvent, type AnalyticsProperties } from "./analytics";

export type SyncDiagnosticStatus =
  | "started"
  | "skipped"
  | "succeeded"
  | "failed"
  | "merged_local"
  | "merged_cloud";

export type SyncDiagnosticPayload = {
  area: "player" | "auth" | "daily" | "arena" | "purchase";
  status: SyncDiagnosticStatus;
  userId?: string | null;
  localVersion?: number;
  cloudVersion?: number;
  reason?: string;
  queueSize?: number;
  durationMs?: number;
};

function sanitizePayload(payload: SyncDiagnosticPayload): AnalyticsProperties {
  return {
    area: payload.area,
    status: payload.status,
    userId: payload.userId ?? null,
    localVersion: payload.localVersion,
    cloudVersion: payload.cloudVersion,
    reason: payload.reason,
    queueSize: payload.queueSize,
    durationMs: payload.durationMs,
  };
}

export async function recordSyncDiagnostic(payload: SyncDiagnosticPayload) {
  const properties = sanitizePayload(payload);

  await addCrashBreadcrumb(`sync.${payload.area}.${payload.status}`, properties as CrashContext);
  await trackEvent("sync_state_changed", properties);
}

export async function recordSyncFailure(
  error: unknown,
  payload: Omit<SyncDiagnosticPayload, "status">
) {
  await recordSyncDiagnostic({ ...payload, status: "failed" });
  await captureError(error, {
    area: payload.area,
    reason: payload.reason,
    userId: payload.userId ?? null,
    localVersion: payload.localVersion,
    cloudVersion: payload.cloudVersion,
  });
}


