import { Audio } from "expo-av";

import { areSoundEffectsEnabled } from "@/store/useSettingsStore";

export type SoundKey =
  | "tap"
  | "correct"
  | "wrong"
  | "reward"
  | "streak"
  | "levelUp"
  | "purchaseSuccess"
  | "arenaClutch"
  | "suddenDeath"
  | "tournamentWin";

const SOUND_FILES: Record<SoundKey, number> = {
  tap: require("@assets/sounds/tap.mp3"),
  correct: require("@assets/sounds/correct.mp3"),
  wrong: require("@assets/sounds/wrong.mp3"),
  reward: require("@assets/sounds/reward.mp3"),
  streak: require("@assets/sounds/streak.mp3"),
  levelUp: require("@assets/sounds/level-up.mp3"),
  purchaseSuccess: require("@assets/sounds/purchase-success.mp3"),
  arenaClutch: require("@assets/sounds/arena-clutch.mp3"),
  suddenDeath: require("@assets/sounds/sudden-death.mp3"),
  tournamentWin: require("@assets/sounds/tournament-win.mp3"),
};

const VOLUME: Record<SoundKey, number> = {
  tap: 0.28,
  correct: 0.72,
  wrong: 0.68,
  reward: 0.82,
  streak: 0.76,
  levelUp: 0.86,
  purchaseSuccess: 0.84,
  arenaClutch: 0.84,
  suddenDeath: 0.78,
  tournamentWin: 0.9,
};

const MIN_GAP_MS: Record<SoundKey, number> = {
  tap: 45,
  correct: 80,
  wrong: 80,
  reward: 350,
  streak: 180,
  levelUp: 450,
  purchaseSuccess: 500,
  arenaClutch: 180,
  suddenDeath: 350,
  tournamentWin: 700,
};

const cache: Partial<Record<SoundKey, Audio.Sound>> = {};
const queues: Partial<Record<SoundKey, Promise<void>>> = {};
let lastPlayedAt: Partial<Record<SoundKey, number>> = {};
let audioModeReady = false;
let audioModePromise: Promise<void> | null = null;

async function ensureAudioMode() {
  if (audioModeReady) return;

  if (!audioModePromise) {
    audioModePromise = Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    })
      .then(() => {
        audioModeReady = true;
      })
      .catch(() => {
        // Audio feedback must never block gameplay.
      })
      .finally(() => {
        audioModePromise = null;
      });
  }

  await audioModePromise;
}

async function getSound(key: SoundKey) {
  if (cache[key]) return cache[key];

  await ensureAudioMode();

  const { sound } = await Audio.Sound.createAsync(SOUND_FILES[key], {
    shouldPlay: false,
    volume: VOLUME[key],
    progressUpdateIntervalMillis: 1000,
  });

  cache[key] = sound;
  return sound;
}

async function playSoundNow(key: SoundKey) {
  if (!areSoundEffectsEnabled()) return;

  const now = Date.now();
  const last = lastPlayedAt[key] ?? 0;

  if (now - last < MIN_GAP_MS[key]) return;
  lastPlayedAt[key] = now;

  const sound = await getSound(key);
  const status = await sound.getStatusAsync();

  if (!status.isLoaded) return;

  // stopAsync before replay avoids Android/expo-av cases where setPositionAsync
  // during an active sound silently fails or leaves the next sound muted.
  if (status.isPlaying) {
    await sound.stopAsync();
  }

  await sound.setStatusAsync({
    positionMillis: 0,
    volume: VOLUME[key],
    shouldPlay: true,
  });
}

export async function preloadFeedbackSounds(keys: SoundKey[] = ["tap", "correct", "wrong"]) {
  if (!areSoundEffectsEnabled()) return;

  try {
    await Promise.all(keys.map((key) => getSound(key)));
  } catch {
    // Preloading is optional. Ignore failures so gameplay continues.
  }
}

export function playSound(key: SoundKey) {
  queues[key] = (queues[key] ?? Promise.resolve())
    .catch(() => undefined)
    .then(() => playSoundNow(key))
    .catch(() => {
      // Audio feedback must never block or crash gameplay.
    });

  return queues[key];
}

export async function unloadFeedbackSounds() {
  const sounds = Object.values(cache).filter(Boolean) as Audio.Sound[];

  await Promise.all(
    sounds.map(async (sound) => {
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore unload failures.
      }
    })
  );

  Object.keys(cache).forEach((key) => {
    delete cache[key as SoundKey];
  });

  queues.tap = undefined;
  queues.correct = undefined;
  queues.wrong = undefined;
  queues.reward = undefined;
  queues.streak = undefined;
  queues.levelUp = undefined;
  queues.purchaseSuccess = undefined;
  queues.arenaClutch = undefined;
  queues.suddenDeath = undefined;
  queues.tournamentWin = undefined;

  lastPlayedAt = {};
  audioModeReady = false;
}
