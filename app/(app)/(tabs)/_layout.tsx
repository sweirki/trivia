import { Tabs } from "expo-router";
import { useTheme } from "@/theme";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: "rgba(143,183,217,0.18)",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#8FB7D9",
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    />
  );
}




