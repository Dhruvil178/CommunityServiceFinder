import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

const LoginForm = ({ onSubmit, loading }) => {
  const { control, handleSubmit, formState: { errors } } = useForm();

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Email"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            style={styles.input}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={!!errors.password}
            style={styles.input}
          />
        )}
      />
      <Button mode="contained" loading={loading} onPress={handleSubmit(onSubmit)} style={styles.button}>
        Sign In
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
});

export default LoginForm;
