// src/navigation/NGONavigator.js
// Self-contained stack navigator for the entire NGO flow.
// Tab screens + stack screens live in the SAME navigator,
// so navigation.navigate('CreateEvent') always works from any tab screen.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Tab screens
import NGODashboardScreen    from '../screens/ngo/NGODashboardScreen';
import NGOEventsListScreen   from '../screens/ngo/NGOEventsListScreen';
import NGOProfileScreen      from '../screens/ngo/NGOProfileScreen';

// Stack screens
import CreateEventScreen     from '../screens/ngo/CreateEventScreen';
import EventManagementScreen from '../screens/ngo/EventManagementScreen';
import SecurityScreen        from '../screens/main/SecurityScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const HEADER_OPTS = {
  headerStyle:      { backgroundColor: '#121212' },
  headerTintColor:  '#fff',
  headerTitleStyle: { fontWeight: '600' },
};

// ── Inner tab navigator ───────────────────────────────────────────────────────
function NGOTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'dashboard',
            Events:    'event',
            Profile:   'business',   // MaterialIcons ✓ (used via Icon, not Paper)
          };
          return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
        tabBarActiveTintColor:   '#8b5cf6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor:  '#1f2937',
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={NGODashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Events"    component={NGOEventsListScreen} options={{ title: 'My Events' }} />
      <Tab.Screen name="Profile"   component={NGOProfileScreen}    options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ── Outer stack navigator (wraps tabs + all NGO stack screens) ────────────────
export default function NGONavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Default screen — shows the tab bar */}
      <Stack.Screen name="NGOTabs" component={NGOTabs} />

      {/* All NGO stack screens — accessible from ANY tab screen
          via navigation.navigate('CreateEvent') etc. */}
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ headerShown: true, title: 'Create Event', ...HEADER_OPTS }}
      />
      <Stack.Screen
        name="EventManagement"
        component={EventManagementScreen}
        options={{ headerShown: true, title: 'Manage Event', ...HEADER_OPTS }}
      />
      <Stack.Screen
        name="NGOEvents"
        component={NGOEventsListScreen}
        options={{ headerShown: true, title: 'My Events', ...HEADER_OPTS }}
      />
      <Stack.Screen
        name="NGOProfile"
        component={NGOProfileScreen}
        options={{ headerShown: true, title: 'Profile', ...HEADER_OPTS }}
      />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ headerShown: true, title: 'Security Settings', ...HEADER_OPTS }}
      />
    </Stack.Navigator>
  );
}