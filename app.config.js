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
    package: "com.trivia",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },

  ios: {
    supportsTablet: true,
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
};
