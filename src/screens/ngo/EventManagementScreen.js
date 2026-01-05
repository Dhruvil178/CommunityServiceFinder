// src/screens/ngo/EventManagementScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Surface, Divider, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchEventDetails, generateCertificate, updateEvent } from '../../store/ngoSlice';

const EventManagementScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const dispatch = useDispatch();
  const { selectedEvent, isLoading } = useSelector(state => state.ngo);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'registered', 'completed'

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = () => {
    dispatch(fetchEventDetails(eventId));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEventDetails();
    setRefreshing(false);
  };

  const handleGenerateCertificate = (registration) => {
    Alert.alert(
      'Generate Certificate',
      `Generate certificate for ${registration.studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              await dispatch(generateCertificate({
                eventId: selectedEvent._id,
                registrationId: registration._id
              })).unwrap();
              Alert.alert('Success', 'Certificate generated successfully!');
              loadEventDetails();
            } catch (error) {
              Alert.alert('Error', error || 'Failed to generate certificate');
            }
          }
        }
      ]
    );
  };

  const handleMarkEventComplete = () => {
    Alert.alert(
      'Mark Event as Completed',
      'This will change the event status to completed. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await dispatch(updateEvent({
                eventId: selectedEvent._id,
                updates: { status: 'completed' }
              })).unwrap();
              Alert.alert('Success', 'Event marked as completed');
              loadEventDetails();
            } catch (error) {
              Alert.alert('Error', error || 'Failed to update event');
            }
          }
        }
      ]
    );
  };

  if (!selectedEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Paragraph style={styles.loadingText}>Loading event details...</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  const registrations = selectedEvent.registrations || [];
  const registeredCount = registrations.filter(r => r.status === 'registered').length;
  const completedCount = registrations.filter(r => r.status === 'completed').length;
  const certificatesIssued = registrations.filter(r => r.certificateIssued).length;

  const filteredRegistrations = registrations.filter(r => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'registered') return r.status === 'registered';
    if (selectedTab === 'completed') return r.status === 'completed';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'registered': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const RegistrationCard = ({ registration }) => (
    <Card style={styles.registrationCard}>
      <Card.Content>
        <View style={styles.registrationHeader}>
          <View style={styles.studentInfo}>
            <Avatar.Text 
              size={48} 
              label={registration.studentName?.charAt(0) || 'S'} 
              style={styles.avatar}
            />
            <View style={styles.studentDetails}>
              <Title style={styles.studentName}>{registration.studentName}</Title>
              <Paragraph style={styles.studentEmail}>{registration.studentEmail}</Paragraph>
              <Paragraph style={styles.studentPhone}>📱 {registration.studentPhone}</Paragraph>
            </View>
          </View>
          
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(registration.status) + '20' }]}
            textStyle={{ color: getStatusColor(registration.status) }}
          >
            {registration.status.toUpperCase()}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.registrationMeta}>
          <Paragraph style={styles.metaText}>
            📅 Registered: {new Date(registration.registeredAt).toLocaleDateString()}
          </Paragraph>
          
          {registration.certificateIssued && (
            <View style={styles.certificateBadge}>
              <Icon name="verified" size={16} color="#10b981" />
              <Paragraph style={styles.certificateText}>Certificate Issued</Paragraph>
            </View>
          )}
        </View>

        {registration.status === 'registered' && !registration.certificateIssued && (
          <Button
            mode="contained"
            onPress={() => handleGenerateCertificate(registration)}
            style={styles.certificateButton}
            icon="verified"
          >
            Mark Complete & Generate Certificate
          </Button>
        )}

        {registration.status === 'completed' && !registration.certificateIssued && (
          <Button
            mode="contained"
            onPress={() => handleGenerateCertificate(registration)}
            style={styles.certificateButton}
            icon="verified"
          >
            Generate Certificate
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Event Info Card */}
        <Card style={styles.eventCard}>
          <Card.Content>
            <Title style={styles.eventTitle}>{selectedEvent.title}</Title>
            <Paragraph style={styles.eventDate}>
              📅 {selectedEvent.date} at {selectedEvent.time}
            </Paragraph>
            <Paragraph style={styles.eventLocation}>
              📍 {selectedEvent.location}
            </Paragraph>

            <View style={styles.statsRow}>
              <Surface style={styles.statItem}>
                <Icon name="people" size={24} color="#8b5cf6" />
                <Paragraph style={styles.statValue}>{registeredCount}</Paragraph>
                <Paragraph style={styles.statLabel}>Registered</Paragraph>
              </Surface>

              <Surface style={styles.statItem}>
                <Icon name="check-circle" size={24} color="#10b981" />
                <Paragraph style={styles.statValue}>{completedCount}</Paragraph>
                <Paragraph style={styles.statLabel}>Completed</Paragraph>
              </Surface>

              <Surface style={styles.statItem}>
                <Icon name="verified" size={24} color="#f59e0b" />
                <Paragraph style={styles.statValue}>{certificatesIssued}</Paragraph>
                <Paragraph style={styles.statLabel}>Certificates</Paragraph>
              </Surface>

              <Surface style={styles.statItem}>
                <Icon name="event-seat" size={24} color="#6b7280" />
                <Paragraph style={styles.statValue}>{selectedEvent.spotsAvailable}</Paragraph>
                <Paragraph style={styles.statLabel}>Spots Left</Paragraph>
              </Surface>
            </View>

            {selectedEvent.status === 'upcoming' && (
              <Button
                mode="outlined"
                onPress={handleMarkEventComplete}
                style={styles.completeButton}
                icon="check"
              >
                Mark Event as Completed
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
            onPress={() => setSelectedTab('all')}
          >
            <Paragraph style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
              All ({registrations.length})
            </Paragraph>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'registered' && styles.activeTab]}
            onPress={() => setSelectedTab('registered')}
          >
            <Paragraph style={[styles.tabText, selectedTab === 'registered' && styles.activeTabText]}>
              Registered ({registeredCount})
            </Paragraph>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
            onPress={() => setSelectedTab('completed')}
          >
            <Paragraph style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
              Completed ({completedCount})
            </Paragraph>
          </TouchableOpacity>
        </View>

        {/* Registrations List */}
        <View style={styles.registrationsContainer}>
          {filteredRegistrations.length > 0 ? (
            filteredRegistrations.map(registration => (
              <RegistrationCard key={registration._id} registration={registration} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={64} color="#6b7280" />
              <Title style={styles.emptyTitle}>No Registrations Yet</Title>
              <Paragraph style={styles.emptyText}>
                Students will appear here when they register for this event
              </Paragraph>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
  },
  eventCard: {
    margin: 16,
    backgroundColor: '#1a1d2e',
  },
  eventTitle: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 8,
  },
  eventDate: {
    color: '#9ca3af',
    marginBottom: 4,
  },
  eventLocation: {
    color: '#9ca3af',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#0f1117',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 2,
  },
  completeButton: {
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1d2e',
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  registrationsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  registrationCard: {
    backgroundColor: '#1a1d2e',
    marginBottom: 12,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  avatar: {
    backgroundColor: '#8b5cf6',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  studentEmail: {
    color: '#9ca3af',
    fontSize: 13,
  },
  studentPhone: {
    color: '#9ca3af',
    fontSize: 13,
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#374151',
  },
  registrationMeta: {
    gap: 8,
    marginBottom: 12,
  },
  metaText: {
    color: '#6b7280',
    fontSize: 12,
  },
  certificateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  certificateText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  certificateButton: {
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
  },
});

export default EventManagementScreen;