// src/navigation/AppNavigator.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector, useDispatch } from "react-redux";
import { checkAuthState } from "../store/authSlice";

// Navigators
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import NGOTabNavigator from "./NGOTabNavigator";

// Student Screens
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SecurityScreen from '../screens/main/SecurityScreen';
import ChatbotScreen from "../screens/main/ChatbotScreen";
import EventDetailsScreen from "../screens/events/EventDetailsScreen";
import EventRegistrationScreen from "../screens/events/EventRegistrationScreen";
import UpcomingEventsScreen from "../screens/events/UpcomingEventsScreen";

// NGO Screens
import CreateEventScreen from "../screens/ngo/CreateEventScreen";
import EventManagementScreen from "../screens/ngo/EventManagementScreen";

// UI Components
import LoadingScreen from "../components/ui/LoadingScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, userType, isLoading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          /* ============= AUTHENTICATION FLOW ============= */
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userType === 'ngo' ? (
          /* ============= NGO FLOW ============= */
          <>
            <Stack.Screen name="Main" component={NGOTabNavigator} />
            
            {/* NGO-specific screens */}
            <Stack.Screen 
              name="CreateEvent" 
              component={CreateEventScreen}
              options={{ 
                headerShown: true, 
                title: 'Create Event',
                headerStyle: { backgroundColor: '#121212' }, 
                headerTintColor: '#fff' 
              }}
            />
            <Stack.Screen 
              name="EventManagement" 
              component={EventManagementScreen}
              options={{ 
                headerShown: true, 
                title: 'Manage Event',
                headerStyle: { backgroundColor: '#121212' }, 
                headerTintColor: '#fff' 
              }}
            />
            <Stack.Screen 
              name="NGOEvents" 
              component={NGOTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Security" 
              component={SecurityScreen}
              options={{ 
                headerShown: true, 
                title: 'Security Settings',
                headerStyle: { backgroundColor: '#121212' }, 
                headerTintColor: '#fff' 
              }}
            />
          </>
        ) : (
          /* ============= STUDENT FLOW ============= */
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            
            {/* Student-specific screens */}
            <Stack.Screen 
              name="Chatbot" 
              component={ChatbotScreen} 
              options={{ 
                headerShown: true, 
                title: 'AI Assistant',
                headerStyle: { backgroundColor: '#121212' }, 
                headerTintColor: '#fff' 
              }} 
            />
            <Stack.Screen 
              name="EventDetails" 
              component={EventDetailsScreen} 
              options={{ 
                headerShown: true, 
                title: 'Event Details',
                headerStyle: { backgroundColor: '#121212' }, 
                headerTintColor: '#fff' 
              }} 
            />
            <Stack.Screen 
              name="EventRegistration" 
              component={EventRegistrationScreen} 
              options={{ 
                headerShown: true, 
                title: 'Register',
                headerStyle: { backgroundColor: '#121212' }, 
                headerTintColor: '#fff' 
              }} 
            />
            <Stack.Screen 
              name="UpcomingEvents" 
              component={UpcomingEventsScreen} 
              options={{ 
                headerShown: true, 
                title: 'Upcoming Events',
                headerStyle: { backgroundColor: '#121212' }, 
                headerTintColor: '#fff' 
              }} 
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen 
              name="Security" 
              component={SecurityScreen} 
              options={{ 
                headerShown: true, 
                title: 'Security Settings',
                headerStyle: { backgroundColor: '#121212' }, 
                headerTintColor: '#fff' 
              }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}