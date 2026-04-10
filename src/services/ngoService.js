import axios from 'axios';

import api from './api.js'; // Reuse configured axios instance with auth

// NGO registration (existing)
export const registerNGO = async (payload) => {
  try {
    const res = await api.post('/ngo/register', payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'NGO registration failed' };
  }
};

// Delete NGO event (new) - with console.log for debugging
export const deleteNGOEvent = async (eventId) => {
  console.log('[NGO SERVICE] Deleting event ID:', eventId, 'URL:', `${api.defaults.baseURL}/ngo/events/${eventId}`);
  try {
    const res = await api.delete(`/ngo/events/${eventId}`);
    console.log('[NGO SERVICE] Delete success:', res.data);
    return res.data;
  } catch (err) {
    console.error('[NGO SERVICE] Delete error:', err.response?.status, err.response?.data || err.message);
    throw err.response?.data || { message: 'Failed to delete event' };
  }
};

