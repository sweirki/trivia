// /app/_layout.tsx — A+++++ ROOT LAYOUT
import { useEffect } from "react";
import { Slot } from "expo-router";
import { ThemeProvider } from "@/theme";

import AuthGate from "@/components/AuthGate";
import BackgroundMusicPlayer from "@/components/BackgroundMusicPlayer";

import { useAuthStore } from "@/store/useAuthStore";

export default function Root() {
 const { initAuth, loadCloudProfile } = useAuthStore();


  // Initialize authentication ONCE
  useEffect(() => {
    initAuth();
  }, []);
const user = useAuthStore((s) => s.user);

useEffect(() => {
  if (!user) return;

  loadCloudProfile();
}, [user]);


  return (
    <ThemeProvider>
      <AuthGate>
        <Slot />
      </AuthGate>

      {/* Global music controller */}
      <BackgroundMusicPlayer />
    </ThemeProvider>
  );
}


