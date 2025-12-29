import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Avatar, TextInput, Button, Title, Paragraph, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setUser } from '../../store/authSlice';

// Dynamically set API base depending on environment
const API_BASE = __DEV__
  ? 'http://192.168.1.5:5000' // <- replace with your computer's local IP & backend port
  : 'https://your-production-server.com';

const ProfileScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update profile API call
  const updateProfileOnServer = async (updatedData) => {
    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT', // or POST depending on your backend
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');
      return data.user; // backend should return updated user object
    } catch (error) {
      throw error;
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and Email cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfileOnServer({ name, email });
      dispatch(setUser(updatedUser)); // update Redux state
      Alert.alert('Success', 'Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.avatarContainer}>
          <Avatar.Image size={100} source={{ uri: user?.avatar }} />
          <Title style={styles.name}>{user?.name}</Title>
          <Paragraph style={styles.joinDate}>Joined on {user?.joinDate}</Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              disabled={!editing || loading}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              disabled={!editing || loading}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
            />
            <Button
              mode={editing ? "contained" : "outlined"}
              onPress={editing ? handleSave : () => setEditing(true)}
              style={styles.editButton}
              loading={loading}
            >
              {editing ? "Save" : "Edit Profile"}
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          color={theme.colors.error}
        >
          Logout
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { padding: 16 },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  name: { marginTop: 12, fontWeight: 'bold', fontSize: 22 },
  joinDate: { opacity: 0.7, fontSize: 14 },
  card: { marginBottom: 24 },
  input: { marginBottom: 16 },
  editButton: { marginTop: 8 },
  logoutButton: { marginTop: 8 },
});

export default ProfileScreen;
