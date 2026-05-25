import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsState = {
  soundEffects: boolean;
  music: boolean;
  vibration: boolean;
  notifications: boolean;
  friendRequests: boolean;
  challengeAlerts: boolean;
  setSoundEffects: (value: boolean) => void;
  setMusic: (value: boolean) => void;
  setVibration: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
  setFriendRequests: (value: boolean) => void;
  setChallengeAlerts: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEffects: true,
      music: true,
      vibration: true,
      notifications: false,
      friendRequests: true,
      challengeAlerts: true,
      setSoundEffects: (soundEffects) => set({ soundEffects }),
      setMusic: (music) => set({ music }),
      setVibration: (vibration) => set({ vibration }),
      setNotifications: (notifications) => set({ notifications }),
      setFriendRequests: (friendRequests) => set({ friendRequests }),
      setChallengeAlerts: (challengeAlerts) => set({ challengeAlerts }),
    }),
    {
      name: "triviaworld-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function areSoundEffectsEnabled() {
  return useSettingsStore.getState().soundEffects;
}

export function isMusicEnabled() {
  return useSettingsStore.getState().music;
}

export function isVibrationEnabled() {
  return useSettingsStore.getState().vibration;
}


