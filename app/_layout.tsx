// /app/_layout.tsx — A+++++ ROOT LAYOUT
import { useEffect } from "react";
import { AppState, Text as RNText, TextInput as RNTextInput } from "react-native";
import { Slot, usePathname } from "expo-router";
import { ThemeProvider } from "@/theme";

import AuthGate from "@/components/AuthGate";
import BackgroundMusicPlayer from "@/components/BackgroundMusicPlayer";
import {
  ObservabilityErrorBoundary,
  setupProductionObservability,
  setAnalyticsUserId,
  setCrashUser,
  trackEvent,
  trackScreenView,
  addCrashBreadcrumb,
} from "@/observability";

import { useAuthStore } from "@/store/useAuthStore";
import { usePurchaseStore } from "@/store/purchaseStore";
import { warmFeedbackSounds } from "@/feedback";

// Keep the game UI visually consistent across real Android devices.
// Large system font settings were expanding cards/buttons and breaking the premium layout.
(RNText as any).defaultProps = (RNText as any).defaultProps || {};
(RNText as any).defaultProps.allowFontScaling = false;
(RNTextInput as any).defaultProps = (RNTextInput as any).defaultProps || {};
(RNTextInput as any).defaultProps.allowFontScaling = false;


export default function Root() {
useEffect(() => {
  setTimeout(() => {
    // force JS + touch system warmup
    const start = Date.now();
    while (Date.now() - start < 1) {}
  }, 0);
}, []);

  const pathname = usePathname();
  const loadCloudProfile = useAuthStore((s) => s.loadCloudProfile);
 const syncRevenueCatEntitlements = usePurchaseStore((s) => s.syncRevenueCatEntitlements);


  // Initialize authentication ONCE
useEffect(() => {
  syncRevenueCatEntitlements();
}, [syncRevenueCatEntitlements]);
const user = useAuthStore((s) => s.user);

useEffect(() => {
  setupProductionObservability();
  void trackEvent("app_opened");
  warmFeedbackSounds();
}, []);

useEffect(() => {
  void trackScreenView(pathname || "unknown");
  void addCrashBreadcrumb("navigation.screen_viewed", { screenName: pathname || "unknown" });
}, [pathname]);

useEffect(() => {
  const userId = user?.uid ?? null;

  void setAnalyticsUserId(userId);
  void setCrashUser(userId);

  if (!user) return;

  loadCloudProfile();
}, [loadCloudProfile, user]);


  return (
    <ObservabilityErrorBoundary>
      <ThemeProvider>
        <AuthGate>
          <Slot />
        </AuthGate>

        {/* Global music controller */}
        <BackgroundMusicPlayer />
      </ThemeProvider>
    </ObservabilityErrorBoundary>
  );
}






