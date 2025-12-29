import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import ChatbotScreen from "../screens/main/ChatbotScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* AUTH SCREENS */}
        <Stack.Screen name="Auth" component={AuthNavigator} />

        {/* MAIN APP (AFTER LOGIN) */}
        <Stack.Screen name="Main" component={TabNavigator} />

        {/* CHATBOT */}
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
