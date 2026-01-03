import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './authSlice';
import gameReducer from './gameSlice';
import achievementReducer from './achievementSlice';
import userReducer from './userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  game: gameReducer,
  achievements: achievementReducer,
  user: userReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'game', 'user'], // persist user info
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
