import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Card,
  useTheme,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { loginNGO } from '../../store/authSlice';
import { registerNGO as registerNGOService  } from '../../services/AuthService';

const NGOAuthScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = [
    'Environmental',
    'Education',
    'Health',
    'Community Support',
    'Animal Welfare',
    'Technology',
  ];

  const toggleCategory = category => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(loginNGO({ email, password })).unwrap();
    } catch (err) {
      Alert.alert('Login Failed', err || 'Invalid credentials');
    }
  };

  const handleRegister = async () => {
  if (!name || !email || !password || !organizationName || !registrationNumber) {
    Alert.alert('Error', 'Please fill in all required fields');
    return;
  }

  if (selectedCategories.length === 0) {
    Alert.alert('Error', 'Select at least one category');
    return;
  }

  try {
    const data = await registerNGOService({
      name,
      email,
      password,
      organizationName,
      registrationNumber,
      description,
      contactNumber,
      website,
      categories: selectedCategories,
    });

    console.log("NGO REGISTER SUCCESS:", data);

    Alert.alert('Success', 'NGO registered successfully');
  } catch (err) {
    console.log("NGO REGISTER ERROR:", err?.response?.data || err);
    Alert.alert('Error', err?.response?.data?.message || 'Failed');
  }
};
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Icon name="business" size={48} color={theme.colors.primary} />
            <Title style={styles.title}>
              {isLogin ? 'NGO Login' : 'NGO Registration'}
            </Title>
            <Paragraph style={styles.subtitle}>
              {isLogin
                ? 'Sign in to manage your events'
                : 'Register your organization'}
            </Paragraph>
          </View>

          <Card>
            <Card.Content>
              {isLogin ? (
                <>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                  />

                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submit}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <>
                  <TextInput label="Contact Person *" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
                  <TextInput label="Organization Name *" value={organizationName} onChangeText={setOrganizationName} mode="outlined" style={styles.input} />
                  <TextInput label="Registration Number *" value={registrationNumber} onChangeText={setRegistrationNumber} mode="outlined" style={styles.input} />
                  <TextInput label="Email *" value={email} onChangeText={setEmail} mode="outlined" autoCapitalize="none" style={styles.input} />
                  <TextInput label="Password *" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry={!showPassword} style={styles.input} />
                  <TextInput label="Contact Number" value={contactNumber} onChangeText={setContactNumber} mode="outlined" keyboardType="phone-pad" style={styles.input} />
                  <TextInput label="Website" value={website} onChangeText={setWebsite} mode="outlined" autoCapitalize="none" style={styles.input} />
                  <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} style={styles.input} />

                  <Paragraph style={styles.categoryLabel}>Select Categories *</Paragraph>
                  <View style={styles.chips}>
                    {categories.map(cat => (
                      <Chip
                        key={cat}
                        selected={selectedCategories.includes(cat)}
                        onPress={() => toggleCategory(cat)}
                        style={styles.chip}
                      >
                        {cat}
                      </Chip>
                    ))}
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submit}
                  >
                    Register NGO
                  </Button>
                </>
              )}

              {error && <Paragraph style={styles.error}>{error}</Paragraph>}

              <Button mode="text" onPress={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Register" : 'Already registered? Sign In'}
              </Button>

              <Button mode="text" icon="arrow-left" onPress={() => navigation.goBack()}>
                Back
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
  scroll: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  subtitle: { opacity: 0.7, textAlign: 'center' },
  input: { marginBottom: 12 },
  submit: { marginVertical: 12 },
  categoryLabel: { fontWeight: '600', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { marginRight: 6, marginBottom: 6 },
  error: { color: '#f44336', textAlign: 'center' },
});

export default NGOAuthScreen;
