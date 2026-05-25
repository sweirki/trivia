import { create } from "zustand";
import { auth, db } from "@/firebase/firebase";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { usePlayerStore } from "@/store/playerEntry";
import { useIdentityStore } from "src/identity/store/useIdentityStore";
import { useSeasonStore } from "@/seasons/store/useSeasonStore";

type CloudProfile = {
  email: string | null;
  displayName?: string | null;
  avatarId?: string | null;
  avatarUri?: string | null;
  photoURL?: string | null;
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
  isGuest: boolean;

  initAuth: () => void;
  continueAsGuest: () => void;
  loadCloudProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string, avatarId?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;

  mergeLocalProgressToCloud: () => Promise<void>;
  startFreshAccount: () => Promise<void>;
};

const DEFAULT_AVATAR = "avatar_01";
const cleanName = (name?: string | null) => {
  const value = (name ?? "").trim();
  return value.length > 0 ? value.slice(0, 16) : "Player";
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  cloudProfile: null,
  needsMergePrompt: false,
  justMerged: false,
  isGuest: false,

  initAuth: () => {
    if (get().initialized) return;
    set({ initialized: true, loading: true });

    onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        set({ user: null, cloudProfile: null, needsMergePrompt: false, justMerged: false, loading: false });
        usePlayerStore.getState().resetGuestIdentity();
        useIdentityStore.setState({ identity: null, loading: false });
        return;
      }

      set({ user: firebaseUser, isGuest: false, loading: false });
      usePlayerStore.getState().setUserId(firebaseUser.uid);
      usePlayerStore.getState().loadCloudProfile();
      useIdentityStore.getState().loadIdentity(firebaseUser.uid);
      useSeasonStore.getState().loadSeason(firebaseUser.uid);
    });
  },

  continueAsGuest: () => {
    set({
      user: null,
      cloudProfile: null,
      needsMergePrompt: false,
      justMerged: false,
      isGuest: true,
      loading: false,
    });
    usePlayerStore.getState().resetGuestIdentity();
    useIdentityStore.setState({ identity: null, loading: false });
  },

  loadCloudProfile: async () => {
    const { user } = get();
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const profile: CloudProfile = {
        email: user.email,
        displayName: cleanName(user.displayName),
        avatarId: DEFAULT_AVATAR,
        profileInitialized: false,
        createdAt: null,
      };

      await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
      usePlayerStore.getState().setNickname(profile.displayName ?? "Player");
      usePlayerStore.getState().setAvatar(profile.avatarId ?? DEFAULT_AVATAR);
      set({ cloudProfile: profile });
      return;
    }

    const data = snap.data() as CloudProfile;
    const player = usePlayerStore.getState();
    const hasLocalProgress = player.xp > 0 || player.coins > 0;
    const needsMerge = data.profileInitialized === false && hasLocalProgress === true;

    set({ cloudProfile: data, needsMergePrompt: needsMerge });

    if (data.profileInitialized === true) {
      usePlayerStore.setState({
        nickname: cleanName(data.displayName ?? user.displayName),
        avatarId: data.avatarId ?? DEFAULT_AVATAR,
      });
    }
  },

  refreshUser: async () => {
    const current = auth.currentUser;
    if (!current) return;
    await reload(current);
    set({ user: auth.currentUser });
  },

  resendVerificationEmail: async () => {
    const current = auth.currentUser;
    if (!current) throw new Error("No signed-in user.");
    await sendEmailVerification(current);
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } finally {
      set({ loading: false });
    }
  },

  signup: async (email, password, displayName, avatarId = DEFAULT_AVATAR) => {
    set({ loading: true });
    try {
      const name = cleanName(displayName);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);

      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        displayName: name,
        avatarId,
        profileInitialized: false,
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, "players", cred.user.uid, "identity", "core"), {
        avatarId,
        badgeId: null,
        updatedAt: Date.now(),
      });

      usePlayerStore.getState().setNickname(name);
      usePlayerStore.getState().setAvatar(avatarId);
      set({ user: cred.user });
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email.trim());
  },

  mergeLocalProgressToCloud: async () => {
    const { user, cloudProfile } = get();
    if (!user || !cloudProfile || cloudProfile.profileInitialized === true) return;

    const player = usePlayerStore.getState();
    const displayName = cleanName(player.nickname ?? user.displayName);
    const avatarId = player.avatarId ?? cloudProfile.avatarId ?? DEFAULT_AVATAR;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      displayName,
      avatarId,
      profileInitialized: true,
      emailVerified: user.emailVerified,
      mergedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      mergeVersion: "PLAYER_STATE_IN_PLAYERS_DOCUMENT",
    }, { merge: true });

    await usePlayerStore.getState().flushQueue(user.uid);

    set({
      cloudProfile: { ...cloudProfile, displayName, avatarId, xp: player.xp, level: player.level, coins: player.coins, profileInitialized: true },
      needsMergePrompt: false,
      justMerged: true,
    });
  },

  startFreshAccount: async () => {
    const { user } = get();
    if (!user) return;
    const displayName = cleanName(user.displayName);

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      displayName,
      avatarId: DEFAULT_AVATAR,
      profileInitialized: true,
      emailVerified: user.emailVerified,
      mergedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      mergeVersion: "PLAYER_STATE_IN_PLAYERS_DOCUMENT",
    }, { merge: true });

    usePlayerStore.setState({ xp: 0, level: 1, coins: 0, nickname: displayName, avatarId: DEFAULT_AVATAR, version: 0 });
    await usePlayerStore.getState().flushQueue(user.uid);
    set({ cloudProfile: { email: user.email, displayName, avatarId: DEFAULT_AVATAR, xp: 0, level: 1, coins: 0, profileInitialized: true, createdAt: null }, needsMergePrompt: false, justMerged: false });
  },

  logout: async () => {
    await signOut(auth);
    usePlayerStore.getState().resetGuestIdentity();
    useIdentityStore.setState({ identity: null, loading: false });
    set({ user: null, cloudProfile: null, needsMergePrompt: false, justMerged: false, loading: false });
  },

  deleteAccount: async (password) => {
    const current = auth.currentUser;
    if (!current || !current.email) throw new Error("No signed-in email account found.");
    if (!password) throw new Error("Password is required to delete this account.");

    const credential = EmailAuthProvider.credential(current.email, password);
    await reauthenticateWithCredential(current, credential);

    await Promise.allSettled([
      deleteDoc(doc(db, "users", current.uid)),
      deleteDoc(doc(db, "players", current.uid)),
      deleteDoc(doc(db, "players", current.uid, "identity", "core")),
    ]);

    await deleteUser(current);
    usePlayerStore.getState().setUserId(null);
    usePlayerStore.getState().resetGuestIdentity();
    useIdentityStore.setState({ identity: null, loading: false });
    set({ user: null, cloudProfile: null, needsMergePrompt: false, justMerged: false, loading: false });
  },
}));



