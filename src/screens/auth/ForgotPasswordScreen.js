import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Password reset link sent to your email');
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Title>Reset Password</Title>
        <Paragraph>Enter your email address and we will send you a link to reset your password.</Paragraph>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" mode="outlined" style={styles.input} />
            <Button mode="contained" onPress={handleReset} loading={loading} disabled={loading} style={styles.button}>Send Reset Link</Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  content: { alignItems: 'center' },
  card: { width: '100%', marginTop: 20 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
});

export default ForgotPasswordScreen;
