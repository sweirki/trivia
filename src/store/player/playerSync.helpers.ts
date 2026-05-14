// src/store/player/playerSync.helpers.ts
// Phase 5A helper extraction: isolated persistence/sync helpers.

export type SyncMeta = {
  revision?: number;
  updatedAt?: number;
};

export function pickNewestRevision<T extends SyncMeta>(
  localValue: T | null | undefined,
  cloudValue: T | null | undefined
): T | null | undefined {
  if (!localValue) return cloudValue;
  if (!cloudValue) return localValue;

  const localRevision = localValue.revision ?? 0;
  const cloudRevision = cloudValue.revision ?? 0;

  if (localRevision > cloudRevision) return localValue;
  if (cloudRevision > localRevision) return cloudValue;

  const localUpdated = localValue.updatedAt ?? 0;
  const cloudUpdated = cloudValue.updatedAt ?? 0;

  return localUpdated >= cloudUpdated ? localValue : cloudValue;
}

export function nextRevision(current?: number): number {
  return (current ?? 0) + 1;
}

export function buildSyncDiagnostic(area: string, detail: string) {
  return {
    area,
    detail,
    timestamp: Date.now(),
  };
}