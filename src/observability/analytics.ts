export type AnalyticsEventName =
  | "app_opened"
  | "screen_viewed"
  | "auth_login_started"
  | "auth_login_succeeded"
  | "auth_login_failed"
  | "auth_signup_started"
  | "auth_signup_succeeded"
  | "auth_signup_failed"
  | "auth_password_reset_started"
  | "auth_password_reset_sent"
  | "auth_password_reset_failed"
  | "onboarding_completed"
  | "game_started"
  | "answer_selected"
  | "game_completed"
  | "daily_reward_claimed"
  | "arena_entered"
  | "store_opened"
  | "store_tab_selected"
  | "store_item_viewed"
  | "purchase_started"
  | "purchase_failed"
  | "purchase_completed"
  | "cosmetic_purchase_started"
  | "cosmetic_purchase_completed"
  | "settings_opened"
  | "sync_state_changed"
  | "crash_test_triggered";

export type AnalyticsPrimitive = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsPrimitive>;

export type AnalyticsProvider = {
  trackEvent: (
    name: AnalyticsEventName,
    properties?: AnalyticsProperties
  ) => void | Promise<void>;
  setUserId?: (userId: string | null) => void | Promise<void>;
  setUserProperties?: (properties: AnalyticsProperties) => void | Promise<void>;
};

const isTestEnv =
  process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);

let analyticsEnabled = true;
let analyticsProvider: AnalyticsProvider | null = null;
let currentUserId: string | null = null;

function sanitizeProperties(
  properties: AnalyticsProperties = {}
): AnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => {
      return (
        value === null ||
        value === undefined ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      );
    })
  );
}

export function initializeAnalytics(provider: AnalyticsProvider | null) {
  analyticsProvider = provider;
}

export function setAnalyticsEnabled(enabled: boolean) {
  analyticsEnabled = enabled;
}

export function isAnalyticsEnabled() {
  return analyticsEnabled;
}

export async function setAnalyticsUserId(userId: string | null) {
  currentUserId = userId;

  if (!analyticsEnabled) return;

  try {
    await analyticsProvider?.setUserId?.(userId);
  } catch (error) {
    if (__DEV__ && !isTestEnv) {
      console.warn("[analytics] setUserId failed", error);
    }
  }
}

export async function setAnalyticsUserProperties(
  properties: AnalyticsProperties
) {
  if (!analyticsEnabled) return;

  try {
    await analyticsProvider?.setUserProperties?.(
      sanitizeProperties(properties)
    );
  } catch (error) {
    if (__DEV__ && !isTestEnv) {
      console.warn("[analytics] setUserProperties failed", error);
    }
  }
}

export async function trackEvent(
  name: AnalyticsEventName,
  properties: AnalyticsProperties = {}
) {
  if (!analyticsEnabled) return;

  const payload = sanitizeProperties({
    ...properties,
    userId: currentUserId,
  });

  try {
    await analyticsProvider?.trackEvent(name, payload);

    if (__DEV__ && !analyticsProvider && !isTestEnv) {
      console.log("[analytics]", name, payload);
    }
  } catch (error) {
    if (__DEV__ && !isTestEnv) {
      console.warn("[analytics] trackEvent failed", name, error);
    }
  }
}

export function trackScreenView(
  screenName: string,
  properties: AnalyticsProperties = {}
) {
  return trackEvent("screen_viewed", {
    screenName,
    ...properties,
  });
}


