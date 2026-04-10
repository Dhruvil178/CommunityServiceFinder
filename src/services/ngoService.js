import axios from 'axios';

const API_BASE = 'http://10.120.113.101:5000/api';

export const registerNGO = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE}/ngo/register`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'NGO registration failed' };
  }
};
