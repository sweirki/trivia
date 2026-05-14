import { Platform } from "react-native";
import Purchases from "react-native-purchases";

import {
  REVENUECAT_OFFERING_ID,
  REVENUECAT_PUBLIC_SDK_KEY,
} from "@/config/revenueCatConfig";

import { normalizeRevenueCatError } from "./revenuecat/revenuecat.errors";
import {
  findRevenueCatPackage,
  getActiveVipExpiry,
  getCustomerInfoFromPurchaseResult,
  getOffering,
} from "./revenuecat/revenuecat.helpers";
import type {
  RevenueCatCustomerInfo,
  RevenueCatOfferings,
  RevenueCatPackage,
  RevenueCatPurchaseResult,
  RevenueCatServiceResult,
} from "./revenuecat/revenuecat.types";

let configured = false;
let configurePromise: Promise<boolean> | null = null;

const isSupportedPlatform = () =>
  Platform.OS === "ios" || Platform.OS === "android";

async function ensureConfigured() {
  const configuredSuccessfully = await revenueCatService.configure();

  if (!configuredSuccessfully) {
    throw new Error("RevenueCat is not supported on this platform.");
  }
}

export const revenueCatService = {
  isSupported: isSupportedPlatform,

  configure: async () => {
    if (!isSupportedPlatform()) return false;
    if (configured) return true;
    if (configurePromise) return configurePromise;

    configurePromise = (async () => {
      Purchases.configure({ apiKey: REVENUECAT_PUBLIC_SDK_KEY });
      configured = true;
      return true;
    })();

    return configurePromise;
  },

  getOfferings: async () => {
    await ensureConfigured();

    try {
      return (await Purchases.getOfferings()) as RevenueCatOfferings;
    } catch (error) {
      throw normalizeRevenueCatError(error, "Failed to load offerings.");
    }
  },

  findPackage: async (productId: string): Promise<RevenueCatPackage | null> => {
    if (!isSupportedPlatform()) return null;

    const offerings = await revenueCatService.getOfferings();
    const offering = getOffering(offerings, REVENUECAT_OFFERING_ID);
    const packages = offering?.availablePackages ?? [];

    return findRevenueCatPackage(packages, productId);
  },

  purchaseProduct: async (productId: string): Promise<RevenueCatServiceResult> => {
    await ensureConfigured();

    try {
     const revenueCatPackage =
  (await revenueCatService.findPackage(productId)) as never;

      if (!revenueCatPackage) {
        throw new Error(`RevenueCat package not found: ${productId}`);
      }

      const purchaseResult = (await Purchases.purchasePackage(
        revenueCatPackage
      )) as RevenueCatPurchaseResult;

      const customerInfo = getCustomerInfoFromPurchaseResult(purchaseResult);

      return {
        customerInfo,
        vipExpirationDate: getActiveVipExpiry(customerInfo),
      };
    } catch (error) {
      throw normalizeRevenueCatError(error, "Purchase failed.");
    }
  },

  restorePurchases: async (): Promise<RevenueCatServiceResult> => {
    await ensureConfigured();

    try {
      const customerInfo =
        (await Purchases.restorePurchases()) as RevenueCatCustomerInfo;

      return {
        customerInfo,
        vipExpirationDate: getActiveVipExpiry(customerInfo),
      };
    } catch (error) {
      throw normalizeRevenueCatError(error, "Failed to restore purchases.");
    }
  },

  getCustomerInfo: async (): Promise<RevenueCatServiceResult> => {
    await ensureConfigured();

    try {
      const customerInfo =
        (await Purchases.getCustomerInfo()) as RevenueCatCustomerInfo;

      return {
        customerInfo,
        vipExpirationDate: getActiveVipExpiry(customerInfo),
      };
    } catch (error) {
      throw normalizeRevenueCatError(error, "Failed to load customer info.");
    }
  },
};

