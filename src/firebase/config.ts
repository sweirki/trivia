// src/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";         // ✅ Safe for Expo SDK 54
import { getFirestore } from "firebase/firestore";

// --- Firebase web configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCoDJkrIkxSHfTdUKc3XzbzSTQirUFvenA",
  authDomain: "trivia-d6fcc.firebaseapp.com",
  projectId: "trivia-d6fcc",
  storageBucket: "trivia-d6fcc.appspot.com",
  messagingSenderId: "559093032741",
  appId: "1:559093032741:web:0fbd9c5b862b8fb3181ccc",
  measurementId: "G-409NCPEWV1",
};

// --- Initialize the app only once ---
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// --- Web-safe Auth & Firestore (no native crash) ---
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- Optional default export ---
export default app;
