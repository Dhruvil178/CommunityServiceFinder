import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quests: {
    DAILY_LOGIN: {
      id: 'DAILY_LOGIN',
      title: 'Daily Login',
      description: 'Log in to the app',
      xp: 10,
      coins: 2,
      icon: '📱',
      claimedToday: false,
      lastClaimedAt: null,
      claimCount: 0,
      resetTime: '00:00', // 12 AM
    },
    JOIN_2_EVENTS: {
      id: 'JOIN_2_EVENTS',
      title: 'Join 2 Volunteer Events',
      description: 'Register for 2 volunteer events',
      xp: 50,
      coins: 10,
      icon: '🎯',
      claimedToday: false,
      lastClaimedAt: null,
      claimCount: 0,
      eventRegistrationCount: 0,
      requiredCount: 2,
    },
  },
  lastReset: new Date().setHours(0, 0, 0, 0),
};

const dailyQuestSlice = createSlice({
  name: 'dailyQuests',
  initialState,
  reducers: {
    // Claim a daily quest
    claimDailyQuest(state, action) {
      const questId = action.payload;
      const quest = state.quests[questId];
      
      if (quest && !quest.claimedToday) {
        quest.claimedToday = true;
        quest.lastClaimedAt = Date.now();
        quest.claimCount += 1;
      }
    },

    // Check if quest can be claimed (hasn't been claimed today)
    canClaimQuest(state, action) {
      const questId = action.payload;
      const quest = state.quests[questId];
      
      if (!quest) return false;
      
      // If already claimed today, return false
      if (quest.claimedToday) return false;
      
      return true;
    },

    // Update event registration count
    incrementEventRegistrationCount(state) {
      const quest = state.quests.JOIN_2_EVENTS;
      if (quest) {
        quest.eventRegistrationCount += 1;
        
        // Check if quest is now complete (2 registrations)
        if (quest.eventRegistrationCount >= quest.requiredCount && !quest.claimedToday) {
          // Quest is eligible to be claimed
        }
      }
    },

    // Reset daily quests (should be called at 12 AM)
    resetDailyQuests(state) {
      Object.keys(state.quests).forEach(questId => {
        const quest = state.quests[questId];
        quest.claimedToday = false;
        
        // Reset event registration count for the event quest
        if (questId === 'JOIN_2_EVENTS') {
          quest.eventRegistrationCount = 0;
        }
      });
      
      state.lastReset = new Date().setHours(0, 0, 0, 0);
    },

    // Load daily quest state from backend
    loadDailyQuestState(state, action) {
      const { quests, lastReset } = action.payload;
      
      if (quests) {
        Object.keys(quests).forEach(questId => {
          if (state.quests[questId]) {
            state.quests[questId] = {
              ...state.quests[questId],
              ...quests[questId],
              claimedToday: shouldResetDaily(lastReset) ? false : quests[questId].claimedToday,
            };
          }
        });
      }
      
      state.lastReset = lastReset || new Date().setHours(0, 0, 0, 0);
    },

    // Check if daily reset is needed
    checkAndResetDaily(state) {
      const now = new Date();
      const today = new Date().setHours(0, 0, 0, 0);
      
      if (state.lastReset < today) {
        Object.keys(state.quests).forEach(questId => {
          const quest = state.quests[questId];
          quest.claimedToday = false;
          
          if (questId === 'JOIN_2_EVENTS') {
            quest.eventRegistrationCount = 0;
          }
        });
        
        state.lastReset = today;
      }
    },

    // Set event registration count directly (from backend)
    setEventRegistrationCount(state, action) {
      state.quests.JOIN_2_EVENTS.eventRegistrationCount = action.payload;
    },
  },
});

// Helper function to check if daily reset is needed
const shouldResetDaily = (lastReset) => {
  const lastResetDate = new Date(lastReset).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return lastResetDate < today;
};

export const {
  claimDailyQuest,
  canClaimQuest,
  incrementEventRegistrationCount,
  resetDailyQuests,
  loadDailyQuestState,
  checkAndResetDaily,
  setEventRegistrationCount,
} = dailyQuestSlice.actions;

export default dailyQuestSlice.reducer;
