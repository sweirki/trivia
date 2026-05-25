import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { useArenaEconomyStore } from "./useArenaEconomyStore";

export type ArenaPrestigeItemId =
  | "arena_champion_banner"
  | "ranked_rival_frame"
  | "survival_record_badge"
  | "power_strategist_title";

export type ArenaPrestigeItem = {
  id: ArenaPrestigeItemId;
  title: string;
  price: number;
  description: string;
  rewardLabel: string;
  tier: "rare" | "epic" | "legendary";
  rotationTag: "Champion" | "Ranked" | "Survival" | "Power";
  gateLabel?: string;
};

type ArenaShopState = {
  ownedPrestigeItems: Partial<Record<ArenaPrestigeItemId, boolean>>;
  buySingleCharge: () => boolean;
  buyFiveCharges: () => boolean;
  buyPremiumCharges: () => boolean;
  buyPrestigeItem: (id: ArenaPrestigeItemId) => boolean;
  hasPrestigeItem: (id: ArenaPrestigeItemId) => boolean;
};

const COIN_SINGLE = 50;
const COIN_FIVE = 220;
const TOKEN_PREMIUM = 3;

export const ARENA_PRESTIGE_ITEMS: ArenaPrestigeItem[] = [
  {
    id: "arena_champion_banner",
    title: "Arena Champion Banner",
    price: 12,
    description: "A profile-ready Arena identity reward for consistent competitive winners.",
    rewardLabel: "Banner unlock",
    tier: "epic",
    rotationTag: "Champion",
    gateLabel: "Season peak reward path",
  },
  {
    id: "ranked_rival_frame",
    title: "Ranked Rival Frame",
    price: 18,
    description: "A ranked-only prestige frame for ladder grinders and promotion hunters.",
    rewardLabel: "Frame unlock",
    tier: "legendary",
    rotationTag: "Ranked",
    gateLabel: "Best for Rivalry Week",
  },
  {
    id: "survival_record_badge",
    title: "Survival Record Badge",
    price: 10,
    description: "A badge for players who chase personal bests and long pressure runs.",
    rewardLabel: "Badge unlock",
    tier: "rare",
    rotationTag: "Survival",
    gateLabel: "Personal-best identity",
  },
  {
    id: "power_strategist_title",
    title: "Power Strategist Title",
    price: 14,
    description: "A prestige title for efficient Power Arena loadout play.",
    rewardLabel: "Title unlock",
    tier: "epic",
    rotationTag: "Power",
    gateLabel: "Efficiency identity",
  },
];

export function getArenaPrestigeItem(id: ArenaPrestigeItemId) {
  return ARENA_PRESTIGE_ITEMS.find((item) => item.id === id) ?? null;
}

export const useArenaShopStore = create<ArenaShopState>()(
  persist(
    (set, get) => ({
      ownedPrestigeItems: {},

      buySingleCharge: () => {
        const econ = useArenaEconomyStore.getState();
        if (!econ.spendCoins(COIN_SINGLE)) return false;
        econ.refillPowerCharges(1);
        return true;
      },

      buyFiveCharges: () => {
        const econ = useArenaEconomyStore.getState();
        if (!econ.spendCoins(COIN_FIVE)) return false;
        econ.refillPowerCharges(5);
        return true;
      },

      buyPremiumCharges: () => {
        const econ = useArenaEconomyStore.getState();
        if (!econ.spendArenaTokens(TOKEN_PREMIUM)) return false;
        econ.refillPowerCharges(5);
        return true;
      },

      buyPrestigeItem: (id) => {
        if (get().ownedPrestigeItems[id]) return true;

        const item = getArenaPrestigeItem(id);
        if (!item) return false;

        const econ = useArenaEconomyStore.getState();
        if (!econ.spendArenaTokens(item.price)) return false;

        set((state) => ({
          ownedPrestigeItems: {
            ...state.ownedPrestigeItems,
            [id]: true,
          },
        }));
        return true;
      },

      hasPrestigeItem: (id) => get().ownedPrestigeItems[id] === true,
    }),
    {
      name: "arena-shop-store",
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted) => {
        const state = persisted as Partial<ArenaShopState> | undefined;
        return {
          ...state,
          ownedPrestigeItems: state?.ownedPrestigeItems ?? {},
        } as ArenaShopState;
      },
    },
  ),
);
