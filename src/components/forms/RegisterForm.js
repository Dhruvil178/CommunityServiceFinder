import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

const RegisterForm = ({ onSubmit, loading }) => {
  const { control, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Name" value={value} onChangeText={onChange} error={!!errors.name} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Email" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={!!errors.email} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Password" value={value} onChangeText={onChange} secureTextEntry error={!!errors.password} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: 'Confirm your password',
          validate: (value) => value === password || 'Passwords do not match',
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Confirm Password" value={value} onChangeText={onChange} secureTextEntry error={!!errors.confirmPassword} style={styles.input} />
        )}
      />
      <Button mode="contained" loading={loading} onPress={handleSubmit(onSubmit)} style={styles.button}>
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
});

export default RegisterForm;
