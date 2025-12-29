import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigator from "./TabNavigator";
import EventDetailsScreen from "../screens/events/EventDetailsScreen";
import EventRegistrationScreen from "../screens/events/EventRegistrationScreen";
import UpcomingEventsScreen from "../screens/events/UpcomingEventsScreen";
import ChatbotScreen from "../screens/main/ChatbotScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* Tabs */}
      <Stack.Screen name="Tabs" component={TabNavigator} />

      {/* Events */}
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="EventRegistration" component={EventRegistrationScreen} />
      <Stack.Screen name="UpcomingEvents" component={UpcomingEventsScreen} />

      {/* Chatbot */}
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />

    </Stack.Navigator>
  );
}
