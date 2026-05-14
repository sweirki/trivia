export default {
  name: "Trivia",
  slug: "trivia",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  scheme: "trivia",
  newArchEnabled: true,

  android: {
    package: "com.sweirki.trivia",
    versionCode: 3,
    permissions: ["BILLING"],
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },

  ios: {
    supportsTablet: true,
    buildNumber: "3",
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: ["expo-router"],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    eas: {
      projectId: "cbc00658-c6b8-4ddf-b396-378a53ceb701",
    },
  },
};