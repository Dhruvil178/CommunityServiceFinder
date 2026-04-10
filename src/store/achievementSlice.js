import { createSlice } from '@reduxjs/toolkit';
import store from './store';

const initialState = {
  unlocked: {},
  recentlyUnlocked: null,
};

// ✅ CLEAN + FULL ACHIEVEMENTS OBJECT
export const achievements = {
  // Login
  FIRST_LOGIN: {
    id: 'FIRST_LOGIN',
    title: 'Welcome to Service!',
    description: 'Welcome to Community Service Finder! Start your journey to become a hero.',
    icon: '🎉',
    rarity: 'rare',
    rewardXP: 50,
    rewardCoins: 100,
  },

  // XP & Level
  FIRST_XP: {
    id: 'FIRST_XP',
    title: 'First Steps',
    description: 'Earn your first XP point',
    icon: '🎯',
    rarity: 'common',
    rewardCoins: 10,
  },
  LEVEL_5: {
    id: 'LEVEL_5',
    title: 'Rising Star',
    description: 'Reach Level 5',
    icon: '⭐',
    rarity: 'rare',
    rewardCoins: 50,
  },
  LEVEL_10: {
    id: 'LEVEL_10',
    title: 'Veteran Volunteer',
    description: 'Reach Level 10',
    icon: '🛡️',
    rarity: 'epic',
    rewardCoins: 150,
  },

  // Registrations
  FIRST_REGISTRATION: {
    id: 'FIRST_REGISTRATION',
    title: 'Ready to Serve',
    description: 'Register for your first event',
    icon: '📋',
    rarity: 'common',
    rewardCoins: 15,
  },

  // Completions
  FIRST_COMPLETION: {
    id: 'FIRST_COMPLETION',
    title: 'Boots on the Ground',
    description: 'Complete your first event',
    icon: '✅',
    rarity: 'common',
    rewardCoins: 25,
  },

  // Certificates
  FIRST_CERTIFICATE: {
    id: 'FIRST_CERTIFICATE',
    title: 'Certified Volunteer',
    description: 'Receive your first certificate',
    icon: '🎓',
    rarity: 'common',
    rewardCoins: 30,
  },

  // Chatbot
  CHATBOT_FIRST: {
    id: 'CHATBOT_FIRST',
    title: 'AI Explorer',
    description: 'Send your first message to the chatbot',
    icon: '🤖',
    rarity: 'common',
    rewardCoins: 10,
  },
};

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    unlockAchievement(state, action) {
      const achievement = action.payload;

      // ✅ prevent duplicate unlock
      if (state.unlocked[achievement.id]) return;

      state.unlocked[achievement.id] = {
        ...achievement,
        unlockedAt: Date.now(),
      };

      state.recentlyUnlocked = achievement;
    },

    clearRecentAchievement(state) {
      state.recentlyUnlocked = null;
    },

    loadAchievements(state, action) {
      const achievements = action.payload || {};
      state.unlocked = achievements;
    },
  },
});

export const {
  unlockAchievement,
  clearRecentAchievement,
  loadAchievements,
} = achievementSlice.actions;

export default achievementSlice.reducer;