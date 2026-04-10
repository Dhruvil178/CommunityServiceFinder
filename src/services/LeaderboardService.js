import api from './api';

/**
 * Fetch leaderboard with real user data sorted by XP
 * @param {number} limit - Maximum number of users to fetch (default: 100)
 * @returns {Promise} Leaderboard data
 */
export const fetchLeaderboard = async (limit = 100) => {
  const response = await api.get('/leaderboard', { params: { limit } });
  return response.data.leaderboard;
};

export default {
  fetchLeaderboard,
};
