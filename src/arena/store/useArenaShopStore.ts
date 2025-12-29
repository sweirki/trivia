import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useArenaEconomyStore } from "./useArenaEconomyStore";

type ArenaShopState = {
  buySingleCharge: () => boolean;
  buyFiveCharges: () => boolean;
  buyPremiumCharges: () => boolean;
};

const COIN_SINGLE = 50;
const COIN_FIVE = 220;
const TOKEN_PREMIUM = 3;

export const useArenaShopStore = create<ArenaShopState>()(
  persist(
    () => ({
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
    }),
    {
      name: "arena-shop-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
