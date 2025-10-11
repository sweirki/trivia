import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      initialRouteName="trivia" // ✅ Injected line: makes Trivia the starting hub
      screenOptions={{
        headerStyle: { backgroundColor: '#0A0A0F' },
        headerTintColor: '#00BFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mega-Wow Trivia' }} />
      <Stack.Screen name="trivia" options={{ title: 'Trivia' }} />
      <Stack.Screen name="shop" options={{ title: 'Shop' }} />
      <Stack.Screen name="ladder" options={{ title: 'Ladder' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="live/duel" />
      <Stack.Screen name="live/tournament" />
      <Stack.Screen name="live/daily" />
      <Stack.Screen name="live/survival" />
      <Stack.Screen name="live/liveLobby" />
      <Stack.Screen name="live/liveResults" />
    </Stack>
  );
}