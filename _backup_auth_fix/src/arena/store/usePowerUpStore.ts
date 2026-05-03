import { create } from "zustand";

export interface PowerUp {
  name: string;
  qty: number;
}

interface PowerUpState {
  powerups: Record<string, PowerUp>;

  /** Consume one power-up if available */
  usePowerUp: (type: string) => boolean;

  /** Check availability (for UI disable) */
  hasPowerUp: (type: string) => boolean;

  /** Add power-ups (rewards, shop, etc.) */
  addPowerUp: (type: string, amount: number) => void;

  /** Reset all power-ups for a new match */
  resetPowerUps: () => void;
}

const INITIAL_POWERUPS: Record<string, PowerUp> = {
  freeze: { name: "Freeze Time", qty: 1 },
  shield: { name: "Shield", qty: 1 },
  double: { name: "Double Points", qty: 1 },
  reroll: { name: "Reroll", qty: 1 },
  reveal: { name: "Reveal Hint", qty: 1 },
};

export const usePowerUpStore = create<PowerUpState>((set, get) => ({
  powerups: { ...INITIAL_POWERUPS },

  usePowerUp: (type) => {
    const p = get().powerups[type];
    if (!p || p.qty <= 0) return false;

    set({
      powerups: {
        ...get().powerups,
        [type]: { ...p, qty: p.qty - 1 },
      },
    });

    return true;
  },

  hasPowerUp: (type) => {
    const p = get().powerups[type];
    return !!p && p.qty > 0;
  },

  addPowerUp: (type, amount) => {
    const p = get().powerups[type] || { name: type, qty: 0 };

    set({
      powerups: {
        ...get().powerups,
        [type]: { ...p, qty: p.qty + amount },
      },
    });
  },

  resetPowerUps: () => {
    set({ powerups: { ...INITIAL_POWERUPS } });
  },
}));
