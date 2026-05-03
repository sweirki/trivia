// src/store/useAuthStore.ts
// 🔐 Auth store — Phase D1 safe (identity only)

import { create } from "zustand";

import { auth, db } from "@/firebase/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";


import { usePlayerStore } from "@/store/playerEntry";
import { useIdentityStore } from "src/identity/store/useIdentityStore";
import { useSeasonStore } from "@/seasons/store/useSeasonStore";

type CloudProfile = {
  email: string | null;
  profileInitialized: boolean;
  createdAt: any;
  xp?: number;
  level?: number;
  coins?: number;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  cloudProfile: CloudProfile | null;
  needsMergePrompt: boolean;
  justMerged: boolean;

  initAuth: () => void;
  loadCloudProfile: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  mergeLocalProgressToCloud: () => Promise<void>;
  startFreshAccount: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  cloudProfile: null,
  needsMergePrompt: false,
  justMerged: false,

  // ---------------------------------------------------------
  // 1️⃣ AUTH LISTENER — IDENTITY ONLY
  // ---------------------------------------------------------
  initAuth: () => {
    if (get().initialized) return;

    set({ initialized: true, loading: true });

    
    onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        set({
          user: null,
          cloudProfile: null,
          needsMergePrompt: false,
          justMerged: false,
          loading: false,
        });

        usePlayerStore.getState().setUserId(null);
        return;
      }

      set({
        user: firebaseUser,
        loading: false,
      });

      usePlayerStore.getState().setUserId(firebaseUser.uid);
      usePlayerStore.getState().loadCloudProfile();
      useIdentityStore.getState().loadIdentity(firebaseUser.uid);
      useSeasonStore.getState().loadSeason(firebaseUser.uid);
    });
  },

  // ---------------------------------------------------------
  // 2️⃣ LOAD CLOUD PROFILE (NO MERGE)
  // ---------------------------------------------------------
  loadCloudProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          email: user.email,
          profileInitialized: false,
          createdAt: serverTimestamp(),
        });

        set({
          cloudProfile: {
            email: user.email,
            profileInitialized: false,
            createdAt: null,
          },
        });

        return;
      }

      const data = snap.data() as CloudProfile;
      const player = usePlayerStore.getState();

      const hasLocalProgress =
        player.xp > 0 || player.coins > 0;

      const needsMerge =
        data.profileInitialized === false &&
        hasLocalProgress === true;

      set({
        cloudProfile: data,
        needsMergePrompt: needsMerge,
      });

      if (data.profileInitialized === true) {
        usePlayerStore.setState({
          xp: data.xp ?? 0,
          level: data.level ?? 1,
          coins: data.coins ?? 0,
        });
      }
    } catch (err) {
      console.log("🔥 loadCloudProfile error:", err);
    }
  },

  // ---------------------------------------------------------
  // 3️⃣ LOGIN
  // ---------------------------------------------------------
  login: async (email, password) => {
    set({ loading: true });
   
    await signInWithEmailAndPassword(auth, email, password);
    set({ loading: false });
  },

  // ---------------------------------------------------------
  // 4️⃣ SIGNUP
  // ---------------------------------------------------------
  signup: async (email, password) => {
    set({ loading: true });

  
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      profileInitialized: false,
      createdAt: serverTimestamp(),
    });

    set({ loading: false });
  },

  // ---------------------------------------------------------
  // 5️⃣ PASSWORD RESET
  // ---------------------------------------------------------
  resetPassword: async (email) => {
   

    await sendPasswordResetEmail(auth, email);
  },

  // ---------------------------------------------------------
  // 6️⃣ MERGE LOCAL → CLOUD
  // ---------------------------------------------------------
  mergeLocalProgressToCloud: async () => {
    const { user, cloudProfile } = get();
    if (!user || !cloudProfile) return;
    if (cloudProfile.profileInitialized === true) return;

    const player = usePlayerStore.getState();

    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        xp: player.xp,
        level: player.level,
        coins: player.coins,
        nickname: player.nickname,
        avatarId: player.avatarId,
        profileInitialized: true,
        mergedAt: serverTimestamp(),
        mergeVersion: "10D",
      },
      { merge: true }
    );

    set({
      cloudProfile: {
        ...cloudProfile,
        xp: player.xp,
        level: player.level,
        coins: player.coins,
        profileInitialized: true,
      },
      needsMergePrompt: false,
      justMerged: true,
    });
  },

  // ---------------------------------------------------------
  // 7️⃣ START FRESH
  // ---------------------------------------------------------
  startFreshAccount: async () => {
    const { user } = get();
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        xp: 0,
        level: 1,
        coins: 0,
        profileInitialized: true,
        mergedAt: serverTimestamp(),
        mergeVersion: "10D_START_FRESH",
      },
      { merge: true }
    );

    usePlayerStore.setState({
      xp: 0,
      level: 1,
      coins: 0,
    });

    set({
      cloudProfile: {
        email: user.email,
        xp: 0,
        level: 1,
        coins: 0,
        profileInitialized: true,
        createdAt: null,
      },
      needsMergePrompt: false,
      justMerged: false,
    });
  },

  // ---------------------------------------------------------
  // 8️⃣ LOGOUT
  // ---------------------------------------------------------
  logout: async () => {
    
    await signOut(auth);

    set({
      user: null,
      cloudProfile: null,
      needsMergePrompt: false,
      justMerged: false,
      loading: false,
    });
  },
}));

