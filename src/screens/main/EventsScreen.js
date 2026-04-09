import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, Alert, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Searchbar, useTheme, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

// IMPORTANT: Use your local IP if testing on a real device (e.g., 'http://192.168.1.X:5000')
const BASE_URL = 'http://192.168.0.104:5000'; 

const EventsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const[selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Environmental', 'Education', 'Health', 'Community Support'];

  // Fetch from Database
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/events`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Error", "Could not load events from the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  },[]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  },[]);

  // Safely filter MongoDB events
  const filteredEvents = events.filter(event => {
    const titleMatch = (event.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;

    return (titleMatch || descMatch) && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      Environmental: '#4CAF50',
      Education: '#2196F3',
      Health: '#F44336',
      'Community Support': '#FF9800',
    };
    return colors[category] || theme.colors.primary;
  };

  const EventCard = ({ event }) => (
    <Card
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetails', { event })}
    >
      <Image
        source={{ uri: event.image || 'https://via.placeholder.com/400x200.png?text=Event+Image' }}
        style={styles.eventImage}
        resizeMode="cover"
      />

      <Badge
        style={[
          styles.spotsBadge,
          { backgroundColor: getCategoryColor(event.category) },
        ]}
      >
        {event.spotsAvailable} spots left
      </Badge>

      <Card.Content>
        <Title numberOfLines={2}>{event.title}</Title>

        <Chip
          icon="tag"
          style={{ backgroundColor: getCategoryColor(event.category) + '20', marginVertical: 4 }}
          textStyle={{ color: getCategoryColor(event.category) }}
          compact
        >
          {event.category || 'Event'}
        </Chip>

        <Paragraph numberOfLines={2}>{event.description}</Paragraph>

        <View style={styles.eventDetails}>
          <Icon name="schedule" size={16} color={theme.colors.outline} />
          <Paragraph>{event.date} at {event.time}</Paragraph>

          <Icon name="location-on" size={16} color={theme.colors.outline} />
          <Paragraph numberOfLines={1}>{event.location}</Paragraph>

          <Icon name="group" size={16} color={theme.colors.outline} />
          <Paragraph>{event.organizer || 'Local NGO'}</Paragraph>
        </View>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('EventRegistration', { event })}
        >
          Register Now
        </Button>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search events..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View>
        <FlatList
          horizontal
          data={categories}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
              style={styles.categoryFilter}
              textStyle={{ color: selectedCategory === item ? theme.colors.onPrimary : theme.colors.onSurface }}
            >
              {item}
            </Chip>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => <EventCard event={item} />}
        keyExtractor={(item) => item._id} // Fixed to use MongoDB _id
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.eventsList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchbar: { margin: 16 },
  categoriesContent: { paddingHorizontal: 16, paddingBottom: 8 },
  categoryFilter: { marginRight: 8 },
  eventsList: { padding: 16 },
  eventCard: { marginBottom: 16 },
  eventImage: { height: 200, width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  spotsBadge: { position: 'absolute', top: 12, right: 12, color: 'white' },
  eventDetails: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, flexWrap: 'wrap', gap: 4 },
});

export default EventsScreen;