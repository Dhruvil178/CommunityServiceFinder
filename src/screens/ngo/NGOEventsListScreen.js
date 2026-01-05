// src/screens/ngo/NGOEventsListScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, FAB, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchNGOEvents } from '../../store/ngoSlice';

const NGOEventsListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { events, isLoading } = useSelector(state => state.ngo);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'upcoming', 'ongoing', 'completed'

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    dispatch(fetchNGOEvents());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
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
    const certificatesIssued = event.registrations?.filter(r => r.certificateIssued).length || 0;

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
                <Paragraph style={styles.eventLocation}>
                  📍 {event.location}
                </Paragraph>
              </View>
              <Chip 
                style={[styles.statusChip, { backgroundColor: getStatusColor(event.status) }]}
                textStyle={styles.statusText}
              >
                {event.status.toUpperCase()}
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
                onPress={() => navigation.navigate('CreateEvent', { event })}
              >
                <Icon name="edit" size={18} color="#8b5cf6" />
                <Paragraph style={styles.actionText}>Edit</Paragraph>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('EventManagement', { eventId: event._id })}
              >
                <Icon name="group" size={18} color="#10b981" />
                <Paragraph style={styles.actionText}>Manage</Paragraph>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search events..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor="#8b5cf6"
      />

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <Chip
          selected={filterStatus === 'all'}
          onPress={() => setFilterStatus('all')}
          style={styles.filterChip}
        >
          All ({events.length})
        </Chip>
        <Chip
          selected={filterStatus === 'upcoming'}
          onPress={() => setFilterStatus('upcoming')}
          style={styles.filterChip}
        >
          Upcoming ({events.filter(e => e.status === 'upcoming').length})
        </Chip>
        <Chip
          selected={filterStatus === 'ongoing'}
          onPress={() => setFilterStatus('ongoing')}
          style={styles.filterChip}
        >
          Ongoing ({events.filter(e => e.status === 'ongoing').length})
        </Chip>
        <Chip
          selected={filterStatus === 'completed'}
          onPress={() => setFilterStatus('completed')}
          style={styles.filterChip}
        >
          Completed ({events.filter(e => e.status === 'completed').length})
        </Chip>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => <EventCard event={item} />}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="event-note" size={64} color="#6b7280" />
            <Title style={styles.emptyTitle}>No Events Found</Title>
            <Paragraph style={styles.emptyText}>
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Create your first event to get started'}
            </Paragraph>
          </View>
        }
      />

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
  searchbar: {
    margin: 16,
    backgroundColor: '#1a1d2e',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterChip: {
    marginBottom: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  eventCard: {
    backgroundColor: '#1a1d2e',
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  eventDate: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 2,
  },
  eventLocation: {
    color: '#9ca3af',
    fontSize: 13,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#8b5cf620',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#8b5cf6',
  },
});

export default NGOEventsListScreen;