// shopStore.ts
// ★ SAFE + STABLE VERSION — ZERO ASYNCSTORAGE CRASHES ★

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

export const useShopStore = create(
  persist(
    (set, get) => ({
      // -----------------------------------------------------
      // SHOP INVENTORY (JSON SAFE)
      // -----------------------------------------------------
      items: {
        xpBoost: { price: 100, purchased: false },
        goldenPack: { price: 300, purchased: false },
        megaBundle: { price: 1000, purchased: false },
      },

      // -----------------------------------------------------
      // PURCHASE ITEM
      // -----------------------------------------------------
      purchaseItem: (id) => {
        const item = get().items[id];
        if (!item) return;

        set((state) => ({
          items: {
            ...state.items,
            [id]: {
              ...item,
              purchased: true,
            },
          },
        }));
      },

      // -----------------------------------------------------
      // RESET SHOP FOR NEW SEASON/UPDATE
      // -----------------------------------------------------
      resetShop: () =>
        set({
          items: {
            xpBoost: { price: 100, purchased: false },
            goldenPack: { price: 300, purchased: false },
            megaBundle: { price: 1000, purchased: false },
          },
        }),
    }),

    // -----------------------------------------------------
    // SAFE STORAGE
    // -----------------------------------------------------
    {
      name: "arena-shop-store",
      storage: createJSONStorage(() => AsyncStorage),

      // Only persist JSON-safe data
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);


