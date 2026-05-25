import type { DailyState } from "@/daily/types";
import { normalizeDaily } from "./player.normalizers";

export function readPlayerVersion(value: unknown) {
  const version = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : 0;
  return Math.max(0, version);
}

export function shouldUseCloudPlayerState(localVersion: unknown, cloudVersion: unknown) {
  return readPlayerVersion(cloudVersion) > readPlayerVersion(localVersion);
}

type DailyLike = Partial<DailyState> | null | undefined;

const asDailyLike = (daily: unknown): DailyLike => {
  if (daily && typeof daily === "object") return daily as Partial<DailyState>;
  return undefined;
};

export function pickNewestDaily(localDaily: unknown, cloudDaily: unknown) {
  const local = normalizeDaily(asDailyLike(localDaily));
  const cloud = normalizeDaily(asDailyLike(cloudDaily));

  if (!cloud.lastClaimDate) return local;
  if (!local.lastClaimDate) return cloud;

  if (cloud.lastClaimDate > local.lastClaimDate) return cloud;
  if (local.lastClaimDate > cloud.lastClaimDate) return local;

  return cloud.totalClaims >= local.totalClaims ? cloud : local;
}

export function dailyStatesEqual(localDaily: unknown, cloudDaily: unknown) {
  const local = normalizeDaily(asDailyLike(localDaily));
  const cloud = normalizeDaily(asDailyLike(cloudDaily));

  return (
    local.lastClaimDate === cloud.lastClaimDate &&
    local.streak === cloud.streak &&
    local.totalClaims === cloud.totalClaims
  );
}


