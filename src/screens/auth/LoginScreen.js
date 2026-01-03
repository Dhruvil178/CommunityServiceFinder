// src/screens/auth/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, Card, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login, clearError } from '../../store/authSlice';

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Navigate to Main when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [isAuthenticated, navigation]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      // Navigation handled by useEffect above
    } catch (err) {
      Alert.alert('Login Failed', err || 'Please check your credentials');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Title style={[styles.title, { color: theme.colors.primary }]}>
              Welcome Back
            </Title>
            <Paragraph style={styles.subtitle}>
              Sign in to continue volunteering
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                error={!!error}
              />
              
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="password"
                style={styles.input}
                error={!!error}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? 'eye-off' : 'eye'} 
                    onPress={() => setShowPassword(!showPassword)} 
                  />
                }
              />

              {error && (
                <Paragraph style={styles.errorText}>
                  {error}
                </Paragraph>
              )}

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Button 
                mode="text" 
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotButton}
              >
                Forgot Password?
              </Button>

              <View style={styles.divider} />

              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Register')}
              >
                Don't have an account? Sign Up
              </Button>
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
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  subtitle: { 
    textAlign: 'center', 
    opacity: 0.7,
    fontSize: 16 
  },
  card: { 
    marginBottom: 20,
    elevation: 4 
  },
  input: { 
    marginBottom: 16 
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center'
  },
  loginButton: { 
    marginTop: 8, 
    marginBottom: 16,
    paddingVertical: 6 
  },
  forgotButton: {
    marginBottom: 8
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16
  }
});

export default LoginScreen;