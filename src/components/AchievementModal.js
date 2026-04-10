import React, { useEffect } from 'react';
import { Portal, Modal, Text, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { clearRecentAchievement } from '../store/achievementSlice';
import { gainCoins, gainXP } from '../store/gameSlice';

export default function AchievementModal() {
  const dispatch = useDispatch();
  const achievement = useSelector(
    state => state.achievements.recentlyUnlocked
  );

  // Award coins/XP when achievement is unlocked
  useEffect(() => {
    if (achievement) {
      if (achievement.rewardCoins) {
        dispatch(gainCoins(achievement.rewardCoins));
      }
      if (achievement.rewardXP) {
        dispatch(gainXP(achievement.rewardXP));
      }
    }
  }, [achievement, dispatch]);

  if (!achievement) return null;

  const handleDismiss = () => {
    dispatch(clearRecentAchievement());
  };

  return (
    <Portal>
      <Modal
        visible
        onDismiss={handleDismiss}
        contentContainerStyle={{
          backgroundColor: '#1a1d2e',
          margin: 24,
          padding: 24,
          borderRadius: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 24, color: '#fbbf24' }}>
          Achievement Unlocked! {achievement.icon}
        </Text>

        <Text style={{ fontSize: 18, color: '#fff', marginTop: 12, fontWeight: '600' }}>
          {achievement.title}
        </Text>

        <Text style={{ color: '#9ca3af', marginVertical: 8, textAlign: 'center' }}>
          {achievement.description}
        </Text>

        <Text style={{ color: '#4ade80', marginTop: 12, fontWeight: '600' }}>
          {achievement.rewardXP && `⚡ +${achievement.rewardXP} XP  `}
          {achievement.rewardCoins && `🪙 +${achievement.rewardCoins} Coins`}
        </Text>

        <Button
          mode="contained"
          style={{ marginTop: 20 }}
          onPress={handleDismiss}
        >
          Awesome!
        </Button>
      </Modal>
    </Portal>
  );
}
