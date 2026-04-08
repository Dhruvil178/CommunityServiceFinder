// src/navigation/AppNavigator.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthState } from '../store/authSlice';

// Navigators
import AuthNavigator from './AuthNavigator';
import TabNavigator  from './TabNavigator';   // student tabs
import NGONavigator  from './NGONavigator';   // NGO stack + tabs (replaces NGOTabNavigator)

// Student stack screens
import ProfileScreen          from '../screens/main/ProfileScreen';
import EditProfileScreen      from '../screens/main/EditProfileScreen';
import SecurityScreen         from '../screens/main/SecurityScreen';
import ChatbotScreen          from '../screens/main/ChatbotScreen';
import EventDetailsScreen     from '../screens/events/EventDetailsScreen';
import EventRegistrationScreen from '../screens/events/EventRegistrationScreen';
import UpcomingEventsScreen   from '../screens/events/UpcomingEventsScreen';

// UI
import LoadingScreen from '../components/ui/LoadingScreen';

const Stack = createNativeStackNavigator();

const HEADER_OPTS = {
  headerStyle:      { backgroundColor: '#121212' },
  headerTintColor:  '#fff',
  headerTitleStyle: { fontWeight: '600' },
};

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, userType, isLoading } = useSelector(s => s.auth);

  useEffect(() => { dispatch(checkAuthState()); }, [dispatch]);

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {!isAuthenticated ? (
          // ── Auth flow ──────────────────────────────────────────────
          <Stack.Screen name="Auth" component={AuthNavigator} />

        ) : userType === 'ngo' ? (
          // ── NGO flow ───────────────────────────────────────────────
          // NGONavigator is self-contained: tabs + all NGO stack screens
          // No need to register CreateEvent / EventManagement here anymore
          <Stack.Screen name="Main" component={NGONavigator} />

        ) : (
          // ── Student flow ───────────────────────────────────────────
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Chatbot" component={ChatbotScreen}
              options={{ headerShown: true, title: 'AI Assistant', ...HEADER_OPTS }} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen}
              options={{ headerShown: true, title: 'Event Details', ...HEADER_OPTS }} />
            <Stack.Screen name="EventRegistration" component={EventRegistrationScreen}
              options={{ headerShown: true, title: 'Register', ...HEADER_OPTS }} />
            <Stack.Screen name="UpcomingEvents" component={UpcomingEventsScreen}
              options={{ headerShown: true, title: 'Upcoming Events', ...HEADER_OPTS }} />
            <Stack.Screen name="Profile"      component={ProfileScreen} />
            <Stack.Screen name="EditProfile"  component={EditProfileScreen} />
            <Stack.Screen name="Security" component={SecurityScreen}
              options={{ headerShown: true, title: 'Security Settings', ...HEADER_OPTS }} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}