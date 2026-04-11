import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Title, Text, Chip, ProgressBar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import api from '../../services/api';

const CalendarScreen = ({ navigation, route }) => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector(state => state.auth.user);
  const parentNavigation = route.params?.parentNavigation;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/events');
        setEvents(response.data || []);
      } catch (error) {
        console.error('Calendar fetch error:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const registeredEvents = events
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

  const upcomingRegisteredEvents = registeredEvents
    .filter(event => moment(event.date).isSameOrAfter(moment(), 'day'))
    .sort((a, b) => moment(a.date).diff(moment(b.date)));

  // Normalize dates for comparison - ensure consistent format YYYY-MM-DD
  const normalizeDate = (dateStr) => {
    return moment(dateStr).format('YYYY-MM-DD');
  };

  const selectedDateEvents = upcomingRegisteredEvents.filter(event => 
    normalizeDate(event.date) === selectedDate
  );

  const markedDates = upcomingRegisteredEvents.reduce((acc, event) => {
    const normalizedDate = normalizeDate(event.date);
    acc[normalizedDate] = { marked: true, dotColor: '#8b5cf6' };
    return acc;
  }, {
    [selectedDate]: { selected: true, selectedColor: '#8b5cf6' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={() => parentNavigation.navigate('MyCompletedEvents')}>
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.banner}>
            <Title style={styles.bannerTitle}>🗺 Quest Timeline</Title>
            <Text style={styles.bannerText}>Tap to view your event history</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Calendar
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          theme={{
            selectedDayBackgroundColor: '#8b5cf6',
            todayTextColor: '#ec4899',
            arrowColor: '#8b5cf6',
          }}
        />

        <Title style={styles.sectionTitle}>
          Events on {moment(selectedDate).format('MMM Do')}
        </Title>

        {loading ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.noEventsText}>Loading events...</Text>
            </Card.Content>
          </Card>
        ) : selectedDateEvents.length > 0 ? (
          selectedDateEvents.map(event => (
            <Card key={event._id || event.id} style={styles.card}
              onPress={() => navigation.navigate('EventDetails', { event })}
            >
              <Card.Content>
                <Title>{event.title}</Title>
                <Text>{event.time || event.date} • {event.location || event.city}</Text>
                <Chip style={styles.xpChip}>⚡ {event.xpReward ?? event.xp} XP</Chip>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.noEventsText}>No registered events on this date.</Text>
            </Card.Content>
          </Card>
        )}

        <Title style={styles.sectionTitle}>My Events</Title>

        {loading ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.noEventsText}>Loading events...</Text>
            </Card.Content>
          </Card>
        ) : upcomingRegisteredEvents.length > 0 ? (
          upcomingRegisteredEvents.map(event => (
            <Card key={event._id || event.id} style={styles.card}
              onPress={() => navigation.navigate('EventDetails', { event })}
            >
              <Card.Content>
                <Title>{event.title}</Title>
                <Text>{moment(event.date).format('MMM Do')} • {event.time || event.date}</Text>
                <Text>{event.location || event.city}</Text>
                <Chip style={styles.xpChip}>⚡ {event.xpReward ?? event.xp} XP</Chip>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.noEventsText}>You have no upcoming registered events.</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  banner: { padding: 20, borderRadius: 16, marginBottom: 16 },
  bannerTitle: { color: '#fff' },
  bannerText: { color: '#e0e7ff' },
  sectionTitle: { marginVertical: 12, color: '#fff' },
  card: { marginBottom: 12, backgroundColor: '#1a1d2e' },
  xpChip: { marginTop: 8, backgroundColor: '#8b5cf6' },
  noEventsText: { color: '#9ca3af' },
});

export default CalendarScreen;
