import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { loadDailyQuestState, checkAndResetDaily } from '../store/dailyQuestSlice';

export const useDailyQuestSync = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.user?.id);
  const hasSync = useRef(false);

  useEffect(() => {
    if (!userId || hasSync.current) return;

    const syncDailyQuests = async () => {
      try {
        // Load daily quest state from backend
        const response = await api.get('/dailyquests/status');
        if (response.data) {
          dispatch(loadDailyQuestState(response.data));
        }
        
        // Check if reset is needed
        dispatch(checkAndResetDaily());
        hasSync.current = true;
      } catch (error) {
        console.error('Error syncing daily quests:', error);
        // Silently fail - don't disrupt the app if quest sync fails
      }
    };

    syncDailyQuests();
  }, [userId, dispatch]);
};
