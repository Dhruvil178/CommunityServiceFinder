import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  name: '',
  email: '',
  token: '',
  isVerified: false,
  twoFactorEnabled: false,
  preferences: {
    categories: [],          // safe default
    notificationsEnabled: true,
  },
  activityHistory: [],       // safe default
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => ({ ...state, ...action.payload }),
    updateUser: (state, action) => ({
      ...state,
      ...action.payload,
      preferences: {
        ...state.preferences,
        ...(action.payload.preferences || {}),
      },
      activityHistory: Array.isArray(action.payload.activityHistory)
        ? action.payload.activityHistory
        : state.activityHistory,
    }),
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addActivity: (state, action) => {
      if (!state.activityHistory) state.activityHistory = [];
      state.activityHistory.push(action.payload);
    },
    clearActivityHistory: (state) => {
      state.activityHistory = [];
    },
    clearUser: () => initialState,
  },
});

export const {
  setUser,
  updateUser,
  setPreferences,
  addActivity,
  clearActivityHistory,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;

