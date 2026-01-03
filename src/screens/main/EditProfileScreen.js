import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearError } from '../../store/authSlice';

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector(state => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSave = async () => {
    const result = await dispatch(
      updateProfile({
        name,
        bio,
        phone,
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Bio"
        value={bio}
        onChangeText={setBio}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <TextInput
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        mode="outlined"
        keyboardType="phone-pad"
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        mode="contained"
        loading={isLoading}
        disabled={!name.trim() || isLoading}
        onPress={onSave}
      >
        Save Changes
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
    padding: 16,
  },

  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 16,
  },

  input: {
    marginBottom: 12,
  },

  error: {
    color: '#f87171',
    marginBottom: 12,
  },
});
