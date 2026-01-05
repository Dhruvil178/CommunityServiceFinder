// src/store/ngoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS, apiLog } from '../config/config';

// Create Event
export const createEvent = createAsyncThunk(
  'ngo/createEvent',
  async (eventData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;

      if (!token) {
        return rejectWithValue('Authentication token missing');
      }

      const res = await fetch(API_ENDPOINTS.NGO_CREATE_EVENT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(eventData),
});
      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to create event');
      }

      return data.event;
    } catch (err) {
      console.log('Create event error:', err);
      return rejectWithValue('Network request failed');
    }
  }
);

// Get NGO Events
export const fetchNGOEvents = createAsyncThunk(
  'ngo/fetchEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;

      const res = await fetch(API_ENDPOINTS.NGO_GET_EVENTS, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});
      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to fetch events');
      }

      return data.events;
    } catch (err) {
      console.log('Fetch NGO events error:', err);
      return rejectWithValue('Network request failed');
    }
  }
);

// Get Single Event Details with Registrations
export const fetchEventDetails = createAsyncThunk(
  'ngo/fetchEventDetails',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;

     const res = await fetch(`${API_ENDPOINTS.NGO_GET_EVENTS}/${eventId}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});
      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to fetch event details');
      }

      return data.event;
    } catch (err) {
      console.log('Fetch event details error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// Update Event
export const updateEvent = createAsyncThunk(
  'ngo/updateEvent',
  async ({ eventId, updates }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;

     const res = await fetch(`${API_ENDPOINTS.NGO_GET_EVENTS}/${eventId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(updates),
});
      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to update event');
      }

      return data.event;
    } catch (err) {
      console.log('Update event error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// Generate Certificate for Student
export const generateCertificate = createAsyncThunk(
  'ngo/generateCertificate',
  async ({ eventId, registrationId }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      const res = await fetch(
        `${API_ENDPOINTS.NGO_GET_EVENTS}/${eventId}/complete/${registrationId}`,
        {
          method: 'POST',
          headers: {
  'Content-Type': 'application/json',
}
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to generate certificate');
      }

      return { eventId, registrationId, certificate: data.certificate };
    } catch (err) {
      console.log('Generate certificate error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// Get Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  'ngo/fetchDashboardStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      const res = await fetch(API_ENDPOINTS.NGO_DASHBOARD_STATS, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});
      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to fetch stats');
      }

      return data.stats;
    } catch (err) {
      console.log('Fetch stats error:', err);
      return rejectWithValue('Network error');
    }
  }
);

const ngoSlice = createSlice({
  name: 'ngo',
  initialState: {
    events: [],
    selectedEvent: null,
    dashboardStats: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedEvent(state) {
      state.selectedEvent = null;
    },
  },
  extraReducers: builder => {
    builder
      // Create Event
      .addCase(createEvent.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch NGO Events
      .addCase(fetchNGOEvents.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNGOEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchNGOEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Event Details
      .addCase(fetchEventDetails.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        if (state.selectedEvent?._id === action.payload._id) {
          state.selectedEvent = action.payload;
        }
      })

      // Generate Certificate
      .addCase(generateCertificate.fulfilled, (state, action) => {
        // Update the registration in selected event
        if (state.selectedEvent) {
          const reg = state.selectedEvent.registrations.find(
            r => r._id === action.payload.registrationId
          );
          if (reg) {
            reg.status = 'completed';
            reg.certificateIssued = true;
            reg.certificateId = action.payload.certificate._id;
          }
        }
      })

      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedEvent } = ngoSlice.actions;
export default ngoSlice.reducer;