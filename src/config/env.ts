const readPublicEnv = (name: string) => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
};

export const publicEnv = {
  firebase: {
    apiKey: readPublicEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readPublicEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readPublicEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readPublicEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readPublicEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readPublicEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
  },
  revenueCat: {
    publicSdkKey:
      readPublicEnv("EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY") ||
      readPublicEnv("EXPO_PUBLIC_REVENUECAT_APPLE_KEY") ||
      readPublicEnv("EXPO_PUBLIC_REVENUECAT_PUBLIC_SDK_KEY"),
  },
} as const;

export function hasRequiredFirebaseConfig() {
  return Object.values(publicEnv.firebase).every((value) => value.length > 0);
}

export function getMissingFirebaseConfigKeys() {
  return Object.entries(publicEnv.firebase)
    .filter(([, value]) => value.length === 0)
    .map(([key]) => `firebase.${key}`);
}


