import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type BoostType = "xp" | "coins";

type ActiveBoost = {
  multiplier: number;
  expiresAt: number;
};

type EntitlementState = {
  vipExpiresAt: number;
  vipTier: number;
  boosts: Partial<Record<BoostType, ActiveBoost>>;
  activateVIP: (durationMs: number, tier?: number) => void;
  setRevenueCatVIP: (isActive: boolean, expirationDate?: string | number | null) => void;
  activateDevVIP: (durationMs?: number) => boolean;
  activateBoost: (type: BoostType, multiplier: number, durationSeconds: number) => void;
  isVIPActive: () => boolean;
  getVIPTier: () => number;
  getActiveBoostMultiplier: (type: BoostType) => number;
  clearExpired: () => void;
  resetEntitlements: () => void;
};

const now = () => Date.now();

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set, get) => ({
      vipExpiresAt: 0,
      vipTier: 0,
      boosts: {},

      activateVIP: (durationMs, tier = 1) => {
        const currentExpiry = Math.max(get().vipExpiresAt || 0, now());
        const safeTier = Math.max(1, Math.min(1, Math.floor(tier || 1)));
        set({ vipExpiresAt: currentExpiry + Math.max(0, durationMs), vipTier: safeTier });
      },

      setRevenueCatVIP: (isActive, expirationDate) => {
        if (!isActive) {
          set({ vipExpiresAt: 0, vipTier: 0 });
          return;
        }

        const parsedExpiry =
          typeof expirationDate === "number"
            ? expirationDate
            : typeof expirationDate === "string"
              ? Date.parse(expirationDate)
              : NaN;

        const fallbackExpiry = now() + 31 * 24 * 60 * 60 * 1000;
        const vipExpiresAt = Number.isFinite(parsedExpiry) && parsedExpiry > now() ? parsedExpiry : fallbackExpiry;
        set({ vipExpiresAt, vipTier: 1 });
      },

      activateDevVIP: (durationMs = 24 * 60 * 60 * 1000) => {
        if (!__DEV__) return false;
        get().activateVIP(durationMs, 1);
        return true;
      },

      activateBoost: (type, multiplier, durationSeconds) => {
        const safeMultiplier = Math.max(1, multiplier);
        const safeDurationMs = Math.max(0, durationSeconds) * 1000;
        const current = get().boosts[type];
        const baseExpiry = Math.max(current?.expiresAt || 0, now());
        set({
          boosts: {
            ...get().boosts,
            [type]: {
              multiplier: safeMultiplier,
              expiresAt: baseExpiry + safeDurationMs,
            },
          },
        });
      },

      isVIPActive: () => now() < (get().vipExpiresAt || 0),

      getVIPTier: () => (get().isVIPActive() ? get().vipTier || 1 : 0),

      getActiveBoostMultiplier: (type) => {
        const boost = get().boosts[type];
        if (!boost || now() >= boost.expiresAt) return 1;
        return boost.multiplier;
      },

      clearExpired: () => {
        const active = Object.fromEntries(
          Object.entries(get().boosts).filter(([, boost]) => boost && now() < boost.expiresAt)
        ) as Partial<Record<BoostType, ActiveBoost>>;
        set({
          vipExpiresAt: now() < (get().vipExpiresAt || 0) ? get().vipExpiresAt : 0,
          vipTier: now() < (get().vipExpiresAt || 0) ? get().vipTier : 0,
          boosts: active,
        });
      },

      resetEntitlements: () => set({ vipExpiresAt: 0, vipTier: 0, boosts: {} }),
    }),
    {
      name: "trivia-entitlements-v1",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);



