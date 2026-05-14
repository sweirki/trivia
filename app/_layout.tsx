// /app/_layout.tsx — A+++++ ROOT LAYOUT
import { useEffect } from "react";
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

export default function Root() {
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




