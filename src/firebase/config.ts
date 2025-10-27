// src/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite"; // ✅ lite = JS-only Firestore

const firebaseConfig = {
  apiKey: "AIzaSyCoDJkrIkxSHfTdUKc3XzbzSTQirUFvenA",
  authDomain: "trivia-d6fcc.firebaseapp.com",
  projectId: "trivia-d6fcc",
  storageBucket: "trivia-d6fcc.appspot.com",
  messagingSenderId: "559093032741",
  appId: "1:559093032741:web:0fbd9c5b862b8fb3181ccc",
  measurementId: "G-409NCPEWV1",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // JS-only — no native code
export default app;
