// src/screens/events/EventRegistrationScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants'; // adjust path as needed

export default function EventRegistrationScreen({ route, navigation }) {
  const { event } = route.params;

  // Pull logged-in student info from Redux so we pre-fill the form
  const { user, token } = useSelector(state => state.auth);

  const [name, setName]   = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [college, setCollege] = useState(user?.college || '');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/events/${event._id || event.id}/register`,
        {
          studentName:  name.trim(),
          studentEmail: email.trim(),
          studentPhone: phone.trim(),
          studentCollege: college.trim(),
          userId: user?._id || user?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert(
        '🎉 Registered!',
        `You have successfully registered for "${event.title}". See you there!`,
        [
          {
            text: 'View My Events',
            onPress: () => navigation.navigate('Calendar'),
          },
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      const msg =
        error?.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Event title */}
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventMeta}>
        📅 {event.date} at {event.time}
      </Text>
      <Text style={styles.eventMeta}>📍 {event.location}</Text>

      <View style={styles.divider} />

      <Text style={styles.header}>Your Registration Details</Text>

      {/* Full Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#666"
        />
      </View>

      {/* Email */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Phone */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
        />
      </View>

      {/* College */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>College / Institution</Text>
        <TextInput
          value={college}
          onChangeText={setCollege}
          style={styles.input}
          placeholder="Your college name"
          placeholderTextColor="#666"
        />
      </View>

      {/* Spots indicator */}
      {event.spotsAvailable !== undefined && (
        <Text style={styles.spotsText}>
          {event.spotsAvailable > 0
            ? `✅ ${event.spotsAvailable} spots remaining`
            : '⚠️ This event is full'}
        </Text>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Registration</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    padding: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    marginTop: 8,
  },
  eventMeta: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 20,
  },
  header: {
    fontSize: 17,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 18,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  spotsText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});