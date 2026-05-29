// app/play/(screens)/_layout.tsx
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="categorySelect" />
      <Stack.Screen name="quick" />
      <Stack.Screen name="game" />
      <Stack.Screen name="result" />

    </Stack>
  );
}






