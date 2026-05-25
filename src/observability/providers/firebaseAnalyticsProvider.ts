import { Platform } from "react-native";
import {
  getAnalytics,
  isSupported,
  logEvent,
  setUserId,
  setUserProperties,
  type Analytics,
} from "firebase/analytics";

import { app } from "@/firebase/firebase";

import type {
  AnalyticsEventName,
  AnalyticsPrimitive,
  AnalyticsProperties,
  AnalyticsProvider,
} from "../analytics";

const FIREBASE_EVENT_NAME_MAX_LENGTH = 40;
const FIREBASE_PROPERTY_NAME_MAX_LENGTH = 40;

function toFirebaseSafeName(name: string) {
  return name
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/^[^A-Za-z]/, "event_$&")
    .slice(0, FIREBASE_EVENT_NAME_MAX_LENGTH);
}

function toFirebaseSafeProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        toFirebaseSafeName(key).slice(0, FIREBASE_PROPERTY_NAME_MAX_LENGTH),
        value as Exclude<AnalyticsPrimitive, undefined>,
      ])
  );
}

let analyticsInstancePromise: Promise<Analytics | null> | null = null;

async function getFirebaseAnalytics() {
  if (Platform.OS !== "web") {
    return null;
  }

  analyticsInstancePromise ??= isSupported()
    .then((supported) => (supported ? getAnalytics(app) : null))
    .catch(() => null);

  return analyticsInstancePromise;
}

export function createFirebaseAnalyticsProvider(): AnalyticsProvider {
  return {
    async trackEvent(
      name: AnalyticsEventName,
      properties: AnalyticsProperties = {}
    ) {
      const analytics = await getFirebaseAnalytics();
      if (!analytics) return;

      logEvent(
        analytics,
        toFirebaseSafeName(name),
        toFirebaseSafeProperties(properties)
      );
    },

    async setUserId(userId: string | null) {
      const analytics = await getFirebaseAnalytics();
      if (!analytics) return;

      setUserId(analytics, userId);
    },

    async setUserProperties(properties: AnalyticsProperties) {
      const analytics = await getFirebaseAnalytics();
      if (!analytics) return;

      setUserProperties(analytics, toFirebaseSafeProperties(properties));
    },
  };
}


