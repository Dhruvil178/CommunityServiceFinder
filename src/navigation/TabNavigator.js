import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/main/HomeScreen.js';
import EventsScreen from '../screens/main/EventsScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CertificatesScreen from '../screens/main/CertificatesScreen';
import AchievementsScreen from '../screens/main/AchievementsScreen';
import AchievementEngineBridge from '../components/AchievementEngineBridge';
import { theme } from '../utils/theme';

const Tab = createBottomTabNavigator();

const TabNavigator = ({ navigation }) => (
  <>
    <AchievementEngineBridge />
    <Tab.Navigator screenOptions={({ route }) => ({
    tabBarIcon: ({ color, size }) => {
      const icons = {
        Home: 'home',
        Events: 'event',
        Calendar: 'calendar-today',
        Profile: 'person',
        Certificates: 'workspace-premium',
      };
      return <Icon name={icons[route.name]} size={size} color={color} />;
    },
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.outline,
    tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline, height: 60, paddingTop: 5, paddingBottom: 5 },
    headerStyle: { backgroundColor: theme.colors.primary },
    headerTintColor: theme.colors.onPrimary,
    headerTitleStyle: { fontWeight: 'bold' },
  })}>
    <Tab.Screen
  name="Achievements"
  component={AchievementsScreen}
  options={{
    tabBarIcon: ({ color }) => (
      <Icon name="emoji-events" color={color} size={22} />
    ),
  }}
/>
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="Events" component={EventsScreen} options={{ title: 'Find Events' }} />
    <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} initialParams={{ parentNavigation: navigation }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Tab.Screen name="Certificates" component={CertificatesScreen} options={{ title: 'Certificates' }} />
  </Tab.Navigator>
  </>
);

export default TabNavigator;
