import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function EventDetailsScreen({ route, navigation }) {
  const { event } = route.params; 

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

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("EventRegistration", { event })}
      >
        <Text style={styles.buttonText}>Register for Event</Text>
      </TouchableOpacity>
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
  }
});