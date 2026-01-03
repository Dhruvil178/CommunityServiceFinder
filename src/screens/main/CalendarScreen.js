import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Title, Text, Chip, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  const events = {
    '2025-08-15': [
      {
        id: '1',
        title: 'Beach Cleanup Drive',
        time: '09:00 AM',
        xp: 100,
        difficulty: 'Medium',
        progress: 0.6,
      },
    ],
  };

  const markedDates = {
    [selectedDate]: { selected: true, selectedColor: '#8b5cf6' },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.banner}>
          <Title style={styles.bannerTitle}>🗺 Quest Timeline</Title>
          <Text style={styles.bannerText}>Plan your XP for the week</Text>
        </LinearGradient>

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

        {events[selectedDate]?.map(event => (
          <Card key={event.id} style={styles.card}
            onPress={() => navigation.navigate('EventDetails', { event })}
          >
            <Card.Content>
              <Title>{event.title}</Title>
              <Text>{event.time} • 🎮 {event.difficulty}</Text>

              <Chip style={styles.xpChip}>⚡ {event.xp} XP</Chip>

              <ProgressBar
                progress={event.progress}
                color="#4ade80"
                style={{ marginTop: 8 }}
              />
            </Card.Content>
          </Card>
        ))}
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
});

export default CalendarScreen;
