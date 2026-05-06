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
          <TextInput label="Name *" value={value} onChangeText={onChange} error={!!errors.name} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="phone"
        rules={{ required: 'Phone Number is required', pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit phone number' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Phone Number *" value={value} onChangeText={onChange} keyboardType="phone-pad" error={!!errors.phone} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="collegeName"
        rules={{ required: 'College Name is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="College Name *" value={value} onChangeText={onChange} error={!!errors.collegeName} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="collegeRollNo"
        rules={{ required: 'College Roll No. is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="College Roll No. *" value={value} onChangeText={onChange} error={!!errors.collegeRollNo} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="collegeUniqueId"
        rules={{ required: 'College Unique ID (SAP ID) is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="College Unique ID (SAP ID) *" value={value} onChangeText={onChange} error={!!errors.collegeUniqueId} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="year"
        rules={{ required: 'Year is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Academic Year *" value={value} onChangeText={onChange} placeholder="e.g., 1st Year, 2nd Year" error={!!errors.year} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Email *" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={!!errors.email} style={styles.input} />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Password *" value={value} onChangeText={onChange} secureTextEntry error={!!errors.password} style={styles.input} />
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
          <TextInput label="Confirm Password *" value={value} onChangeText={onChange} secureTextEntry error={!!errors.confirmPassword} style={styles.input} />
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
