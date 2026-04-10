// src/screens/ngo/NGOEventsListScreen.js

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Paragraph, Chip, FAB, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchNGOEvents } from '../../store/ngoSlice';
import { useNavigation } from '@react-navigation/native';
import { deleteNGOEvent } from '../../services/ngoService';

const NGOEventsListScreen = () => {
  const navigation = useNavigation(); // ✅ FIX: always correct navigator
  const dispatch = useDispatch();

  const { events = [], isLoading } = useSelector(state => state.ngo);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    dispatch(fetchNGOEvents());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNGOEvents());
    setRefreshing(false);
  };

  const filteredEvents = events.filter(event => {
    const title = event.title?.toLowerCase() || '';
    const desc = event.description?.toLowerCase() || '';

    const matchesSearch =
      title.includes(searchQuery.toLowerCase()) ||
      desc.includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || event.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#10b981';
      case 'ongoing': return '#f59e0b';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const EventCard = ({ event }) => {
    const registrationCount = event.registrations?.length || 0;
    const certificatesIssued =
      event.registrations?.filter(r => r.certificateIssued)?.length || 0;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('EventManagement', { eventId: event._id })
        }
      >
        <Card style={styles.eventCard}>
          <Card.Content>

            <View style={styles.eventHeader}>
              <View style={{ flex: 1 }}>
                <Title numberOfLines={2} style={styles.eventTitle}>
                  {event.title}
                </Title>
                <Paragraph style={styles.eventDate}>
                  📅 {event.date} at {event.time}
                </Paragraph>
                <Paragraph style={styles.eventLocation}>
                  📍 {event.location}
                </Paragraph>
              </View>

              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(event.status) }]}
                textStyle={styles.statusText}
              >
                {event.status?.toUpperCase()}
              </Chip>
            </View>

            <View style={styles.categoryContainer}>
              <Chip icon="tag" compact style={styles.categoryChip}>
                {event.category}
              </Chip>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Icon name="people" size={18} color="#8b5cf6" />
                <Paragraph style={styles.statText}>
                  {registrationCount} Registered
                </Paragraph>
              </View>

              <View style={styles.stat}>
                <Icon name="verified" size={18} color="#f59e0b" />
                <Paragraph style={styles.statText}>
                  {certificatesIssued} Certificates
                </Paragraph>
              </View>

              <View style={styles.stat}>
                <Icon name="event-seat" size={18} color="#10b981" />
                <Paragraph style={styles.statText}>
                  {event.spotsAvailable} Spots
                </Paragraph>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate('CreateEvent', { event })
                }
              >
                <Icon name="edit" size={18} color="#8b5cf6" />
                <Paragraph style={styles.actionText}>Edit</Paragraph>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate('EventManagement', { eventId: event._id })
                }
              >
                <Icon name="group" size={18} color="#10b981" />
                <Paragraph style={styles.actionText}>Manage</Paragraph>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={async () => {
                  console.log('[EVENT LIST] Delete pressed for event:', event._id);
                  Alert.alert(
                    'Delete Event',
                    `Are you sure you want to delete "${event.title}"? This action cannot be undone and will remove all registrations.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await deleteNGOEvent(event._id);
                            Alert.alert('Success', 'Event deleted successfully');
                            dispatch(fetchNGOEvents()); // Refresh list
                          } catch (error) {
                            console.error('[EVENT LIST] Delete failed:', error);
                            Alert.alert('Error', error.message || 'Failed to delete event');
                          }
                        }
                      }
                    ]
                  );
                }}

              >
                <Icon name="delete" size={18} color="#ef4444" />
                <Paragraph style={styles.deleteText}>Delete</Paragraph>
              </TouchableOpacity>
            </View>

          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <Searchbar
        placeholder="Search events..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor="#8b5cf6"
      />

      <View style={styles.filtersContainer}>
        {['all', 'upcoming', 'ongoing', 'completed'].map(status => (
          <Chip
            key={status}
            selected={filterStatus === status}
            onPress={() => setFilterStatus(status)}
            style={styles.filterChip}
          >
            {status.toUpperCase()}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => <EventCard event={item} />}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
        label="New Event"
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  searchbar: { margin: 16, backgroundColor: '#1a1d2e' },
  filtersContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterChip: { marginBottom: 4 },
  listContent: { padding: 16, paddingBottom: 80 },
  eventCard: { backgroundColor: '#1a1d2e', marginBottom: 12 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  eventTitle: { color: '#fff', fontSize: 16 },
  eventDate: { color: '#9ca3af', fontSize: 13 },
  eventLocation: { color: '#9ca3af', fontSize: 13 },
  statusChip: { height: 28 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  categoryContainer: { marginBottom: 12 },
  categoryChip: { alignSelf: 'flex-start', backgroundColor: '#8b5cf620' },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: '#9ca3af', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 },
  actionText: { color: '#8b5cf6', fontSize: 13, fontWeight: '600' },
  deleteButton: { borderColor: '#ef4444', borderWidth: 1, borderRadius: 6, paddingHorizontal: 8 },
  deleteText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#8b5cf6' },
});

export default NGOEventsListScreen;