import { create } from "zustand";

import { STORE_CONFIG, StoreProductId } from "../config/storeConfig";
import { revenueCatService } from "@/services/revenueCatService";
import { useEntitlementStore } from "./entitlementStore";
import { usePlayerStore } from "./usePlayerStore";

export type PurchaseResult = {
  success: boolean;
  reason?:
    | "NOT_FOUND"
    | "INSUFFICIENT_COINS"
    | "INSUFFICIENT_GEMS"
    | "REAL_PURCHASE_NOT_CONNECTED"
    | "PURCHASE_CANCELLED"
    | "PURCHASE_FAILED"
    | "ALREADY_OWNED"
    | "VIP_REQUIRED";
  message: string;
};

type PurchaseErrorLike = {
  userCancelled?: boolean;
  code?: string;
  message?: string;
};

type PurchaseState = {
  lastResult: PurchaseResult | null;
  isPurchasing: boolean;
  buy: (productId: StoreProductId | string) => Promise<PurchaseResult>;
  buyCosmetic: (cosmeticId: string) => PurchaseResult;
  restorePurchases: () => Promise<PurchaseResult>;
  syncRevenueCatEntitlements: () => Promise<void>;
};

function normalizePurchaseError(error: unknown): PurchaseErrorLike {
  if (error instanceof Error) {
    return { message: error.message };
  }

  if (typeof error !== "object" || error === null) {
    return {};
  }

  const record = error as Record<string, unknown>;

  return {
    userCancelled:
      typeof record.userCancelled === "boolean"
        ? record.userCancelled
        : undefined,
    code: typeof record.code === "string" ? record.code : undefined,
    message:
      typeof record.message === "string" && record.message.trim()
        ? record.message
        : undefined,
  };
}

const result = (payload: PurchaseResult): PurchaseResult => {
  usePurchaseStore.setState({ lastResult: payload });
  return payload;
};

const getPurchaseErrorMessage = (error: unknown) => {
  const purchaseError = normalizePurchaseError(error);

  if (
    purchaseError.userCancelled ||
    purchaseError.code === "PURCHASE_CANCELLED"
  ) {
    return result({
      success: false,
      reason: "PURCHASE_CANCELLED",
      message: "Purchase cancelled.",
    });
  }

  return result({
    success: false,
    reason: "PURCHASE_FAILED",
    message: purchaseError.message || "Purchase failed. Please try again.",
  });
};

const applyRevenueCatProduct = async (
  productId: string
): Promise<PurchaseResult> => {
  const player = usePlayerStore.getState();
  const entitlements = useEntitlementStore.getState();

  const gemPack = STORE_CONFIG.gems.find(
    (item) => item.id === productId || item.revenueCatId === productId
  );

  if (gemPack) {
    await revenueCatService.purchaseProduct(gemPack.revenueCatId);

    const amount = gemPack.amount + gemPack.bonusAmount;
    player.addGems(amount);

    return result({
      success: true,
      message: `${amount} gems added.`,
    });
  }

  if (productId === "starter_bundle") {
    await revenueCatService.purchaseProduct("starter_bundle");

    player.addGems(250);
    player.addTickets(15);
    entitlements.activateBoost("xp", 2, 1800);

    return result({
      success: true,
      message:
        "Starter Pack unlocked: 250 gems, 15 tickets, and 30 minutes of 2x XP.",
    });
  }

  if (
    STORE_CONFIG.vip.id === productId ||
    STORE_CONFIG.vip.revenueCatId === productId
  ) {
    const purchase = await revenueCatService.purchaseProduct(
      STORE_CONFIG.vip.revenueCatId
    );

    entitlements.setRevenueCatVIP(
      Boolean(purchase.vipExpirationDate),
      purchase.vipExpirationDate
    );

    return result({
      success: Boolean(purchase.vipExpirationDate),
      reason: purchase.vipExpirationDate ? undefined : "PURCHASE_FAILED",
      message: purchase.vipExpirationDate
        ? "VIP is now active."
        : "Purchase completed, but VIP entitlement was not returned yet. Try Restore Purchases.",
    });
  }

  return result({
    success: false,
    reason: "NOT_FOUND",
    message: "RevenueCat product not found.",
  });
};

export const usePurchaseStore = create<PurchaseState>((set) => ({
  lastResult: null,
  isPurchasing: false,

  buy: async (productId) => {
    const player = usePlayerStore.getState();
    const entitlements = useEntitlementStore.getState();

    set({ isPurchasing: true });

    try {
      const gemPack = STORE_CONFIG.gems.find(
        (item) => item.id === productId || item.revenueCatId === productId
      );

      const isRevenueCatProduct =
        Boolean(gemPack) ||
        productId === "starter_bundle" ||
        STORE_CONFIG.vip.id === productId ||
        STORE_CONFIG.vip.revenueCatId === productId;

      if (isRevenueCatProduct) {
        if (!revenueCatService.isSupported()) {
          return result({
            success: false,
            reason: "REAL_PURCHASE_NOT_CONNECTED",
            message:
              "RevenueCat purchases are available on iOS and Android builds only.",
          });
        }

        return await applyRevenueCatProduct(productId);
      }

      const ticketPack = STORE_CONFIG.tickets.find(
        (item) => item.id === productId
      );

      if (ticketPack) {
        if (player.coins < ticketPack.cost) {
          return result({
            success: false,
            reason: "INSUFFICIENT_COINS",
            message: "Not enough coins.",
          });
        }

        player.spendCoins(ticketPack.cost);
        player.addTickets(ticketPack.amount);

        return result({
          success: true,
          message: `${ticketPack.amount} tickets added.`,
        });
      }

      const bundle = STORE_CONFIG.bundles.find(
        (item) => item.id === productId
      );

      if (bundle) {
        const canPay =
          bundle.costCurrency === "COINS"
            ? player.coins >= bundle.cost
            : player.gems >= bundle.cost;

        if (!canPay) {
          return result({
            success: false,
            reason:
              bundle.costCurrency === "COINS"
                ? "INSUFFICIENT_COINS"
                : "INSUFFICIENT_GEMS",
            message:
              bundle.costCurrency === "COINS"
                ? "Not enough coins."
                : "Not enough gems.",
          });
        }

        if (bundle.costCurrency === "COINS") {
          player.spendCoins(bundle.cost);
        } else {
          player.spendGems(bundle.cost);
        }

        player.addTickets(bundle.tickets);

        if (bundle.boostType && bundle.multiplier && bundle.durationSeconds) {
          entitlements.activateBoost(
            bundle.boostType,
            bundle.multiplier,
            bundle.durationSeconds
          );
        }

        return result({
          success: true,
          message: `${bundle.title} unlocked.`,
        });
      }

      const boost = STORE_CONFIG.boosts.find((item) => item.id === productId);

      if (boost) {
        if (player.gems < boost.cost) {
          return result({
            success: false,
            reason: "INSUFFICIENT_GEMS",
            message: "Not enough gems.",
          });
        }

        player.spendGems(boost.cost);
        entitlements.activateBoost(
          boost.boostType,
          boost.multiplier,
          boost.durationSeconds
        );

        return result({
          success: true,
          message: `${boost.title} activated.`,
        });
      }

      return result({
        success: false,
        reason: "NOT_FOUND",
        message: "Product not found.",
      });
    } catch (error: unknown) {
      return getPurchaseErrorMessage(error);
    } finally {
      set({ isPurchasing: false });
    }
  },

  buyCosmetic: (cosmeticId) => {
    const outcome = usePlayerStore.getState().purchaseCosmetic(cosmeticId);

    if (outcome.success) {
      return result({
        success: true,
        message: "Cosmetic purchased and equipped.",
      });
    }

    const reason = outcome.reason ?? "NOT_FOUND";

    const messageByReason = {
      ALREADY_OWNED: "You already own this cosmetic.",
      INSUFFICIENT_COINS: "Not enough coins.",
      INSUFFICIENT_GEMS: "Not enough gems.",
      NOT_FOUND: "Cosmetic not found.",
      VIP_REQUIRED: "VIP is required for this cosmetic.",
    } as const;

    return result({
      success: false,
      reason,
      message: messageByReason[reason],
    });
  },

  restorePurchases: async () => {
    if (!revenueCatService.isSupported()) {
      return result({
        success: false,
        reason: "REAL_PURCHASE_NOT_CONNECTED",
        message: "Restore purchases is available on iOS and Android builds only.",
      });
    }

    set({ isPurchasing: true });

    try {
      const restore = await revenueCatService.restorePurchases();

      useEntitlementStore
        .getState()
        .setRevenueCatVIP(
          Boolean(restore.vipExpirationDate),
          restore.vipExpirationDate
        );

      return result({
        success: true,
        message: restore.vipExpirationDate
          ? "Purchases restored. VIP is active."
          : "Restore complete. No active VIP entitlement found.",
      });
    } catch (error: unknown) {
      return getPurchaseErrorMessage(error);
    } finally {
      set({ isPurchasing: false });
    }
  },

  syncRevenueCatEntitlements: async () => {
    if (!revenueCatService.isSupported()) return;

    try {
      const info = await revenueCatService.getCustomerInfo();

      useEntitlementStore
        .getState()
        .setRevenueCatVIP(Boolean(info.vipExpirationDate), info.vipExpirationDate);
    } catch {
      // Silent by design: sync should never block app boot.
    }
  },
}));
