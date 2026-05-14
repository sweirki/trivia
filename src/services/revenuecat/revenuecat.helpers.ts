import { REVENUECAT_VIP_ENTITLEMENT_ID } from "@/config/revenueCatConfig";
import type {
  RevenueCatCustomerInfo,
  RevenueCatOffering,
  RevenueCatOfferings,
  RevenueCatPackage,
  RevenueCatPurchaseResult,
} from "./revenuecat.types";

export function getActiveVipExpiry(
  customerInfo: RevenueCatCustomerInfo | null | undefined
): string | number | null {
  const vip =
    customerInfo?.entitlements?.active?.[REVENUECAT_VIP_ENTITLEMENT_ID];

  if (!vip) return null;

  return vip.expirationDate ?? vip.expirationDateMillis ?? null;
}

export function getCustomerInfoFromPurchaseResult(
  purchaseResult: RevenueCatPurchaseResult | RevenueCatCustomerInfo
): RevenueCatCustomerInfo {
  if ("customerInfo" in purchaseResult && purchaseResult.customerInfo) {
    return purchaseResult.customerInfo;
  }

  return purchaseResult as RevenueCatCustomerInfo;
}

export function getOffering(
  offerings: RevenueCatOfferings,
  offeringId: string
): RevenueCatOffering | undefined {
  return offerings.all?.[offeringId] ?? offerings.current;
}

export function findRevenueCatPackage(
  packages: RevenueCatPackage[],
  productId: string
): RevenueCatPackage | null {
  return (
    packages.find((pkg) => pkg.identifier === productId) ??
    packages.find((pkg) => pkg.product?.identifier === productId) ??
    null
  );
}

