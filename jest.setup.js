// Test bootstrap for Expo/React Native modules used by pure logic tests.
// Keep this file small; add mocks here only when a test actually needs them.

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "Light",
    Medium: "Medium",
    Heavy: "Heavy",
  },
  NotificationFeedbackType: {
    Success: "Success",
    Warning: "Warning",
    Error: "Error",
  },
}));

jest.mock("expo-av", () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(async () => ({
        sound: {
          playAsync: jest.fn(),
          stopAsync: jest.fn(),
          unloadAsync: jest.fn(),
          setPositionAsync: jest.fn(),
          setVolumeAsync: jest.fn(),
        },
      })),
    },
  },
}));

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require(
      "@react-native-async-storage/async-storage/jest/async-storage-mock"
    )
);