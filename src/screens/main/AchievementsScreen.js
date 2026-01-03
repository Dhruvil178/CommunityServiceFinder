import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Surface, Text, Chip } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { achievements as allAchievements } from '../../store/achievementSlice';

const achievementList = Object.values(allAchievements);

export default function AchievementsScreen() {
  const unlocked = useSelector(state => state.achievements.unlocked);

  const renderItem = ({ item }) => {
    const isUnlocked = !!unlocked[item.id];
    const unlockedAt = unlocked[item.id]?.unlockedAt;

    return (
      <Surface
        style={[
          styles.card,
          isUnlocked ? styles.unlocked : styles.locked,
        ]}
      >
        <Text style={styles.title}>
          {isUnlocked ? '🏆' : '🔒'} {item.title}
        </Text>

        <Text style={styles.description}>{item.description}</Text>

        {isUnlocked ? (
          <Chip style={styles.unlockedChip}>
            Unlocked
          </Chip>
        ) : (
          <Chip style={styles.lockedChip}>
            Locked
          </Chip>
        )}

        {isUnlocked && unlockedAt && (
          <Text style={styles.timestamp}>
            Unlocked on {new Date(unlockedAt).toLocaleDateString()}
          </Text>
        )}
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={achievementList}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },

  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  unlocked: {
    backgroundColor: '#1a1d2e',
    borderWidth: 1,
    borderColor: '#4ade80',
  },

  locked: {
    backgroundColor: '#111827',
    opacity: 0.6,
  },

  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  description: {
    color: '#9ca3af',
    marginVertical: 8,
    fontSize: 13,
  },

  unlockedChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#4ade80',
  },

  lockedChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
  },

  timestamp: {
    marginTop: 6,
    fontSize: 11,
    color: '#9ca3af',
  },
});
