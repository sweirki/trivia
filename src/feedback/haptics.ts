import * as Haptics from "expo-haptics";

import { isVibrationEnabled } from "@/store/useSettingsStore";

type HapticChannel = "tap" | "impact" | "notification";

const lastHapticAt: Record<HapticChannel, number> = {
  tap: 0,
  impact: 0,
  notification: 0,
};

const MIN_GAP_MS: Record<HapticChannel, number> = {
  tap: 30,
  impact: 35,
  notification: 0,
};

async function guarded(channel: HapticChannel, run: () => Promise<void>) {
  try {
    if (!isVibrationEnabled()) return;

    const now = Date.now();
    if (now - lastHapticAt[channel] < MIN_GAP_MS[channel]) return;

    lastHapticAt[channel] = now;
    await run();
  } catch {
    // Haptics are optional and should never crash the app.
  }
}

export function hapticTap() {
  return guarded("tap", () => Haptics.selectionAsync());
}

export function hapticLight() {
  return guarded("impact", () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticMedium() {
  return guarded("impact", () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function hapticHeavy() {
  return guarded("impact", () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
}

export function hapticSuccess() {
  return guarded("notification", () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  );
}

export function hapticWarning() {
  return guarded("notification", () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  );
}

export function hapticError() {
  return guarded("notification", () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  );
}


