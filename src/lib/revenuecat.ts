// src/lib/revenuecat.ts
// -----------------------------------------------------------------------------
// ✅ RevenueCat Integration for Mega-WOW Trivia
// Use only the PUBLIC SDK key (starts with "appl_").
// Never include the secret key in your app.
// -----------------------------------------------------------------------------

import Purchases from "react-native-purchases";

const REVENUECAT_PUBLIC_KEY = "goog_VxWIcKYrBKsAiKLsapekpTBCraO";

export const initRevenueCat = async () => {
  try {
    await Purchases.configure({
      apiKey: REVENUECAT_PUBLIC_KEY,
    });
    console.log("✅ RevenueCat initialized");
  } catch (err) {
    console.error("RevenueCat init failed:", err);
  }
};
