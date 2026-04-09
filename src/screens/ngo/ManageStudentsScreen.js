import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// IMPORTANT: Use your local IP if testing on a real device (e.g., 'http://192.168.1.X:5000')
const BASE_URL = 'http://10.0.2.2:5000'; 

export default function ManageStudentsScreen({ route, navigation }) {
  // Accept either eventId directly or the full event object
  const eventId = route.params?.eventId || route.params?.event?._id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [eventData, setEventData] = useState(null);
  const[registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const[certLoading, setCertLoading] = useState(null); // Track which cert is loading

  const fetchRegistrations = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // or 'ngoToken', depending on what you named it
      const response = await axios.get(`${BASE_URL}/api/ngo/events/${eventId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEventData(response.data.event);
      setRegistrations(response.data.registrations);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Fetch registrations error:", error);
      Alert.alert("Error", "Failed to load student data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchRegistrations();
  }, [eventId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRegistrations();
  },[]);

  const handleToggleAttendance = async (registrationId, currentStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/ngo/events/${eventId}/registrations/${registrationId}/attendance`,
        { attended: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh list to show updated stats and status
      fetchRegistrations();
    } catch (error) {
      console.error("Attendance error:", error);
      Alert.alert("Error", "Failed to update attendance.");
    }
  };

  const handleIssueCertificate = async (registrationId) => {
    setCertLoading(registrationId);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/ngo/events/${eventId}/registrations/${registrationId}/certificate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", response.data.message);
      fetchRegistrations(); // Refresh list to hide the button
    } catch (error) {
      console.error("Certificate error:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to issue certificate.");
    } finally {
      setCertLoading(null);
    }
  };

  const renderStudent = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.studentEmail}>{item.studentEmail}</Text>
        <Text style={styles.studentPhone}>{item.studentPhone || 'No Phone'}</Text>
      </View>

      <View style={styles.actionButtons}>
        {/* Attendance Button */}
        <TouchableOpacity 
          style={[styles.button, item.attended ? styles.buttonAttended : styles.buttonPending]}
          onPress={() => handleToggleAttendance(item._id, item.attended)}
        >
          <Text style={styles.buttonText}>{item.attended ? "Attended" : "Mark Attended"}</Text>
        </TouchableOpacity>

        {/* Certificate Button (Only show if attended and not yet issued) */}
        {item.attended && !item.certificateIssued && (
          <TouchableOpacity 
            style={[styles.button, styles.buttonCert]}
            onPress={() => handleIssueCertificate(item._id)}
            disabled={certLoading === item._id}
          >
            {certLoading === item._id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Issue Cert</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Certificate Issued Badge */}
        {item.certificateIssued && (
          <View style={styles.badgeSuccess}>
            <Text style={styles.badgeText}>Cert Issued ✅</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.headerTitle}>{eventData?.title}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Registered</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.attended}</Text>
              <Text style={styles.statLabel}>Attended</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.certificatesIssued}</Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>
          </View>
        </View>
      )}

      {/* Student List */}
      <FlatList
        data={registrations}
        keyExtractor={(item) => item._id}
        renderItem={renderStudent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        ListEmptyComponent={<Text style={styles.emptyText}>No students registered yet.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' }, // Dark theme match
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  statsContainer: { padding: 20, backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderColor: '#333' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 15, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1E90FF' },
  statLabel: { fontSize: 12, color: '#BBB', marginTop: 4 },
  listContent: { padding: 16 },
  studentCard: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  studentInfo: { marginBottom: 12 },
  studentName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  studentEmail: { fontSize: 14, color: '#BBB', marginTop: 4 },
  studentPhone: { fontSize: 14, color: '#888', marginTop: 2 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  button: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  buttonPending: { backgroundColor: '#444' }, // Grey
  buttonAttended: { backgroundColor: '#28a745' }, // Green
  buttonCert: { backgroundColor: '#ff9800' }, // Orange
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  badgeSuccess: { flex: 1, padding: 10, borderRadius: 6, backgroundColor: 'rgba(40, 167, 69, 0.2)', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#28a745', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 }
});