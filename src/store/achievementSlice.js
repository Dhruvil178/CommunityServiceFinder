import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  unlocked: {},
  recentlyUnlocked: null,
};

const achievements = {
  FIRST_XP: {
    id: 'FIRST_XP',
    title: 'First Steps',
    description: 'Gain your first XP',
    rewardCoins: 10,
  },
  LEVEL_5: {
    id: 'LEVEL_5',
    title: 'Rising Star',
    description: 'Reach Level 5',
    rewardCoins: 100,
  },
  XP_500: {
    id: 'XP_500',
    title: 'XP Grinder',
    description: 'Earn 500 total XP',
    rewardCoins: 75,
  },
};

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    unlockAchievement(state, action) {
      const achievement = action.payload;

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
  },
});

export const {
  unlockAchievement,
  clearRecentAchievement,
} = achievementSlice.actions;

export { achievements };
export default achievementSlice.reducer;
