import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';

import NGODashboardScreen from '../screens/ngo/NGODashboardScreen';
import NGOEventsListScreen from '../screens/ngo/NGOEventsListScreen';
import NGOProfileScreen from '../screens/ngo/NGOProfileScreen';

const Tab = createBottomTabNavigator();

const NGOTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'dashboard',
            Events: 'event',
            Profile: 'business',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: { backgroundColor: theme.colors.surface },
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
      })}
    >
      <Tab.Screen name="Dashboard" component={NGODashboardScreen} />
      <Tab.Screen name="Events" component={NGOEventsListScreen} options={{ title: 'My Events' }} />
      <Tab.Screen name="Profile" component={NGOProfileScreen} />
    </Tab.Navigator>
  );
};

export default NGOTabNavigator;
