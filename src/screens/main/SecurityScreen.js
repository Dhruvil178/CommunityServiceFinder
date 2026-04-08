import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TextInput } from 'react-native';
import { Button, Text, Switch, ActivityIndicator, Surface, Portal, Modal } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { updateUser } from '../../store/userSlice';

const BASE_URL = 'http://192.168.0.106:5000/api';

const SecurityScreen = () => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth); // Use authSlice for token
  const user = useSelector(state => state.user);

  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user.twoFactorEnabled ?? false);
  const [isVerified, setIsVerified] = useState(user.isVerified ?? false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Fetch latest security info from backend
  useEffect(() => {
    if (!auth.token) return;

    const fetchSecurity = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/security/status`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        setIs2FAEnabled(res.data.twoFactorEnabled);
        setIsVerified(res.data.isVerified);
        dispatch(updateUser(res.data));
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log(err.response?.data || err.message);
        Alert.alert('Error', 'Failed to fetch security info.');
      }
    };

    fetchSecurity();
  }, [auth.token, dispatch]);

  // Toggle 2FA
  const toggle2FA = async () => {
    if (!isVerified) {
      return Alert.alert('Verify Email', 'You must verify your email before enabling 2FA.');
    }

    try {
      setLoading(true);
      const res = await axios.put(`${BASE_URL}/security/toggle-2fa`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setIs2FAEnabled(res.data.twoFactorEnabled);
      dispatch(updateUser({ twoFactorEnabled: res.data.twoFactorEnabled }));
      setLoading(false);
      Alert.alert('Success', `2FA is now ${res.data.twoFactorEnabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      setLoading(false);
      console.log(err.response?.data || err.message);
      Alert.alert('Error', 'Failed to toggle 2FA.');
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/security/resend-email`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setLoading(false);
      Alert.alert('Success', 'Verification email sent. Check your inbox.');
      setOtpVisible(true);
    } catch (err) {
      setLoading(false);
      console.log(err.response?.data || err.message);
      Alert.alert('Error', 'Failed to send verification email.');
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otpCode) return Alert.alert('Enter OTP', 'Please enter the OTP sent to your email.');

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/security/verify-otp`, { otp: otpCode }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setLoading(false);
      setOtpVisible(false);
      setIsVerified(true);
      dispatch(updateUser({ isVerified: true }));
      Alert.alert('Success', 'Your email is verified!');
    } catch (err) {
      setLoading(false);
      console.log(err.response?.data || err.message);
      Alert.alert('Error', 'Invalid OTP, please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Security Card */}
      <Surface style={styles.card}>
        <Text style={styles.heading}>Security Settings</Text>

        <View style={styles.row}>
          <Text>Email Verified:</Text>
          <Text>{isVerified ? '✅ Verified' : '❌ Not Verified'}</Text>
        </View>

        {!isVerified && (
          <Button mode="contained" style={styles.button} onPress={resendVerificationEmail}>
            Resend Verification Email
          </Button>
        )}

        <View style={styles.row}>
          <Text>Two-Factor Authentication (2FA)</Text>
          <Switch value={is2FAEnabled} onValueChange={toggle2FA} />
        </View>
      </Surface>

      {/* OTP Modal */}
      <Portal>
        <Modal
          visible={otpVisible}
          onDismiss={() => setOtpVisible(false)}
          contentContainerStyle={styles.otpModal}
        >
          <Text style={{ marginBottom: 12, color: '#fff' }}>Enter OTP from your email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor="#999"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="numeric"
          />
          <Button mode="contained" onPress={verifyOtp} style={{ marginTop: 12 }}>
            Verify OTP
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117', padding: 16 },
  card: { padding: 20, borderRadius: 20, backgroundColor: '#1a1d2e', marginBottom: 20, elevation: 3 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  button: { marginTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  otpModal: { backgroundColor: '#1a1d2e', padding: 20, margin: 16, borderRadius: 16 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8 },
});

export default SecurityScreen;
