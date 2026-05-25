export type RevenueCatEntitlement = {
  expirationDate?: string | null;
  expirationDateMillis?: number | null;
};

export type RevenueCatCustomerInfo = {
  entitlements?: {
    active?: Record<string, RevenueCatEntitlement | undefined>;
  };
};

export type RevenueCatProduct = {
  identifier?: string;
  priceString?: string;
  title?: string;
  description?: string;
};

export type RevenueCatPackage = {
  identifier?: string;
  packageType?: string;
  product?: RevenueCatProduct;
};

export type RevenueCatOffering = {
  availablePackages?: RevenueCatPackage[];
};

export type RevenueCatOfferings = {
  current?: RevenueCatOffering;
  all?: Record<string, RevenueCatOffering | undefined>;
};

export type RevenueCatPurchaseResult = {
  customerInfo?: RevenueCatCustomerInfo;
};

export type RevenueCatServiceResult = {
  customerInfo: RevenueCatCustomerInfo;
  vipExpirationDate: string | number | null;
};



