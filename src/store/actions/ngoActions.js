import { NGO_CREATE_EVENT } from '../../services/api';

export const createNgoEvent = (eventData) => {
  return async (dispatch, getState) => {
    try {
      const { token } = getState().auth;

      console.log('[API POST]', NGO_CREATE_EVENT);
      console.log('Data:', eventData);

      const res = await fetch(NGO_CREATE_EVENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('Backend error:', data);
        throw new Error(data.message || 'Failed to create event');
      }

      return data;
    } catch (err) {
      console.log('Create event error:', err);
      throw err;
    }
  };
};
