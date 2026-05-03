// src/firebase/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";

// -------------------------------------------------------------
// Firebase config
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDL2CNlwi2PXbfI0sOu9WaR-LqJqA8nwg0",
  authDomain: "trivia-bca7f.firebaseapp.com",
  projectId: "trivia-bca7f",
  storageBucket: "trivia-bca7f.firebasestorage.app",
  messagingSenderId: "95103599948",
  appId: "1:95103599948:web:ce7e49d6468d51d3cbbbe9",
};

// -------------------------------------------------------------
// App (singleton)
// -------------------------------------------------------------
export const app =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// -------------------------------------------------------------
// Auth (lazy, safe)
// -------------------------------------------------------------
// -------------------------------------------------------------
// Auth (persistent, React Native safe)
// -------------------------------------------------------------
export const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});


// -------------------------------------------------------------
// Firestore
// -------------------------------------------------------------
export const db = getFirestore(app);
