import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Searchbar, useTheme, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EventsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const events = [
    {
      id: "1",
      title: "Beach Cleanup Drive",
      description: "Join us for a community beach cleanup...",
      category: "Environmental",
      date: "2025-08-15",
      time: "09:00 AM",
      duration: "4 hours",
      location: "Sunset Beach Park",
      organizer: "Green Earth Initiative",
      spotsAvailable: 25,
      spotsTotal: 50,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
    },
  ];

  const categories = ['All', 'Environmental', 'Education', 'Health', 'Community Support'];

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

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
      {/* FIX: Removed FastImage, added React Native Image */}
      <Image
        source={{ uri: event.image }}
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
          style={{
            backgroundColor: getCategoryColor(event.category) + '20',
            marginVertical: 4,
          }}
          textStyle={{ color: getCategoryColor(event.category) }}
          compact
        >
          {event.category}
        </Chip>

        <Paragraph numberOfLines={2}>{event.description}</Paragraph>

        <View style={styles.eventDetails}>
          <Icon name="schedule" size={16} color={theme.colors.outline} />
          <Paragraph>{event.date} at {event.time}</Paragraph>

          <Icon name="location-on" size={16} color={theme.colors.outline} />
          <Paragraph numberOfLines={1}>{event.location}</Paragraph>

          <Icon name="group" size={16} color={theme.colors.outline} />
          <Paragraph>{event.organizer}</Paragraph>
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Searchbar
        placeholder="Search events..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

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
            textStyle={{
              color: selectedCategory === item
                ? theme.colors.onPrimary
                : theme.colors.onSurface,
            }}
          >
            {item}
          </Chip>
        )}
        keyExtractor={(item) => item}
      />

      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => <EventCard event={item} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.eventsList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchbar: { margin: 16 },
  categoriesContent: { paddingHorizontal: 16 },
  categoryFilter: { marginRight: 8 },
  eventsList: { padding: 16 },
  eventCard: { marginBottom: 16 },
  eventImage: { height: 200, width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  spotsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    color: 'white',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    flexWrap: 'wrap',
  },
});

export default EventsScreen;
