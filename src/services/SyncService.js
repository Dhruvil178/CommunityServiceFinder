import api from './api';

/**
 * Sync achievements to backend
 * @param {Object} unlockedAchievements - Map of unlocked achievements from Redux
 * @returns {Promise} Response from backend
 */
export const syncAchievements = async (unlockedAchievements) => {
  try {
    const response = await api.post('/profile/sync-achievements', {
      achievements: unlockedAchievements,
    });
    return response.data;
  } catch (err) {
    console.error('Error syncing achievements:', err);
    throw err;
  }
};

/**
 * Sync game state (XP and coins) to backend
 * @param {number} xp - Current XP
 * @param {number} coins - Current coins
 * @returns {Promise} Response from backend
 */
export const syncGameState = async (xp, coins) => {
  try {
    const response = await api.post('/profile/sync-game-state', {
      xp: Math.max(0, Math.floor(xp)),
      coins: Math.max(0, Math.floor(coins)),
    });
    return response.data;
  } catch (err) {
    console.error('Error syncing game state:', err);
    throw err;
  }
};

export default {
  syncAchievements,
  syncGameState,
};
