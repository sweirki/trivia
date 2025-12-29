// firebase/firebase.ts — Final Expo-Compatible Firebase Setup

import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/auth";

import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";

// -------------------------------------------------------------
// Your Firebase config (from the new project)
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDL2CNlwi2PXbfI0sOu9WaR-LqJqA8nwg0",
  authDomain: "trivia-bca7f.firebaseapp.com",
  projectId: "trivia-bca7f",
  storageBucket: "trivia-bca7f.firebasestorage.app",
  messagingSenderId: "95103599948",
  appId: "1:95103599948:web:ce7e49d6468d51d3cbbbe9",
  measurementId: "G-FP3XTLBZNJ",
};

// -------------------------------------------------------------
// Prevent double initialization of the Firebase app
// -------------------------------------------------------------
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// -------------------------------------------------------------
// Auth (React Native safe)
// -------------------------------------------------------------
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// -------------------------------------------------------------
// Firestore (Expo Safe Mode)
// -------------------------------------------------------------
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  localCache: false,
});

// -------------------------------------------------------------
// Export helpers used in stores/hooks
// -------------------------------------------------------------
export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  User,
};


