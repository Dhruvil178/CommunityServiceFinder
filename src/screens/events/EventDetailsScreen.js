import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';

export default function EventDetailsScreen({ route, navigation }) {
  const { event } = route.params;
  const user = useSelector(state => state.auth.user);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Check if user is already registered for this event
    if (user && event.registrations && Array.isArray(event.registrations)) {
      const userId = user.id || user._id || user.uid;
      const isAlreadyRegistered = event.registrations.some(reg => {
        const regUserId = reg.userId && (reg.userId.toString ? reg.userId.toString() : reg.userId);
        return (
          regUserId === userId ||
          (user.email && reg.studentEmail?.toLowerCase() === user.email.toLowerCase())
        );
      });
      setIsRegistered(isAlreadyRegistered);
    }
  }, [event, user]);

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: event.image || 'https://via.placeholder.com/400x200.png?text=Event+Image' }} 
        style={styles.image} 
      />

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{event.date} at {event.time}</Text>
      <Text style={styles.location}>{event.location}</Text>

      <Text style={styles.description}>{event.description}</Text>

      {isRegistered ? (
        <View style={styles.registeredButton}>
          <Text style={styles.registeredButtonText}>✓ Registered</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("EventRegistration", { event })}
        >
          <Text style={styles.buttonText}>Register for Event</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#0D0D0D",
    flex: 1,
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8
  },
  date: {
    fontSize: 16,
    color: "#BBBBBB",
    marginBottom: 4
  },
  location: {
    fontSize: 16,
    color: "#BBBBBB",
    marginBottom: 16
  },
  description: {
    fontSize: 16,
    color: "#DDDDDD",
    marginBottom: 24,
    lineHeight: 22
  },
  button: {
    backgroundColor: "#1E90FF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },
  registeredButton: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40
  },
  registeredButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  }
});