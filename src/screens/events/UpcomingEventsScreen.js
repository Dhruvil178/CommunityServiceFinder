import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';

export default function UpcomingEventsScreen() {
  const navigation = useNavigation();

  // Dummy event data (replace with API later)
  const upcomingEvents = [
    {
      id: '1',
      title: 'Beach Cleanup Drive',
      category: 'Environmental',
      date: '2025-08-15',
      time: '09:00 AM',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500',
      spotsAvailable: 25,
      spotsTotal: 50,
    },
    {
      id: '2',
      title: 'Tree Plantation Camp',
      category: 'Community',
      date: '2025-09-10',
      time: '07:30 AM',
      image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=500',
      spotsAvailable: 18,
      spotsTotal: 30,
    },
    {
      id: '3',
      title: 'Old Age Home Visit',
      category: 'Social',
      date: '2025-07-28',
      time: '03:00 PM',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500',
      spotsAvailable: 10,
      spotsTotal: 20,
    }
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("EventDetails", { event: item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>📅 {item.date} at {item.time}</Text>

        <Text style={styles.spots}>
          {item.spotsAvailable}/{item.spotsTotal} spots left
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={upcomingEvents}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    height: 180,
    width: '100%',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  category: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 6,
  },
  spots: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
});
