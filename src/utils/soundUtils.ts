import { Audio } from "expo-av";

const sounds: Record<string, Audio.Sound | null> = {
  correct: null,
  error: null,
  streak: null,
  tick: null,
  roundEnd: null,
};

const load = async (key: keyof typeof sounds, file: any) => {
  const { sound } = await Audio.Sound.createAsync(file);
  sounds[key] = sound;
};

export const initSounds = async () => {
  await load("correct", require("../../assets/audio/correct.mp3"));
  await load("error", require("../../assets/audio/error.mp3"));
  await load("streak", require("../../assets/audio/streak.mp3"));
  await load("tick", require("../../assets/audio/tick.mp3"));
  await load("roundEnd", require("../../assets/audio/round-end.mp3"));
};

export const playSound = async (key: keyof typeof sounds) => {
  const s = sounds[key];
  if (s) {
    await s.replayAsync();
  }
};
