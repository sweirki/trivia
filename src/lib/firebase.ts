// src/lib/firebase.ts
// -----------------------------------------------------------------------------
// ✅ Firebase Initialization for Mega-WOW Trivia (Expo SDK 54+)
// Includes Firestore, Auth (with persistence), Storage, and Realtime DB.
// Safe for both web and native builds. 100 % compatible with Expo.
// -----------------------------------------------------------------------------

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// ✅ Verified Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzQpvIYr7k2MKNb1BzgE47egkCvvHV09s",
  authDomain: "mega-wow-trivia.firebaseapp.com",
  projectId: "mega-wow-trivia",
  storageBucket: "mega-wow-trivia.firebasestorage.app",
  messagingSenderId: "301013212421",
  appId: "1:301013212421:web:c59d73ee9d44827c13ab6c",
  // ✅ Realtime DB endpoint for RTDB operations
  databaseURL: "https://mega-wow-trivia-default-rtdb.firebaseio.com",
};

// ✅ Initialize Firebase safely (avoid duplicate app instances)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Firestore with persistent local cache (Expo-compatible)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// ✅ Auth with React Native persistence (removes warning)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Storage & Realtime DB handles
export const storage = getStorage(app);
export const realtime = getDatabase(app);

// ✅ Default export
export default app;
