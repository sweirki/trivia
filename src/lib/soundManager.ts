// src/lib/soundManager.ts
// -----------------------------------------------------------------------------
// ✅ Mega-WOW Trivia Sound Manager (Expo SDK 54+)
// Uses expo-audio (replaces deprecated expo-av).
// Provides init, play, and reusable click/win/lose sound functions.
// All async-safe, memory-clean, and auto-unload after playback.
// -----------------------------------------------------------------------------

import * as Audio from "expo-audio";
import { Platform } from "react-native";

let clickSound: Audio.Audio | null = null;
let winSound: Audio.Audio | null = null;
let loseSound: Audio.Audio | null = null;

/**
 * ✅ Preload all app sounds.
 * Call once at startup (e.g. in _layout.tsx or Hub).
 */
export async function initSounds() {
  try {
    clickSound = new Audio.Audio();
    winSound = new Audio.Audio();
    loseSound = new Audio.Audio();

    await Promise.all([
      clickSound.loadAsync(require("../../assets/sfx/ui_click.mp3")),
      winSound.loadAsync(require("../../assets/sfx/win.mp3")),
      loseSound.loadAsync(require("../../assets/sfx/error.mp3")),
    ]);

    console.log("✅ Sounds initialized");
  } catch (err) {
    console.warn("Sound init error:", err);
  }
}

/**
 * ✅ Play an arbitrary sound file once.
 * Automatically unloads when finished.
 */
export async function playSound(file: any) {
  try {
    const sound = new Audio.Audio();
    await sound.loadAsync(file);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status && "didJustFinish" in status && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (err) {
    console.warn("Sound error:", err);
  }
}

/**
 * ✅ Reusable helpers
 */
export const playClick = async () => {
  if (!clickSound) await initSounds();
  await clickSound?.replayAsync();
};

export const playWin = async () => {
  if (!winSound) await initSounds();
  await winSound?.replayAsync();
};

export const playLose = async () => {
  if (!loseSound) await initSounds();
  await loseSound?.replayAsync();
};

// ✅ Auto-initialize on native platforms
if (Platform.OS !== "web") {
  initSounds();
}
