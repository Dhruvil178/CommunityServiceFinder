// src/screens/ngo/NGODashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Dimensions, Animated,
} from 'react-native';
import { Card, Title, Paragraph, Button, Surface, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchNGOEvents, fetchDashboardStats } from '../../store/ngoSlice';

const { width } = Dimensions.get('window');

// ─── Animated stat card (counts up on mount) ─────────────────────────────────
const StatCard = ({ title, value, icon, color, subtitle, isPercent }) => {
  const anim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: anim, flex: 1 }}>
      <Surface style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statContent}>
          <View style={styles.statInfo}>
            <Paragraph style={styles.statTitle}>{title}</Paragraph>
            <Title style={[styles.statValue, { color }]}>
              {value}{isPercent ? '%' : ''}
            </Title>
            {subtitle ? (
              <Paragraph style={styles.statSubtitle}>{subtitle}</Paragraph>
            ) : null}
          </View>
          <View style={[styles.statIconBg, { backgroundColor: color + '22' }]}>
            <Icon name={icon} size={28} color={color} />
          </View>
        </View>
      </Surface>
    </Animated.View>
  );
};

// ─── Attendance rate ring ─────────────────────────────────────────────────────
const AttendanceRing = ({ rate = 0 }) => {
  const color = rate >= 75 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <Surface style={styles.ringCard}>
      <View style={styles.ringContent}>
        <View style={[styles.ringOuter, { borderColor: color + '33' }]}>
          <View style={[styles.ringInner, { borderColor: color }]}>
            <Title style={[styles.ringValue, { color }]}>{rate}%</Title>
            <Paragraph style={styles.ringLabel}>Attendance</Paragraph>
          </View>
        </View>
        <View style={styles.ringMeta}>
          <Paragraph style={styles.ringTitle}>Overall Rate</Paragraph>
          <Paragraph style={styles.ringDesc}>
            {rate >= 75
              ? '🟢 Excellent turnout'
              : rate >= 50
              ? '🟡 Room to improve'
              : '🔴 Needs attention'}
          </Paragraph>
          <View style={styles.ringBarBg}>
            <View style={[styles.ringBarFill, { width: `${rate}%`, backgroundColor: color }]} />
          </View>
        </View>
      </View>
    </Surface>
  );
};

// ─── Event card ───────────────────────────────────────────────────────────────
const EventCard = ({ event, onManage, onEdit }) => {
  const total = event.spotsTotal || 1;
  const filled = total - (event.spotsAvailable || 0);
  const progress = Math.min((filled / total) * 100, 100);
  const registrationCount = event.registrations?.length || 0;
  const attendedCount = event.registrations?.filter(r => r.attended)?.length || 0;
  const certCount = event.registrations?.filter(r => r.certificateIssued)?.length || 0;

  const statusColor =
    event.status === 'upcoming' ? '#10b981' :
    event.status === 'ongoing'  ? '#f59e0b' : '#6b7280';

  return (
    <Card style={styles.eventCard}>
      <Card.Content>
        {/* Title row */}
        <View style={styles.eventHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Title numberOfLines={2} style={styles.eventTitle}>{event.title}</Title>
            <Paragraph style={styles.eventMeta}>📅 {event.date} at {event.time}</Paragraph>
            <Paragraph style={styles.eventMeta}>📍 {event.location}</Paragraph>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Paragraph style={styles.statusText}>{event.status?.toUpperCase()}</Paragraph>
          </View>
        </View>

        {/* Mini stats row */}
        <View style={styles.miniStats}>
          <View style={styles.miniStat}>
            <Icon name="people" size={15} color="#8b5cf6" />
            <Paragraph style={styles.miniStatText}>{registrationCount} reg.</Paragraph>
          </View>
          <View style={styles.miniStat}>
            <Icon name="check-circle" size={15} color="#10b981" />
            <Paragraph style={styles.miniStatText}>{attendedCount} attended</Paragraph>
          </View>
          <View style={styles.miniStat}>
            <Icon name="verified" size={15} color="#f59e0b" />
            <Paragraph style={styles.miniStatText}>{certCount} certs</Paragraph>
          </View>
        </View>

        {/* Fill progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: progress > 80 ? '#10b981' : '#8b5cf6',
                },
              ]}
            />
          </View>
          <Paragraph style={styles.progressLabel}>
            {Math.round(progress)}% full
          </Paragraph>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            compact
            onPress={onEdit}
            style={styles.editBtn}
            labelStyle={styles.btnLabel}
            icon="pencil"
          >
            Edit
          </Button>
          <Button
            mode="contained"
            compact
            onPress={onManage}
            style={styles.manageBtn}
            labelStyle={styles.btnLabel}
            icon="group"
          >
            Manage Students
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
const NGODashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { events, dashboardStats, isLoading } = useSelector(state => state.ngo);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    dispatch(fetchNGOEvents());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const ongoingEvents  = events.filter(e => e.status === 'ongoing');
  const recentCompleted = events
    .filter(e => e.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 2);

  const s = dashboardStats || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Welcome header ─────────────────────────────── */}
        <LinearGradient colors={['#7c3aed', '#ec4899']} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Paragraph style={styles.welcomeText}>Welcome back,</Paragraph>
              <Title style={styles.ngoName} numberOfLines={1}>
                {user?.organizationName || 'Your NGO'}
              </Title>
              {s.eventsThisMonth !== undefined && (
                <Paragraph style={styles.headerSub}>
                  {s.eventsThisMonth} event{s.eventsThisMonth !== 1 ? 's' : ''} this month
                </Paragraph>
              )}
            </View>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => navigation.navigate('NGOProfile')}
            >
              <Icon name="business" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Stats grid ─────────────────────────────────── */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Overview</Title>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Events"
              value={s.totalEvents || 0}
              icon="event"
              color="#6366f1"
              subtitle="All time"
            />
            <StatCard
              title="Active"
              value={s.activeEvents || 0}
              icon="event-available"
              color="#10b981"
              subtitle="Upcoming + ongoing"
            />
          </View>
          <View style={[styles.statsRow, { marginTop: 10 }]}>
            <StatCard
              title="Volunteers"
              value={s.totalRegistrations || 0}
              icon="people"
              color="#8b5cf6"
              subtitle="Total registered"
            />
            <StatCard
              title="Certs Sent"
              value={s.totalCertificates || 0}
              icon="verified"
              color="#f59e0b"
              subtitle="AI certificates"
            />
          </View>
        </View>

        {/* ── Attendance ring ─────────────────────────────── */}
        <View style={styles.section}>
          <AttendanceRing rate={s.attendanceRate || 0} />
        </View>

        {/* ── Quick actions ───────────────────────────────── */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.quickActions}>
            {[
              {
                label: 'Create Event',
                icon: 'add-circle',
                colors: ['#6366f1', '#8b5cf6'],
                onPress: () => navigation.navigate('CreateEvent'),
              },
              {
                label: 'All Events',
                icon: 'list',
                colors: ['#0d9488', '#10b981'],
                onPress: () => navigation.navigate('NGOEvents'),
              },
              {
                label: 'My Profile',
                icon: 'business',
                colors: ['#db2777', '#ec4899'],
                onPress: () => navigation.navigate('NGOProfile'),
              },
            ].map(a => (
              <TouchableOpacity key={a.label} style={styles.quickAction} onPress={a.onPress}>
                <LinearGradient colors={a.colors} style={styles.quickGrad}>
                  <Icon name={a.icon} size={28} color="#fff" />
                  <Paragraph style={styles.quickLabel}>{a.label}</Paragraph>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Ongoing events ──────────────────────────────── */}
        {ongoingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.liveIndicator} />
                <Title style={styles.sectionTitle}>Live Now</Title>
              </View>
            </View>
            {ongoingEvents.map(e => (
              <EventCard
                key={e._id}
                event={e}
                onManage={() => navigation.navigate('EventManagement', { eventId: e._id })}
                onEdit={() => navigation.navigate('CreateEvent', { event: e })}
              />
            ))}
          </View>
        )}

        {/* ── Upcoming events ─────────────────────────────── */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Upcoming Events</Title>
              <Button mode="text" compact onPress={() => navigation.navigate('NGOEvents')}>
                View All
              </Button>
            </View>
            {upcomingEvents.slice(0, 3).map(e => (
              <EventCard
                key={e._id}
                event={e}
                onManage={() => navigation.navigate('EventManagement', { eventId: e._id })}
                onEdit={() => navigation.navigate('CreateEvent', { event: e })}
              />
            ))}
          </View>
        )}

        {/* ── Recently completed ──────────────────────────── */}
        {recentCompleted.length > 0 && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Recently Completed</Title>
            {recentCompleted.map(e => (
              <EventCard
                key={e._id}
                event={e}
                onManage={() => navigation.navigate('EventManagement', { eventId: e._id })}
                onEdit={() => {}}
              />
            ))}
          </View>
        )}

        {/* ── Empty state ─────────────────────────────────── */}
        {events.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Icon name="event-note" size={64} color="#374151" />
            <Title style={styles.emptyTitle}>No Events Yet</Title>
            <Paragraph style={styles.emptyText}>
              Create your first event to get started and connect with students
            </Paragraph>
            <Button
              mode="contained"
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('CreateEvent')}
              icon="add"
            >
              Create First Event
            </Button>
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      <FAB
        icon="add"
        label="New Event"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },

  // Header
  header: { margin: 16, borderRadius: 20, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  ngoName: { color: '#fff', fontSize: 22, fontWeight: 'bold', maxWidth: width - 120 },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
  profileBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Section
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  liveIndicator: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#10b981', marginBottom: 10,
  },

  // Stat cards
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#1a1d2e',
    borderRadius: 14, padding: 14, borderLeftWidth: 3,
  },
  statContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statInfo: { flex: 1 },
  statTitle: { color: '#9ca3af', fontSize: 11, marginBottom: 2 },
  statValue: { fontSize: 26, fontWeight: 'bold' },
  statSubtitle: { color: '#4b5563', fontSize: 10, marginTop: 2 },
  statIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },

  // Attendance ring
  ringCard: { backgroundColor: '#1a1d2e', borderRadius: 16, padding: 18 },
  ringContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ringOuter: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 8, justifyContent: 'center', alignItems: 'center',
  },
  ringInner: {
    width: 74, height: 74, borderRadius: 37,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
  },
  ringValue: { fontSize: 20, fontWeight: 'bold', lineHeight: 22 },
  ringLabel: { color: '#6b7280', fontSize: 10, textAlign: 'center' },
  ringMeta: { flex: 1 },
  ringTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  ringDesc: { color: '#9ca3af', fontSize: 12, marginBottom: 8 },
  ringBarBg: { height: 6, backgroundColor: '#374151', borderRadius: 3, overflow: 'hidden' },
  ringBarFill: { height: '100%', borderRadius: 3 },

  // Quick actions
  quickActions: { flexDirection: 'row', gap: 10 },
  quickAction: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  quickGrad: { padding: 16, alignItems: 'center', gap: 6 },
  quickLabel: { color: '#fff', fontWeight: '600', fontSize: 12, textAlign: 'center' },

  // Event card
  eventCard: { backgroundColor: '#1a1d2e', borderRadius: 16, marginBottom: 12 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  eventTitle: { color: '#fff', fontSize: 15, marginBottom: 3 },
  eventMeta: { color: '#6b7280', fontSize: 12 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, height: 26, justifyContent: 'center',
  },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  miniStats: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniStatText: { color: '#9ca3af', fontSize: 12 },
  progressRow: { marginBottom: 12 },
  progressBar: { height: 5, backgroundColor: '#374151', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { color: '#4b5563', fontSize: 11 },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { flex: 1, borderColor: '#374151' },
  manageBtn: { flex: 2, backgroundColor: '#7c3aed' },
  btnLabel: { fontSize: 12 },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { color: '#fff', marginTop: 16, marginBottom: 8 },
  emptyText: { color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  emptyBtn: { paddingHorizontal: 24, backgroundColor: '#7c3aed' },

  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#7c3aed' },
});

export default NGODashboardScreen;