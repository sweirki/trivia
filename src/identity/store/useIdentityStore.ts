import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from 'src/firebase/firebase';

export type PlayerIdentity = {
  avatarId: string;
  badgeId: string | null;
  updatedAt: number;
};

type IdentityState = {
  identity: PlayerIdentity | null;
  loading: boolean;
  loadIdentity: (uid: string) => Promise<void>;
  setAvatar: (uid: string, avatarId: string) => Promise<void>;
};

const DEFAULT_AVATAR = 'avatar_01';

export const useIdentityStore = create<IdentityState>((set) => ({
  identity: null,
  loading: false,

  loadIdentity: async (uid) => {
    set({ loading: true });

    const ref = doc(db, 'players', uid, 'identity', 'core');
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const identity: PlayerIdentity = {
        avatarId: DEFAULT_AVATAR,
        badgeId: null,
        updatedAt: Date.now(),
      };

      await setDoc(ref, identity);
      set({ identity, loading: false });
      return;
    }

    set({
      identity: snap.data() as PlayerIdentity,
      loading: false,
    });
  },

  setAvatar: async (uid, avatarId) => {
    const ref = doc(db, 'players', uid, 'identity', 'core');

    await updateDoc(ref, {
      avatarId,
      updatedAt: Date.now(),
    });

    set((state) => ({
      identity: state.identity
        ? { ...state.identity, avatarId }
        : null,
    }));
  },
}));


