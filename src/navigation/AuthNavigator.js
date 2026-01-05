// src/navigation/AuthNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserTypeSelectionScreen from '../screens/auth/UserTypeSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import NGOAuthScreen from '../screens/ngo/NGOAuthScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* User Type Selection - First Screen */}
      <Stack.Screen 
        name="UserTypeSelection" 
        component={UserTypeSelectionScreen} 
      />

      {/* Student Auth Flow */}
      <Stack.Screen 
        name="StudentAuth" 
        component={StudentAuthStack} 
      />

      {/* NGO Auth Flow */}
      <Stack.Screen 
        name="NGOAuth" 
        component={NGOAuthScreen}
        options={{
          headerShown: true,
          title: 'NGO Authentication',
          headerStyle: { backgroundColor: '#0f1117' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

// Student Auth Sub-Stack
const StudentAuthStack = () => {
  const StudentStack = createNativeStackNavigator();
  
  return (
    <StudentStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StudentStack.Screen name="Login" component={LoginScreen} />
      <StudentStack.Screen name="Register" component={RegisterScreen} />
      <StudentStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </StudentStack.Navigator>
  );
};

export default AuthNavigator;