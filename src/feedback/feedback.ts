import { Vibration } from "react-native";

import {
  hapticError,
  hapticHeavy,
  hapticLight,
  hapticMedium,
  hapticSuccess,
  hapticTap,
  hapticWarning,
} from "./haptics";
import { playSound } from "./sound";

function safeVibrate(ms: number) {
  try {
    Vibration.vibrate(ms);
  } catch {}
}

export const feedback = {
  tap() {
    hapticTap();
    playSound("tap");
  },

  light() {
    hapticLight();
  },

  correct() {
    hapticLight();
    playSound("correct");
  },

  wrong() {
    hapticWarning();
    playSound("wrong");
    safeVibrate(24);
  },

  suddenDeath() {
    hapticError();
    playSound("suddenDeath");
    safeVibrate(42);
  },

  streak() {
    hapticMedium();
    playSound("streak");
  },

  reward() {
    hapticSuccess();
    playSound("reward");
  },

  levelUp() {
    hapticHeavy();
    playSound("levelUp");
  },

  purchaseSuccess() {
    hapticSuccess();
    playSound("purchaseSuccess");
  },

  arenaClutch() {
    hapticMedium();
    playSound("arenaClutch");
  },

  promotion() {
    hapticHeavy();
    playSound("levelUp");
  },

  tournamentWin() {
    hapticHeavy();
    playSound("tournamentWin");
  },

  win() {
    hapticSuccess();
    playSound("reward");
  },

  loss() {
    hapticWarning();
    playSound("wrong");
  },
};

export type AppFeedback = typeof feedback;



