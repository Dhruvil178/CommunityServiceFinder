import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, reset } from "../redux/securitySlice";

const SecurityScreen = () => {
  const dispatch = useDispatch();
  const { loading, message, error } = useSelector((state) => state.security);
  const token = useSelector((state) => state.auth.token); // replace with your auth state

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Error", "All fields are required");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "New passwords do not match");
    }

    dispatch(changePassword({ oldPassword, newPassword, token }))
      .unwrap()
      .then((msg) => {
        Alert.alert("Success", msg);
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
        dispatch(reset());
      })
      .catch((err) => {
        Alert.alert("Error", err);
        dispatch(reset());
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Security Settings</Text>

      <TextInput
        placeholder="Old Password"
        secureTextEntry
        style={styles.input}
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        placeholder="New Password"
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: "#ddd" },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default SecurityScreen;
