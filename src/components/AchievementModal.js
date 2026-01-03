import React from 'react';
import { Portal, Modal, Text, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { clearRecentAchievement } from '../store/achievementSlice';

export default function AchievementModal() {
  const dispatch = useDispatch();
  const achievement = useSelector(
    state => state.achievements.recentlyUnlocked
  );

  if (!achievement) return null;

  return (
    <Portal>
      <Modal
        visible
        onDismiss={() => dispatch(clearRecentAchievement())}
        contentContainerStyle={{
          backgroundColor: '#1a1d2e',
          margin: 24,
          padding: 24,
          borderRadius: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 24, color: '#fbbf24' }}>
          Achievement Unlocked!
        </Text>

        <Text style={{ fontSize: 18, color: '#fff', marginTop: 12 }}>
          {achievement.title}
        </Text>

        <Text style={{ color: '#9ca3af', marginVertical: 8 }}>
          {achievement.description}
        </Text>

        <Text style={{ color: '#4ade80' }}>
          🪙 +{achievement.rewardCoins} Coins
        </Text>

        <Button
          mode="contained"
          style={{ marginTop: 16 }}
          onPress={() => dispatch(clearRecentAchievement())}
        >
          Nice!
        </Button>
      </Modal>
    </Portal>
  );
}
