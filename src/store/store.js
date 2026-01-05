// src/store/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './authSlice';
import gameReducer from './gameSlice';
import achievementReducer from './achievementSlice';
import userReducer from './userSlice';
import eventReducer from './eventSlice';
import ngoReducer from './ngoSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  game: gameReducer,
  achievements: achievementReducer,
  user: userReducer,
  events: eventReducer,
  ngo: ngoReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'game', 'user'], // persist auth, game, and user data
  blacklist: ['events', 'ngo'], // don't persist events and ngo data (fetch fresh)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);