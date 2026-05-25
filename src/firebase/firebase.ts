// src/firebase/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FirebaseAuth from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDL2CNlwi2PXbfI0sOu9WaR-LqJqA8nwg0",
  authDomain: "trivia-bca7f.firebaseapp.com",
  projectId: "trivia-bca7f",
  storageBucket: "trivia-bca7f.firebasestorage.app",
  messagingSenderId: "95103599948",
  appId: "1:95103599948:web:ce7e49d6468d51d3cbbbe9",
};

export const app =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

let authInstance: FirebaseAuth.Auth;

try {
  const maybeCreateAsyncStorage = (AsyncStorage as any).createAsyncStorage;

  const persistence = maybeCreateAsyncStorage
    ? (FirebaseAuth as any).getReactNativePersistence(
        maybeCreateAsyncStorage("app")
      )
    : (FirebaseAuth as any).getReactNativePersistence(AsyncStorage);

  authInstance = (FirebaseAuth as any).initializeAuth(app, {
    persistence,
  });
} catch {
  authInstance = FirebaseAuth.getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);


