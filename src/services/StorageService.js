// src/services/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheEvents = async (events) => {
  try {
    await AsyncStorage.setItem('cached_events', JSON.stringify(events));
  } catch (error) {
    console.error('Error caching events:', error);
  }
};

export const getCachedEvents = async () => {
  try {
    const cachedEvents = await AsyncStorage.getItem('cached_events');
    return cachedEvents ? JSON.parse(cachedEvents) : [];
  } catch (error) {
    console.error('Error retrieving cached events:', error);
    return [];
  }
};
