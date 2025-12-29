import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Chip,
  Surface,
  useTheme
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);

  const stats = {
    totalEvents: 156,
    activeVolunteers: 1243,
    hoursServed: 8765,
    certificatesIssued: 421,
  };

  const upcomingEvents = [
    {
      id: '1',
      title: 'Beach Cleanup Drive',
      date: '2025-08-15',
      time: '09:00 AM',
      category: 'Environmental',
      spotsLeft: 25,
      image: 'https://your-server.com/event1.jpg'
    },
    {
      id: '2',
      title: 'Food Bank Volunteering',
      date: '2025-08-12',
      time: '02:00 PM',
      category: 'Community Support',
      spotsLeft: 15,
      image: 'https://your-server.com/event2.jpg'
    }
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const StatCard = ({ icon, value, label, color }) => (
    <Surface style={[styles.statCard, { backgroundColor: color + '20' }]}>
      <IconMC name={icon} size={24} color={color} />
      <Title style={[styles.statValue, { color }]}>{value}</Title>
      <Paragraph style={styles.statLabel}>{label}</Paragraph>
    </Surface>
  );

  const EventCard = ({ event }) => (
    <Card style={styles.eventCard} onPress={() => navigation.navigate('Events')}>
      {event.image && (
        <Card.Cover source={{ uri: event.image }} style={styles.eventImage} />
      )}

      <Card.Content>
        <View style={styles.eventHeader}>
          <View style={styles.eventInfo}>
            <Title style={styles.eventTitle} numberOfLines={1}>{event.title}</Title>
            <Paragraph style={styles.eventDate}>{event.date} at {event.time}</Paragraph>
          </View>
          <Chip mode="outlined" compact>{event.spotsLeft} spots</Chip>
        </View>

        <View style={styles.eventFooter}>
          <Chip icon="tag" compact style={styles.categoryChip}>{event.category}</Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* TOP SECTION */}
        <View style={styles.header}>
          <Avatar.Image size={64} source={{ uri: user?.avatar }} />
          <View style={styles.greeting}>
            <Title style={styles.welcomeText}>Welcome back,</Title>
            <Title style={styles.userName}>{user?.name}</Title>
          </View>
        </View>

        {/* Chatbot Button */}
        <Button
          mode="contained"
          icon="robot"
          onPress={() => navigation.navigate("Chatbot")}
          style={styles.chatbotButton}
        >
          Chat with Assistant
        </Button>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon="calendar" value={stats.totalEvents} label="Total Events" color={theme.colors.primary} />
          <StatCard icon="account-group" value={stats.activeVolunteers} label="Volunteers" color={theme.colors.accent} />
          <StatCard icon="clock" value={stats.hoursServed} label="Hours Served" color={theme.colors.success} />
          <StatCard icon="certificate" value={stats.certificatesIssued} label="Certificates" color={theme.colors.warning} />
        </View>

        {/* UPCOMING EVENTS */}
        <View style={styles.upcomingContainer}>
          <Title style={styles.sectionTitle}>Upcoming Events</Title>
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
          <Button mode="outlined" onPress={() => navigation.navigate('Events')} style={styles.viewAllButton}>
            View All Events
          </Button>
        </View>
      </ScrollView>

      {/* FLOATING CHATBOT BUTTON */}
      <TouchableOpacity
        style={styles.chatbotFloatingButton}
        onPress={() => navigation.navigate("Chatbot")}
      >
        <Icon name="chat" size={28} color="#fff" />
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  eventImage: { height: 150, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  chatbotButton: { marginBottom: 16, borderRadius: 12, paddingVertical: 4 },
  greeting: { marginLeft: 12 },
  welcomeText: { fontSize: 16, opacity: 0.7 },
  userName: { fontSize: 20, fontWeight: 'bold' },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  statCard: {
    width: width / 2 - 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  statValue: { fontSize: 22, marginVertical: 4 },
  statLabel: { fontSize: 14, opacity: 0.7 },
  upcomingContainer: { marginTop: 20 },
  sectionTitle: { marginBottom: 10, fontWeight: 'bold' },
  eventCard: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  eventInfo: { flex: 1, paddingRight: 10 },
  eventTitle: { fontSize: 16, fontWeight: 'bold' },
  eventDate: { fontSize: 13, opacity: 0.7 },
  eventFooter: { flexDirection: 'row', marginTop: 6 },
  categoryChip: { alignSelf: 'flex-start' },
  viewAllButton: { marginTop: 12 },

  /* Floating Chatbot Bubble */
  chatbotFloatingButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  }
});

export default HomeScreen;
