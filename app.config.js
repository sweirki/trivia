export default {
  name: "Trivia",
  slug: "trivia",
  version: "1.0.1",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#07111F",
  },
  scheme: "trivia",
  newArchEnabled: true,

  android: {
    package: "com.sweirki.trivia",
    versionCode: 4,
    permissions: ["BILLING"],
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
      backgroundColor: "#07111F",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },

  ios: {
    supportsTablet: true,
    buildNumber: "4",
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 220,
        resizeMode: "contain",
        backgroundColor: "#07111F",
        dark: {
          image: "./assets/images/splash-icon.png",
          backgroundColor: "#07111F"
        }
      }
    ]
  ],

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