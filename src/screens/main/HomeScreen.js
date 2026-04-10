import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Button,
  Avatar,
  Chip,
  Surface,
  Text,
  ProgressBar,
  Portal,
  Modal,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { gainXP, gainCoins } from '../../store/gameSlice';
import { unlockAchievement, achievements } from '../../store/achievementSlice';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.auth.user);
  const { xp, level, coins, lastLevelUp } = useSelector(state => state.game);

  const xpToNextLevel = level * 100;
  const canGainXP = xp < xpToNextLevel;

  const [refreshing, setRefreshing] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [seenLevelUpAt, setSeenLevelUpAt] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (lastLevelUp && lastLevelUp !== seenLevelUpAt) {
      setShowLevelUp(true);
      setSeenLevelUpAt(lastLevelUp);
    }
  }, [lastLevelUp, seenLevelUpAt]);

  // Award FIRST_LOGIN achievement on student's first entry to the app
  useEffect(() => {
    if (user && !user.hasReceivedFirstLoginAchievement) {
      const firstLoginAchievement = achievements['FIRST_LOGIN'];
      if (firstLoginAchievement) {
        // Unlock the FIRST_LOGIN achievement
        dispatch(unlockAchievement(firstLoginAchievement));
        
        // Award the rewards
        if (firstLoginAchievement.rewardXP) {
          dispatch(gainXP(firstLoginAchievement.rewardXP));
        }
        if (firstLoginAchievement.rewardCoins) {
          dispatch(gainCoins(firstLoginAchievement.rewardCoins));
        }

        // Mark on backend that user has received this achievement
        api.post('/profile/mark-first-login').catch(err => 
          console.error('Error marking first login achievement:', err)
        );
      }
    }
  }, [user, dispatch]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to empty array if API fails
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const dailyQuests = [
    { id: 1, title: 'Share an hour on social media', xp: 25, icon: '📱' },
    { id: 2, title: 'Join 2 volunteer events', xp: 50, icon: '🎯' },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const PlayerCard = () => (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6', '#ec4899']}
      style={styles.playerCard}
    >
      <View style={styles.playerHeader}>
        <View style={styles.playerInfo}>
          <Avatar.Text
            size={56}
            label={user?.name?.charAt(0) || 'D'}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.playerName}>{user?.name || 'Dhruvil'}</Text>
            <Chip style={styles.levelChip} textStyle={styles.levelChipText}>
              Lvl {level}
            </Chip>
          </View>
        </View>

        <View style={styles.coinContainer}>
          <Text style={styles.coinEmoji}>🪙</Text>
          <Text style={styles.coinValue}>{coins}</Text>
        </View>
      </View>

      <View style={styles.xpBarContainer}>
        <Text style={styles.xpLabel}>
          {xp} / {xpToNextLevel} XP
        </Text>
        <ProgressBar progress={xp / xpToNextLevel} color="#4ade80" />
      </View>
    </LinearGradient>
  );

  const QuestCard = ({ quest }) => (
    <Surface style={styles.questCard}>
      <Text style={styles.questIcon}>{quest.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.questTitle}>{quest.title}</Text>
        <Text style={styles.rewardText}>+{quest.xp} XP</Text>
      </View>
      <Button
        mode="contained"
        disabled={!canGainXP}
        onPress={() => dispatch(gainXP(quest.xp))}
      >
        Start
      </Button>
    </Surface>
  );

  const EventCard = ({ event }) => (
    <Surface style={styles.eventCard}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={{ padding: 12 }}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>{event.date}</Text>
        <Text style={styles.eventMeta}>{event.location}</Text>
        <Button
          mode="contained"
          style={{ marginTop: 8 }}
          onPress={() => navigation.navigate('Events')}
        >
          Join (+{event.xpReward} XP)
        </Button>
      </View>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <PlayerCard />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Quests</Text>
          {dailyQuests.map(q => (
            <QuestCard key={q.id} quest={q} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Events</Text>
          {loadingEvents ? (
            <Surface style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading events...</Text>
            </Surface>
          ) : events.length > 0 ? (
            events.slice(0, 5).map(event => (
              <EventCard key={event._id} event={event} />
            ))
          ) : (
            <Surface style={styles.noEventsCard}>
              <Text style={styles.noEventsText}>No events available at the moment</Text>
            </Surface>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.chatbotFloatingButton}
        onPress={() => navigation.navigate('Chatbot')}
      >
        <LinearGradient
          colors={['#8b5cf6', '#ec4899']}
          style={styles.chatbotGradient}
        >
          <Icon name="chat" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={showLevelUp}
          onDismiss={() => setShowLevelUp(false)}
          contentContainerStyle={styles.levelUpModal}
        >
          <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
          <Text style={styles.levelUpLevel}>Level {level}</Text>
          <Text style={styles.levelUpReward}>🪙 +50 Coins</Text>
          <Button
            mode="contained"
            onPress={() => setShowLevelUp(false)}
            style={styles.levelUpButton}
          >
            Continue
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },

  playerCard: { margin: 16, borderRadius: 20, padding: 16 },

  playerHeader: { flexDirection: 'row', justifyContent: 'space-between' },

  playerInfo: { flexDirection: 'row', alignItems: 'center' },

  avatar: { backgroundColor: '#fbbf24' },

  playerName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  levelChip: { marginTop: 4, backgroundColor: 'rgba(255,255,255,0.2)' },

  levelChipText: { color: '#fff', fontWeight: 'bold' },

  coinContainer: { flexDirection: 'row', alignItems: 'center' },

  coinEmoji: { fontSize: 20, marginRight: 4 },

  coinValue: { color: '#fff', fontWeight: 'bold' },

  xpBarContainer: { marginTop: 16 },

  xpLabel: { color: '#fff', marginBottom: 6 },

  section: { marginTop: 24, paddingHorizontal: 16 },

  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d2e',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  questIcon: { fontSize: 32, marginRight: 12 },

  questTitle: { color: '#fff', fontWeight: '600' },

  rewardText: { color: '#4ade80', marginTop: 4 },

  eventCard: {
    backgroundColor: '#1a1d2e',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },

  eventImage: { width: '100%', height: 140 },

  eventTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  eventMeta: { color: '#9ca3af', fontSize: 12 },

  loadingCard: {
    backgroundColor: '#1a1d2e',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  loadingText: { color: '#9ca3af', fontSize: 14 },

  noEventsCard: {
    backgroundColor: '#1a1d2e',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  noEventsText: { color: '#9ca3af', fontSize: 14 },

  chatbotFloatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },

  chatbotGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  levelUpModal: {
    backgroundColor: '#1a1d2e',
    padding: 24,
    margin: 24,
    borderRadius: 16,
    alignItems: 'center',
  },

  levelUpTitle: { color: '#fbbf24', fontSize: 24, fontWeight: 'bold' },

  levelUpLevel: { color: '#fff', fontSize: 18, marginTop: 8 },

  levelUpReward: { color: '#4ade80', marginVertical: 12 },

  levelUpButton: { marginTop: 12 },
});

export default HomeScreen;
