import React from "react";
import { BannerAd as GoogleBannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

// ✅ Use test ad ID in development; replace with real AdMob ID later
const bannerAdId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-3940256099942544/6300978111";

// ✅ BannerAd component (safe, fully closed syntax)
export const BannerAd = () => (
  <GoogleBannerAd
    unitId={bannerAdId}
    size={BannerAdSize.BANNER}
    requestOptions={{
      requestNonPersonalizedAdsOnly: true,
    }}
  />
);
