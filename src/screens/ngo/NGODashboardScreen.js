// src/screens/ngo/NGODashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchNGOEvents, fetchDashboardStats } from '../../store/ngoSlice';

const { width } = Dimensions.get('window');

const NGODashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { events, dashboardStats, isLoading } = useSelector(state => state.ngo);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchNGOEvents());
    dispatch(fetchDashboardStats());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Surface style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statInfo}>
          <Paragraph style={styles.statTitle}>{title}</Paragraph>
          <Title style={styles.statValue}>{value}</Title>
          {subtitle && <Paragraph style={styles.statSubtitle}>{subtitle}</Paragraph>}
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={32} color={color} />
        </View>
      </View>
    </Surface>
  );

  const EventCard = ({ event }) => {
    const progress = ((event.spotsTotal - event.spotsAvailable) / event.spotsTotal) * 100;
    const registrationCount = event.registrations?.length || 0;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventManagement', { eventId: event._id })}
      >
        <Card style={styles.eventCard}>
          <Card.Content>
            <View style={styles.eventHeader}>
              <View style={{ flex: 1 }}>
                <Title numberOfLines={2} style={styles.eventTitle}>{event.title}</Title>
                <Paragraph style={styles.eventDate}>
                  📅 {event.date} at {event.time}
                </Paragraph>
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: event.status === 'upcoming' ? '#10b981' : 
                               event.status === 'ongoing' ? '#f59e0b' : '#6b7280' 
              }]}>
                <Paragraph style={styles.statusText}>
                  {event.status.toUpperCase()}
                </Paragraph>
              </View>
            </View>

            <View style={styles.eventStats}>
              <View style={styles.eventStat}>
                <Icon name="people" size={20} color="#8b5cf6" />
                <Paragraph style={styles.eventStatText}>
                  {registrationCount} Registered
                </Paragraph>
              </View>
              <View style={styles.eventStat}>
                <Icon name="event-seat" size={20} color="#10b981" />
                <Paragraph style={styles.eventStatText}>
                  {event.spotsAvailable} Spots Left
                </Paragraph>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Paragraph style={styles.progressText}>{Math.round(progress)}% Full</Paragraph>
            </View>

            <View style={styles.eventActions}>
              <Button 
                mode="outlined" 
                compact
                onPress={() => navigation.navigate('CreateEvent', { event })}
              >
                Edit
              </Button>
              <Button 
                mode="contained" 
                compact
                onPress={() => navigation.navigate('EventManagement', { eventId: event._id })}
              >
                Manage
              </Button>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const ongoingEvents = events.filter(e => e.status === 'ongoing');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <LinearGradient
          colors={['#ec4899', '#f43f5e']}
          style={styles.headerCard}
        >
          <View style={styles.headerContent}>
            <View>
              <Paragraph style={styles.welcomeText}>Welcome back,</Paragraph>
              <Title style={styles.ngoName}>{user?.organizationName || 'NGO'}</Title>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('NGOProfile')}>
              <View style={styles.profileIcon}>
                <Icon name="business" size={32} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Overview</Title>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Events"
              value={dashboardStats?.totalEvents || 0}
              icon="event"
              color="#6366f1"
              subtitle="All time"
            />
            <StatCard
              title="Upcoming"
              value={dashboardStats?.upcomingEvents || 0}
              icon="event-available"
              color="#10b981"
              subtitle="Active"
            />
            <StatCard
              title="Registrations"
              value={dashboardStats?.totalRegistrations || 0}
              icon="people"
              color="#8b5cf6"
              subtitle="Total volunteers"
            />
            <StatCard
              title="Certificates"
              value={dashboardStats?.totalCertificates || 0}
              icon="verified"
              color="#f59e0b"
              subtitle="Issued"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.quickActionGradient}
              >
                <Icon name="add-circle" size={32} color="#fff" />
                <Paragraph style={styles.quickActionText}>Create Event</Paragraph>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('NGOEvents')}
            >
              <LinearGradient
                colors={['#10b981', '#14b8a6']}
                style={styles.quickActionGradient}
              >
                <Icon name="list" size={32} color="#fff" />
                <Paragraph style={styles.quickActionText}>All Events</Paragraph>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Upcoming Events</Title>
              <Button 
                mode="text" 
                compact
                onPress={() => navigation.navigate('NGOEvents')}
              >
                View All
              </Button>
            </View>
            {upcomingEvents.slice(0, 3).map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </View>
        )}

        {/* Ongoing Events */}
        {ongoingEvents.length > 0 && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Ongoing Events</Title>
            {ongoingEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {events.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Icon name="event-note" size={64} color="#6b7280" />
            <Title style={styles.emptyTitle}>No Events Yet</Title>
            <Paragraph style={styles.emptyText}>
              Create your first event to get started
            </Paragraph>
            <Button 
              mode="contained" 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              Create Event
            </Button>
          </View>
        )}

      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
        label="New Event"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  headerCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  ngoName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#1a1d2e',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statSubtitle: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#1a1d2e',
    marginBottom: 12,
    borderRadius: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
  },
  eventDate: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  eventStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventStatText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  progressText: {
    color: '#6b7280',
    fontSize: 11,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#8b5cf6',
  },
});

export default NGODashboardScreen;