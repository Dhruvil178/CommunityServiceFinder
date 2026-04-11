import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Title, Text, Chip, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import api from '../../services/api';

const MyCompletedEventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/events');
        setEvents(response.data || []);
      } catch (error) {
        console.error('Events fetch error:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Get user's registered events
  const userRegisteredEvents = events
    .filter(event => Array.isArray(event.registrations))
    .filter(event => {
      if (!user) return false;
      const userId = user.id || user._id || user.uid;
      return event.registrations.some(reg => {
        const regUserId = reg.userId && (reg.userId.toString ? reg.userId.toString() : reg.userId);
        return (
          regUserId === userId ||
          (user.email && reg.studentEmail?.toLowerCase() === user.email.toLowerCase())
        );
      });
    });

  // Separate completed (past) and upcoming events
  const completedEvents = userRegisteredEvents
    .filter(event => {
      // Check if event is in the past OR if user has attended/completed it
      const isPastEvent = moment(event.date).isBefore(moment(), 'day');
      const userRegistration = event.registrations.find(reg => {
        const userId = user.id || user._id || user.uid;
        const regUserId = reg.userId && (reg.userId.toString ? reg.userId.toString() : reg.userId);
        return (
          regUserId === userId ||
          (user.email && reg.studentEmail?.toLowerCase() === user.email.toLowerCase())
        );
      });

      return isPastEvent || (userRegistration && userRegistration.attended);
    })
    .sort((a, b) => moment(b.date).diff(moment(a.date))); // Most recent first

  const upcomingEvents = userRegisteredEvents
    .filter(event => {
      const isFutureEvent = moment(event.date).isSameOrAfter(moment(), 'day');
      const userRegistration = event.registrations.find(reg => {
        const userId = user.id || user._id || user.uid;
        const regUserId = reg.userId && (reg.userId.toString ? reg.userId.toString() : reg.userId);
        return (
          regUserId === userId ||
          (user.email && reg.studentEmail?.toLowerCase() === user.email.toLowerCase())
        );
      });

      return isFutureEvent && (!userRegistration || !userRegistration.attended);
    })
    .sort((a, b) => moment(a.date).diff(moment(b.date))); // Soonest first

  const EventCard = ({ event, isCompleted }) => {
    const userRegistration = event.registrations.find(reg => {
      const userId = user.id || user._id || user.uid;
      const regUserId = reg.userId && (reg.userId.toString ? reg.userId.toString() : reg.userId);
      return (
        regUserId === userId ||
        (user.email && reg.studentEmail?.toLowerCase() === user.email.toLowerCase())
      );
    });

    return (
      <Card style={[styles.eventCard, isCompleted && styles.completedCard]}>
        <Card.Content>
          <View style={styles.eventHeader}>
            <Title style={styles.eventTitle}>{event.title}</Title>
            {isCompleted && (
              <Chip style={styles.completedChip} textStyle={styles.completedChipText}>
                ✓ Completed
              </Chip>
            )}
          </View>

          <Text style={styles.eventDate}>
            📅 {moment(event.date).format('MMM Do, YYYY')} at {event.time}
          </Text>
          <Text style={styles.eventLocation}>
            📍 {event.location || event.city}
          </Text>

          <View style={styles.rewardContainer}>
            <Chip style={styles.xpChip}>
              ⚡ {event.xpReward || event.xp || 50} XP
            </Chip>
            <Chip style={styles.coinChip}>
              🪙 {event.coinsReward || event.coins || 10}
            </Chip>
          </View>

          {userRegistration && userRegistration.attendedAt && (
            <Text style={styles.attendedText}>
              Attended on {moment(userRegistration.attendedAt).format('MMM Do, YYYY')}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading your event timeline...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
        <Title style={styles.headerTitle}>🗺 Quest Timeline</Title>
        <Text style={styles.headerText}>Your journey through community service</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Upcoming Events Section */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>📅 Upcoming Events</Title>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <EventCard key={event._id || event.id} event={event} isCompleted={false} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No upcoming registered events</Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Completed Events Section */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>🏆 Completed Events</Title>
          {completedEvents.length > 0 ? (
            completedEvents.map(event => (
              <EventCard key={event._id || event.id} event={event} isCompleted={true} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No completed events yet</Text>
                <Text style={styles.emptySubtext}>Start your community service journey!</Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text style={styles.statsTitle}>Your Impact</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{completedEvents.length}</Text>
                  <Text style={styles.statLabel}>Events Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{upcomingEvents.length}</Text>
                  <Text style={styles.statLabel}>Events Registered</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {completedEvents.reduce((sum, event) => sum + (event.xpReward || event.xp || 50), 0)}
                  </Text>
                  <Text style={styles.statLabel}>Total XP Earned</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  header: { padding: 20, borderRadius: 0, paddingTop: 40 },
  headerTitle: { color: '#fff', textAlign: 'center' },
  headerText: { color: '#e0e7ff', textAlign: 'center', marginTop: 4 },
  scrollContent: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#fff', marginBottom: 12, fontSize: 18 },
  eventCard: { marginBottom: 12, backgroundColor: '#1a1d2e' },
  completedCard: { borderLeftWidth: 4, borderLeftColor: '#10b981' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  eventTitle: { color: '#fff', flex: 1, marginRight: 8 },
  completedChip: { backgroundColor: '#10b981' },
  completedChipText: { color: '#fff' },
  eventDate: { color: '#9ca3af', marginBottom: 4 },
  eventLocation: { color: '#9ca3af', marginBottom: 12 },
  rewardContainer: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  xpChip: { backgroundColor: '#8b5cf6' },
  coinChip: { backgroundColor: '#f59e0b' },
  attendedText: { color: '#10b981', fontSize: 12, fontStyle: 'italic' },
  emptyCard: { backgroundColor: '#1a1d2e', padding: 20 },
  emptyText: { color: '#9ca3af', textAlign: 'center', fontSize: 16 },
  emptySubtext: { color: '#6b7280', textAlign: 'center', marginTop: 4 },
  statsContainer: { marginTop: 8 },
  statsCard: { backgroundColor: '#1a1d2e' },
  statsTitle: { color: '#fff', textAlign: 'center', marginBottom: 16, fontSize: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { color: '#8b5cf6', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9ca3af', marginTop: 16 },
});

export default MyCompletedEventsScreen;