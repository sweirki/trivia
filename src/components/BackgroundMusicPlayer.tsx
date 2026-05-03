// src/components/BackgroundMusicPlayer.tsx
import { useEffect, useRef } from "react";
import { Audio } from "expo-av";

export default function BackgroundMusicPlayer() {
  const sound = useRef<Audio.Sound | null>(null);

  async function setup() {
    try {
      // Prevent duplicate loads
      if (sound.current) return;

      const { sound: loaded } = await Audio.Sound.createAsync(
        require("@assets/sounds/1.mp3"), // replace with music later
        { shouldPlay: true, isLooping: true, volume: 0.15 }
      );

      sound.current = loaded;
      await loaded.playAsync();
    } catch (err) {
      console.log("BackgroundMusic error:", err);
    }
  }

  useEffect(() => {
    setup();

    return () => {
      if (sound.current) {
        sound.current.stopAsync();
        sound.current.unloadAsync();
        sound.current = null;
      }
    };
  }, []);

  return null;
}



