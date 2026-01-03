import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  xp: 0,
  level: 1,
  coins: 0,
  lastLevelUp: null,
};

const xpForNextLevel = level => level * 100;

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    gainXP(state, action) {
      const amount = action.payload;
      state.xp += amount;

      let leveledUp = false;

      while (state.xp >= xpForNextLevel(state.level)) {
        state.xp -= xpForNextLevel(state.level);
        state.level += 1;
        state.coins += 50;
        leveledUp = true;
      }

      if (leveledUp) {
        state.lastLevelUp = Date.now();
      }
    },

    spendCoins(state, action) {
      const cost = action.payload;
      if (state.coins >= cost) {
        state.coins -= cost;
      }
    },

    resetProgress() {
      return initialState;
    },
  },
});

export const { gainXP, spendCoins, resetProgress } = gameSlice.actions;
export default gameSlice.reducer;
