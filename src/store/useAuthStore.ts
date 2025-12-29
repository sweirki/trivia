// src/store/useAuthStore.ts
// 🔐 Central auth + profile sync store (Expo + Firebase + Zustand)

import { create } from "zustand";

// Auth SDK (must come from firebase/auth)
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/firebase";

// Our Firebase wrapper (auth + Firestore)
import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "../../firebase/firebase";

// Player store (XP, level, coins, etc.)
import { usePlayerStore } from "@/store/usePlayerStore";

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  welcomePopup: boolean;

  // lifecycle
  initAuth: () => void;
  loadUserProfile: () => Promise<void>;

  // actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  welcomePopup: false,

  // -------------------------------------------------------------
  // 1) AUTH LISTENER — ONLY SETS USER + FLAGS
  //    (NO FIRESTORE CALLS HERE ANYMORE)
  // -------------------------------------------------------------
  initAuth: () => {
    if (get().initialized) return;

    set({ initialized: true, loading: true });

    onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        set({
          user: null,
          loading: false,
          welcomePopup: false,
        });
        return;
      }

      set({
        user: firebaseUser,
        loading: false,
        welcomePopup: true,
      });

      // ❗ IMPORTANT:
      // We no longer call Firestore here.
      // loadUserProfile() will be triggered separately,
      // AFTER Zustand hydration, from the root/layout.
    });
  },

  // -------------------------------------------------------------
  // 2) LOAD USER PROFILE FROM FIRESTORE (CALL ONCE AFTER HYDRATION)
  // -------------------------------------------------------------
  loadUserProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data: any = snap.data();

        // Safely inject into player store using setState
        usePlayerStore.setState({
          xp: data.xp ?? 0,
          level: data.level ?? 1,
          coins: data.coins ?? 0,
        });
      } else {
        // No profile yet → create one with current local stats
        const player = usePlayerStore.getState();

        await setDoc(ref, {
          email: user.email,
          xp: player.xp ?? 0,
          level: player.level ?? 1,
          coins: player.coins ?? 0,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.log("🔥 loadUserProfile error:", err);
    }
  },

  // -------------------------------------------------------------
  // 3) LOGIN
  // -------------------------------------------------------------
  login: async (email, password) => {
    set({ loading: true });
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will update `user` + `loading`
  },

  // -------------------------------------------------------------
  // 4) SIGNUP
  // -------------------------------------------------------------
  signup: async (email, password) => {
    set({ loading: true });

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const player = usePlayerStore.getState();

    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      xp: player.xp ?? 0,
      level: player.level ?? 1,
      coins: player.coins ?? 0,
      createdAt: serverTimestamp(),
    });

    set({ loading: false });
  },

  // -------------------------------------------------------------
  // 5) PASSWORD RESET
  // -------------------------------------------------------------
  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email);
  },

  // -------------------------------------------------------------
  // 6) LOGOUT
  // -------------------------------------------------------------
  logout: async () => {
    await signOut(auth);
    set({ user: null, welcomePopup: false });
  },
}));


