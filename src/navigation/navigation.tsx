// src/navigation/navigation.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { useTheme } from "../hooks/useTheme";
import HomeScreen from "../screens/HomeScreen";
import PacksScreen from "../screens/PacksScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TabIcons from "./TabIcons";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  const { theme } = useTheme();

  const navTheme = {
    dark: theme.background !== "#FFFFFF",
    colors: {
      ...((theme.background !== "#FFFFFF" ? DarkTheme : DefaultTheme).colors),
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.glow,
      primary: theme.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          ...TabIcons(route.name),
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.glow,
            height: 65,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.text,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Packs" component={PacksScreen} />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
