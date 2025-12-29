import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Title, Paragraph, Chip, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';

const CalendarScreen = ({ navigation }) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  const events = {
    '2025-08-12': [{ id: '2', title: 'Food Bank Volunteering', time: '02:00 PM', category: 'Community Support', color: '#FF9800' }],
    '2025-08-15': [{ id: '1', title: 'Beach Cleanup Drive', time: '09:00 AM', category: 'Environmental', color: '#4CAF50' }],
    '2025-08-18':
        [{ id: '3', title: 'Tree Planting Event', time: '10:00 AM', category: 'Environmental', color: '#4CAF50' }],
    };
    const markedDates = Object.keys(events).reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: theme.colors.primary };
    if (date === selectedDate) {
        acc[date].selected = true;
        acc[date].selectedColor = theme.colors.primary;
    }
    return acc;
    }, {});
    const EventCard = ({ event }) => (
    <Card style={styles.eventCard} onPress={() => navigation.navigate('EventDetails', { event })}>
        <Card.Content>
        <View style={styles.eventHeader}>
            <View style={styles.eventInfo}>
            <Title style={styles.eventTitle} numberOfLines={1}>{event.title}</Title>
            <Paragraph style={styles.eventTime}>{event.time}</Paragraph>
            </View>
            <Chip mode="outlined" compact style={{ borderColor: event.color, color: event.color }}>{event.category}</Chip>
        </View>
        </Card.Content>
    </Card>
    );
    return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

        <ScrollView contentContainerStyle={styles.scrollContent}>

        <Calendar

            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={markedDates}

            theme={{
            selectedDayBackgroundColor: theme.colors.primary,
            todayTextColor: theme.colors.accent,
            arrowColor: theme.colors.primary,   
            monthTextColor: theme.colors.primary,
            }}
            style={styles.calendar}
        />
        <View style={styles.eventsContainer}>
            <Title style={styles.eventsTitle}>Events on {moment(selectedDate).format('MMMM Do, YYYY')}</Title>
            {events[selectedDate] ? (
            events[selectedDate].map(event => <EventCard key={event.id} event={event} />)   
            ) : (
            <Paragraph style={styles.noEventsText}>No events scheduled for this day.</Paragraph>
            )}
        </View>
        </ScrollView>
    </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20 },
    calendar: { marginBottom: 20 },
    eventsContainer: { flex: 1 },
    eventsTitle: { marginBottom: 10 },
    noEventsText: { fontStyle: 'italic', color: '#666' },
    eventCard: { marginBottom: 10 },    
    eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    eventInfo: { flex: 1, marginRight: 10 },
    eventTitle: { fontSize: 16, fontWeight: 'bold' },
    eventTime: { fontSize: 14, color: '#666' },
});
export default CalendarScreen;
