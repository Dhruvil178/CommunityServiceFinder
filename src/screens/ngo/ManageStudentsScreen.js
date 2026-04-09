import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import api from '../../services/api';

const getStudentIdFromRegistration = registration => {
  const rawId = registration?.userId;
  if (!rawId) return null;

  if (typeof rawId === 'string') return rawId;
  if (typeof rawId === 'object' && rawId._id) return rawId._id.toString();

  const parsed = rawId.toString?.();
  if (!parsed || parsed === '[object Object]') return null;
  return parsed;
};

const getStudentIdFromAttendanceRecord = record => {
  const rawId = record?.studentId?._id || record?.studentId;
  if (!rawId) return null;
  return rawId.toString?.() || null;
};

export default function ManageStudentsScreen({ route }) {
  const eventId = route.params?.eventId || route.params?.event?._id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [markAttendanceLoading, setMarkAttendanceLoading] = useState(false);
  const [certLoading, setCertLoading] = useState(null);

  const getAttendanceStatus = registration => {
    const studentId = getStudentIdFromRegistration(registration);
    if (studentId && attendanceMap[studentId]) {
      return attendanceMap[studentId];
    }

    return registration.attended ? 'present' : 'absent';
  };

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [{ data }, { data: attendanceData }] = await Promise.all([
        api.get(`/ngo/events/${eventId}/registrations`),
        api.get(`/attendance/${eventId}`),
      ]);

      const registrationsData = data?.registrations || [];

      setEventData(data?.event || null);
      setRegistrations(registrationsData);
      setStats(data?.stats || null);

      const nextAttendanceMap = {};

      registrationsData.forEach(registration => {
        const studentId = getStudentIdFromRegistration(registration);
        if (studentId) {
          nextAttendanceMap[studentId] = registration.attended ? 'present' : 'absent';
        }
      });

      (attendanceData?.attendance || []).forEach(record => {
        const studentId = getStudentIdFromAttendanceRecord(record);
        if (studentId) {
          nextAttendanceMap[studentId] = record.status;
        }
      });

      setAttendanceMap(nextAttendanceMap);
    } catch (error) {
      console.error('Fetch registrations error:', error);
      Alert.alert('Error', 'Failed to load student data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleToggleAttendance = registration => {
    const studentId = getStudentIdFromRegistration(registration);
    if (!studentId) {
      Alert.alert('Unavailable', 'This registration is not linked to a student account.');
      return;
    }

    setAttendanceMap(prev => {
      const currentStatus =
        prev[studentId] || (registration.attended ? 'present' : 'absent');

      return {
        ...prev,
        [studentId]: currentStatus === 'present' ? 'absent' : 'present',
      };
    });
  };

  const handleMarkAttendance = async () => {
    const payloads = registrations
      .map(registration => {
        const studentId = getStudentIdFromRegistration(registration);
        if (!studentId) return null;

        return {
          registrationId: registration._id,
          studentId,
          status: getAttendanceStatus(registration),
        };
      })
      .filter(Boolean);

    if (payloads.length === 0) {
      Alert.alert('No linked students', 'No registrations are linked to student accounts.');
      return;
    }

    setMarkAttendanceLoading(true);

    try {
      await Promise.all(
        payloads.map(payload =>
          api.post('/attendance/mark', {
            eventId,
            studentId: payload.studentId,
            status: payload.status,
          })
        )
      );

      const statusByRegistrationId = payloads.reduce((acc, item) => {
        acc[item.registrationId] = item.status;
        return acc;
      }, {});

      setRegistrations(prev =>
        prev.map(registration => {
          const status = statusByRegistrationId[registration._id];
          if (!status) return registration;

          const isPresent = status === 'present';
          return {
            ...registration,
            attended: isPresent,
            attendedAt: isPresent ? new Date().toISOString() : null,
            status: isPresent ? 'completed' : 'registered',
          };
        })
      );

      Alert.alert('Success', 'Attendance marked successfully.');
      await fetchRegistrations();
    } catch (error) {
      const message =
        (typeof error === 'string' && error) ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to mark attendance.';
      Alert.alert('Error', message);
    } finally {
      setMarkAttendanceLoading(false);
    }
  };

  const handleIssueCertificate = async registrationId => {
    setCertLoading(registrationId);
    try {
      const response = await api.post(
        `/ngo/events/${eventId}/registrations/${registrationId}/certificate`,
        {}
      );
      Alert.alert('Success', response.data.message);
      fetchRegistrations();
    } catch (error) {
      console.error('Certificate error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to issue certificate.');
    } finally {
      setCertLoading(null);
    }
  };

  const renderStudent = ({ item }) => {
    const selectedStatus = getAttendanceStatus(item);
    const isPresent = selectedStatus === 'present';
    const hasLinkedStudent = Boolean(getStudentIdFromRegistration(item));

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.studentEmail}>{item.studentEmail}</Text>
          <Text style={styles.studentPhone}>{item.studentPhone || 'No Phone'}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.button,
              isPresent ? styles.buttonAttended : styles.buttonPending,
              !hasLinkedStudent && styles.buttonDisabled,
            ]}
            onPress={() => handleToggleAttendance(item)}
            disabled={!hasLinkedStudent}
          >
            <Text style={styles.buttonText}>{isPresent ? 'Present' : 'Absent'}</Text>
          </TouchableOpacity>

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

          {item.certificateIssued && (
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeText}>Cert Issued</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

      <View style={styles.markAttendanceContainer}>
        <TouchableOpacity
          style={[
            styles.markAttendanceButton,
            markAttendanceLoading && styles.markAttendanceButtonDisabled,
          ]}
          onPress={handleMarkAttendance}
          disabled={markAttendanceLoading}
        >
          {markAttendanceLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.markAttendanceButtonText}>Mark Attendance</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={registrations}
        keyExtractor={item => item._id}
        renderItem={renderStudent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No students registered yet.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1E90FF' },
  statLabel: { fontSize: 12, color: '#BBB', marginTop: 4 },
  markAttendanceContainer: { paddingHorizontal: 16, paddingTop: 12 },
  markAttendanceButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAttendanceButtonDisabled: { opacity: 0.7 },
  markAttendanceButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  listContent: { padding: 16 },
  studentCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  studentInfo: { marginBottom: 12 },
  studentName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  studentEmail: { fontSize: 14, color: '#BBB', marginTop: 4 },
  studentPhone: { fontSize: 14, color: '#888', marginTop: 2 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPending: { backgroundColor: '#444' },
  buttonAttended: { backgroundColor: '#28a745' },
  buttonCert: { backgroundColor: '#ff9800' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  badgeSuccess: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#28a745', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});
