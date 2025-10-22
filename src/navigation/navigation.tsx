import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PacksScreen from '../screens/PacksScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TabIcons from './TabIcons';

const Tab = createBottomTabNavigator();

const Navigation = () => (
  <Tab.Navigator screenOptions={({ route }) => TabIcons(route.name)}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Packs" component={PacksScreen} />
    <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default Navigation;