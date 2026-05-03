import { create } from 'zustand';

interface ProfileState {
  coins: number;
  xp: number;
  tickets: number;

  grantDailyReward: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  coins: 0,
  xp: 0,
  tickets: 0,

  grantDailyReward: () => {
    set((state) => ({
      coins: state.coins + 50,
      xp: state.xp + 25,
      tickets: state.tickets + 1,
    }));
  },
}));
