// src/screens/ngo/EventManagementScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl,
  Alert, TouchableOpacity, Switch, ActivityIndicator,
} from 'react-native';
import {
  Card, Title, Paragraph, Button, Chip,
  Surface, Divider, Avatar, Searchbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants';

const EventManagementScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { token } = useSelector(state => state.auth);

  const [event, setEvent]             = useState(null);
  const [stats, setStats]             = useState({});
  const [registrations, setRegs]      = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [refreshing, setRefreshing]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickerLoading, setTickerLoading] = useState({}); // { [regId]: bool }
  const [certLoading, setCertLoading]     = useState({}); // { [regId]: bool }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // ─── Load data ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/ngo/events/${eventId}/registrations`,
        authHeader
      );
      setEvent(data.event);
      // 🔥 FIX: Add fallback empty objects/arrays to prevent frontend crashes
      setStats(data.stats || {});
      setRegs(data.registrations ||[]); 
    } catch (err) {
      console.error("Manage Students Fetch Error:", err);
      Alert.alert('Error', 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Filter registrations ─────────────────────────────────────────────────
  useEffect(() => {
    let list = registrations;

    if (selectedTab === 'registered') list = list.filter(r => !r.attended);
    if (selectedTab === 'attended')   list = list.filter(r => r.attended && !r.certificateIssued);
    if (selectedTab === 'certified')  list = list.filter(r => r.certificateIssued);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        r =>
          r.studentName?.toLowerCase().includes(q) ||
          r.studentEmail?.toLowerCase().includes(q) ||
          r.studentCollege?.toLowerCase().includes(q)
      );
    }

    setFiltered(list);
  }, [registrations, selectedTab, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ─── Mark attendance ticker ───────────────────────────────────────────────
  const handleToggleAttendance = async (registration) => {
    const regId = registration._id;
    const newValue = !registration.attended;

    // Optimistic update
    setRegs(prev =>
      prev.map(r =>
        r._id === regId ? { ...r, attended: newValue, status: newValue ? 'completed' : 'registered' } : r
      )
    );
    setTickerLoading(prev => ({ ...prev, [regId]: true }));

    try {
      await axios.post(
        `${API_BASE_URL}/api/ngo/events/${eventId}/registrations/${regId}/attendance`,
        { attended: newValue },
        authHeader
      );
      // Refresh stats
      const { data } = await axios.get(
        `${API_BASE_URL}/api/ngo/events/${eventId}/registrations`,
        authHeader
      );
      setStats(data.stats);
    } catch (err) {
      // Revert optimistic update on failure
      setRegs(prev =>
        prev.map(r =>
          r._id === regId ? { ...r, attended: !newValue } : r
        )
      );
      Alert.alert('Error', 'Failed to update attendance');
    } finally {
      setTickerLoading(prev => ({ ...prev, [regId]: false }));
    }
  };

  // ─── Mark ALL present ──────────────────────────────────────────────────────
  const handleMarkAllAttended = () => {
    const unattended = registrations.filter(r => !r.attended);
    if (unattended.length === 0) {
      Alert.alert('All Done', 'All students are already marked as attended.');
      return;
    }
    Alert.alert(
      'Mark All Present?',
      `This will mark all ${unattended.length} unattended students as present.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const ids = unattended.map(r => r._id);
              await axios.post(
                `${API_BASE_URL}/api/ngo/events/${eventId}/attendance/bulk`,
                { registrationIds: ids, attended: true },
                authHeader
              );
              await loadData();
            } catch {
              Alert.alert('Error', 'Bulk update failed');
            }
          },
        },
      ]
    );
  };

  // ─── Generate & send certificate ─────────────────────────────────────────
  const handleSendCertificate = (registration) => {
    if (!registration.attended) {
      Alert.alert(
        'Not Attended',
        'Please mark this student as attended before issuing a certificate.'
      );
      return;
    }

    Alert.alert(
      '🎓 Send Certificate',
      `Generate an AI certificate and email it to ${registration.studentName} (${registration.studentEmail})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            const regId = registration._id;
            setCertLoading(prev => ({ ...prev, [regId]: true }));
            try {
              await axios.post(
                `${API_BASE_URL}/api/ngo/events/${eventId}/registrations/${regId}/certificate`,
                {},
                authHeader
              );
              Alert.alert(
                '✅ Certificate Sent!',
                `A personalised certificate has been emailed to ${registration.studentName}.`
              );
              await loadData();
            } catch (err) {
              const msg = err?.response?.data?.message || 'Failed to send certificate';
              Alert.alert('Error', msg);
            } finally {
              setCertLoading(prev => ({ ...prev, [regId]: false }));
            }
          },
        },
      ]
    );
  };

  // ─── Send all pending certificates ───────────────────────────────────────
  const handleSendAllCertificates = () => {
    const pending = registrations.filter(r => r.attended && !r.certificateIssued);
    if (pending.length === 0) {
      Alert.alert('Nothing to send', 'All attended students have received their certificates.');
      return;
    }
    Alert.alert(
      `Send ${pending.length} Certificates?`,
      `AI certificates will be generated and emailed to all ${pending.length} attended students.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send All',
          onPress: async () => {
            // Send one by one to avoid rate limiting
            let successCount = 0;
            for (const reg of pending) {
              try {
                await axios.post(
                  `${API_BASE_URL}/api/ngo/events/${eventId}/registrations/${reg._id}/certificate`,
                  {},
                  authHeader
                );
                successCount++;
              } catch {
                // Continue with others even if one fails
              }
            }
            await loadData();
            Alert.alert(
              '✅ Done',
              `${successCount}/${pending.length} certificates sent successfully.`
            );
          },
        },
      ]
    );
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Paragraph style={styles.loadingText}>Loading event details...</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="error-outline" size={48} color="#ef4444" />
          <Paragraph style={styles.loadingText}>Event not found</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Registration card ────────────────────────────────────────────────────
  const RegistrationCard = ({ registration }) => {
    const regId = registration._id;
    const isTickerLoading = tickerLoading[regId];
    const isCertLoading   = certLoading[regId];

    return (
      <Card style={styles.regCard}>
        <Card.Content>
          {/* Header row: avatar + info + attendance toggle */}
          <View style={styles.regHeader}>
            <Avatar.Text
              size={44}
              label={(registration.studentName || 'S').charAt(0).toUpperCase()}
              style={styles.avatar}
            />

            <View style={styles.studentDetails}>
              <Title style={styles.studentName}>{registration.studentName}</Title>
              <Paragraph style={styles.studentMeta}>{registration.studentEmail}</Paragraph>
              {registration.studentCollege ? (
                <Paragraph style={styles.studentMeta}>
                  🏫 {registration.studentCollege}
                </Paragraph>
              ) : null}
              {registration.studentPhone ? (
                <Paragraph style={styles.studentMeta}>
                  📱 {registration.studentPhone}
                </Paragraph>
              ) : null}
            </View>

            {/* Attendance ticker */}
            <View style={styles.tickerContainer}>
              <Paragraph style={styles.tickerLabel}>
                {registration.attended ? 'Present' : 'Absent'}
              </Paragraph>
              {isTickerLoading ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : (
                <Switch
                  value={registration.attended || false}
                  onValueChange={() => handleToggleAttendance(registration)}
                  trackColor={{ false: '#374151', true: '#059669' }}
                  thumbColor={registration.attended ? '#10b981' : '#9ca3af'}
                />
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Status row */}
          <View style={styles.statusRow}>
            <Chip
              style={[
                styles.statusChip,
                {
                  backgroundColor: registration.attended
                    ? '#10b98120'
                    : '#3b82f620',
                },
              ]}
              textStyle={{
                color: registration.attended ? '#10b981' : '#3b82f6',
                fontSize: 11,
              }}
            >
              {registration.attended ? '✓ ATTENDED' : 'REGISTERED'}
            </Chip>

            {registration.certificateIssued && (
              <Chip
                style={styles.certIssuedChip}
                textStyle={styles.certIssuedText}
                icon="verified"
              >
                CERT SENT
              </Chip>
            )}

            <Paragraph style={styles.regDate}>
              Registered {new Date(registration.registeredAt).toLocaleDateString('en-IN')}
            </Paragraph>
          </View>

          {/* Certificate button — only visible if attended + not yet issued */}
          {registration.attended && !registration.certificateIssued && (
            <Button
              mode="contained"
              onPress={() => handleSendCertificate(registration)}
              style={styles.certButton}
              icon="send"
              loading={isCertLoading}
              disabled={isCertLoading}
              contentStyle={styles.certButtonContent}
            >
              Send AI Certificate
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'all',        label: `All (${stats.total || 0})` },
    { key: 'registered', label: `Absent (${(stats.total || 0) - (stats.attended || 0)})` },
    { key: 'attended',   label: `Present (${stats.attended || 0})` },
    { key: 'certified',  label: `Certs (${stats.certificatesIssued || 0})` },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Event info card ─────────────────────────────── */}
        <Card style={styles.eventCard}>
          <Card.Content>
            <Title style={styles.eventTitle}>{event.title}</Title>
            <Paragraph style={styles.eventMeta}>📅 {event.date} at {event.time}</Paragraph>
            <Paragraph style={styles.eventMeta}>📍 {event.location}</Paragraph>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              {[
                { icon: 'people',      color: '#8b5cf6', value: stats.total || 0,            label: 'Registered' },
                { icon: 'check-circle',color: '#10b981', value: stats.attended || 0,          label: 'Attended' },
                { icon: 'verified',    color: '#f59e0b', value: stats.certificatesIssued || 0, label: 'Certs Sent' },
                { icon: 'percent',     color: '#3b82f6', value: `${stats.attendanceRate || 0}%`, label: 'Rate' },
              ].map(s => (
                <Surface key={s.label} style={styles.statBox}>
                  <Icon name={s.icon} size={22} color={s.color} />
                  <Title style={styles.statVal}>{s.value}</Title>
                  <Paragraph style={styles.statLbl}>{s.label}</Paragraph>
                </Surface>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* ── Action buttons ───────────────────────────────── */}
        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            onPress={handleMarkAllAttended}
            icon="check-all"
            style={styles.actionBtn}
            labelStyle={styles.actionBtnLabel}
          >
            Mark All Present
          </Button>
          <Button
            mode="contained"
            onPress={handleSendAllCertificates}
            icon="send"
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            labelStyle={styles.actionBtnLabel}
          >
            Send All Certs
          </Button>
        </View>

        {/* ── Search ───────────────────────────────────────── */}
        <Searchbar
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
          inputStyle={{ color: '#fff' }}
          iconColor="#9ca3af"
          placeholderTextColor="#555"
        />

        {/* ── Tabs ─────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {tabs.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, selectedTab === t.key && styles.activeTab]}
              onPress={() => setSelectedTab(t.key)}
            >
              <Paragraph
                style={[styles.tabText, selectedTab === t.key && styles.activeTabText]}
              >
                {t.label}
              </Paragraph>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── List ─────────────────────────────────────────── */}
        <View style={styles.listContainer}>
          {filtered.length > 0 ? (
            filtered.map(reg => <RegistrationCard key={reg._id} registration={reg} />)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={56} color="#4b5563" />
              <Title style={styles.emptyTitle}>
                {searchQuery ? 'No results found' : 'No students here yet'}
              </Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Students will appear here when they register'}
              </Paragraph>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#9ca3af' },

  // Event card
  eventCard: { margin: 16, backgroundColor: '#1a1d2e' },
  eventTitle: { color: '#fff', fontSize: 20, marginBottom: 6 },
  eventMeta: { color: '#9ca3af', marginBottom: 2 },

  statsGrid: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statBox: {
    flex: 1, alignItems: 'center', backgroundColor: '#0f1117',
    padding: 10, borderRadius: 12,
  },
  statVal: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  statLbl: { color: '#6b7280', fontSize: 11, marginTop: 2 },

  // Action row
  actionRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  actionBtn: { flex: 1, borderColor: '#8b5cf6' },
  actionBtnPrimary: { backgroundColor: '#8b5cf6' },
  actionBtnLabel: { fontSize: 13 },

  // Search
  searchbar: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#1a1d2e' },

  // Tabs
  tabsRow: { paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: '#1a1d2e', borderRadius: 20,
  },
  activeTab: { backgroundColor: '#8b5cf6' },
  tabText: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#fff' },

  // List
  listContainer: { paddingHorizontal: 16, paddingBottom: 40 },

  // Registration card
  regCard: { backgroundColor: '#1a1d2e', marginBottom: 12 },
  regHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: { backgroundColor: '#7c3aed', marginTop: 4 },
  studentDetails: { flex: 1 },
  studentName: { color: '#fff', fontSize: 16, marginBottom: 2 },
  studentMeta: { color: '#9ca3af', fontSize: 12, marginBottom: 1 },

  // Attendance ticker
  tickerContainer: { alignItems: 'center', gap: 4, minWidth: 64 },
  tickerLabel: { color: '#9ca3af', fontSize: 11 },

  divider: { marginVertical: 10, backgroundColor: '#2d3148' },

  // Status row
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    flexWrap: 'wrap', gap: 8, marginBottom: 8,
  },
  statusChip: { height: 26 },
  certIssuedChip: { backgroundColor: '#f59e0b20', height: 26 },
  certIssuedText: { color: '#f59e0b', fontSize: 11 },
  regDate: { color: '#4b5563', fontSize: 11 },

  // Certificate button
  certButton: { marginTop: 8, backgroundColor: '#f59e0b' },
  certButtonContent: { height: 40 },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 24 },
  emptyTitle: { color: '#9ca3af', marginTop: 12, marginBottom: 6 },
  emptyText: { color: '#4b5563', textAlign: 'center', fontSize: 14 },
});

export default EventManagementScreen;