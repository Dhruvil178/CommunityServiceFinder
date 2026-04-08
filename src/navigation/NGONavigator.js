// src/navigation/NGONavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import NGODashboardScreen from '../screens/ngo/NGODashboardScreen';
import NGOEventsListScreen from '../screens/ngo/NGOEventsListScreen';
import NGOProfileScreen from '../screens/ngo/NGOProfileScreen';
import CreateEventScreen from '../screens/ngo/CreateEventScreen';
import EventManagementScreen from '../screens/ngo/EventManagementScreen';
import SecurityScreen from '../screens/main/SecurityScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HEADER_OPTS = {
  headerStyle: { backgroundColor: '#121212' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' },
};


// ✅ TABS (NO NAVIGATION ISSUES NOW)
function NGOTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'dashboard',
            Events: 'event',
            Profile: 'business',
          };
          return (
            <Icon
              name={icons[route.name] || 'circle'}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#1f2937',
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={NGODashboardScreen} />
      <Tab.Screen name="Events" component={NGOEventsListScreen} />
      <Tab.Screen name="Profile" component={NGOProfileScreen} />
    </Tab.Navigator>
  );
}


// ✅ FINAL NAVIGATOR (FIXED)
export default function NGONavigator() {
  return (
    <Stack.Navigator>

      {/* Tabs as HOME */}
      <Stack.Screen
        name="Home"
        component={NGOTabs}
        options={{ headerShown: false }}
      />

      {/* STACK SCREENS */}
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ title: 'Create Event', ...HEADER_OPTS }}
      />

      <Stack.Screen
        name="EventManagement"
        component={EventManagementScreen}
        options={{ title: 'Manage Event', ...HEADER_OPTS }}
      />

      <Stack.Screen
        name="NGOEvents"
        component={NGOEventsListScreen}
        options={{ title: 'My Events', ...HEADER_OPTS }}
      />

      <Stack.Screen
        name="NGOProfile"
        component={NGOProfileScreen}
        options={{ title: 'Profile', ...HEADER_OPTS }}
      />

      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ title: 'Security Settings', ...HEADER_OPTS }}
      />

    </Stack.Navigator>
  );
}