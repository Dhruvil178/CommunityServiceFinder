import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  preferences: {
    categories: [],
    notificationsEnabled: true,
  },
  activityHistory: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addActivity: (state, action) => {
      state.activityHistory.push(action.payload);
    },
    clearActivityHistory: (state) => {
      state.activityHistory = [];
    },
  },
});

export const { setPreferences, addActivity, clearActivityHistory } = userSlice.actions;
export default userSlice.reducer;
