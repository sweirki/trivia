import { Ionicons } from '@expo/vector-icons';

const iconMap = {
  Home: 'home',
  Packs: 'albums',
  Leaderboard: 'trophy',
  Profile: 'person',
};

const TabIcons = (routeName) => ({
  tabBarIcon: ({ color, size }) => (
    <Ionicons name={iconMap[routeName]} size={size} color={color} />
  ),
  tabBarActiveTintColor: '#007AFF',
  tabBarInactiveTintColor: 'gray',
});

export default TabIcons;