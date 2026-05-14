// src/components/BackgroundMusicPlayer.tsx
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { Audio } from "expo-av";

import { useSettingsStore } from "@/store/useSettingsStore";

export default function BackgroundMusicPlayer() {
  const musicEnabled = useSettingsStore((s) => s.music);
  const sound = useRef<Audio.Sound | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    let cancelled = false;

    async function stopAndUnload() {
      const current = sound.current;
      sound.current = null;

      if (!current) return;

      try {
        await current.stopAsync();
      } catch {}

      try {
        await current.unloadAsync();
      } catch {}
    }

    async function start() {
      if (!musicEnabled || appState.current !== "active") {
        await stopAndUnload();
        return;
      }

      if (sound.current) {
        try {
          const status = await sound.current.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
            await sound.current.playAsync();
          }
        } catch {}
        return;
      }

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        const { sound: loaded } = await Audio.Sound.createAsync(
          require("@assets/sounds/1.mp3"),
          { shouldPlay: true, isLooping: true, volume: 0.15 }
        );

        if (cancelled || !musicEnabled || appState.current !== "active") {
          await loaded.unloadAsync();
          return;
        }

        sound.current = loaded;
      } catch (err) {
        console.warn("BackgroundMusic error:", err);
      }
    }

    const subscription = AppState.addEventListener("change", (nextState) => {
      appState.current = nextState;
      if (nextState === "active" && musicEnabled) {
        void start();
      } else {
        void stopAndUnload();
      }
    });

    void start();

    return () => {
      cancelled = true;
      subscription.remove();
      void stopAndUnload();
    };
  }, [musicEnabled]);

  return null;
}
