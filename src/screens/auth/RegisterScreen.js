// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, Card, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerStudent } from '../../store/authSlice';

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await dispatch(
        registerStudent({ name, email, password })
      ).unwrap();

      Alert.alert('Success', 'Student registration successful!');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Title style={[styles.title, { color: theme.colors.primary }]}>Student Registration</Title>
            <Paragraph>Join the community</Paragraph>
          </View>

          <Card>
            <Card.Content>
              <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
              <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
              <TextInput label="Password" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={styles.input} />
              <TextInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} mode="outlined" secureTextEntry style={styles.input} />

              <Button mode="contained" onPress={handleRegister} loading={isLoading}>
                Sign Up
              </Button>

              {error && <Paragraph style={{ color: 'red' }}>{error}</Paragraph>}
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold' },
  input: { marginBottom: 16 },
});

export default RegisterScreen;
