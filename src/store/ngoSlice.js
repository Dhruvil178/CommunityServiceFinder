// src/store/ngoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../config/config';

// ── Helper: Safe JSON parse ───────────────────────────────────────────────
const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

// ── Create Event ─────────────────────────────────────────────────────────
export const createEvent = createAsyncThunk(
  'ngo/createEvent',
  async (eventData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;
      if (!token) return rejectWithValue('No auth token');

      const res = await fetch(API_ENDPOINTS.NGO_CREATE_EVENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await safeJson(res);
      if (!res.ok) return rejectWithValue(data.message || 'Create failed');

      return data.event;
    } catch (err) {
      console.error('Create event error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// ── Fetch NGO Events ─────────────────────────────────────────────────────
export const fetchNGOEvents = createAsyncThunk(
  'ngo/fetchEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;
      if (!token) return rejectWithValue('No auth token');

      const res = await fetch(API_ENDPOINTS.NGO_GET_EVENTS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeJson(res);
      if (!res.ok) return rejectWithValue(data.message || 'Fetch failed');

      return data.events || [];
    } catch (err) {
      console.error('Fetch NGO events error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// ── Fetch Event Details ──────────────────────────────────────────────────
export const fetchEventDetails = createAsyncThunk(
  'ngo/fetchEventDetails',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;

      const res = await fetch(`${API_ENDPOINTS.NGO_GET_EVENTS}/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeJson(res);
      if (!res.ok) return rejectWithValue(data.message || 'Fetch failed');

      return data.event;
    } catch (err) {
      console.error('Fetch event details error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// ── Update Event ─────────────────────────────────────────────────────────
export const updateEvent = createAsyncThunk(
  'ngo/updateEvent',
  async ({ eventId, updates }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;

      const res = await fetch(`${API_ENDPOINTS.NGO_GET_EVENTS}/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await safeJson(res);
      if (!res.ok) return rejectWithValue(data.message || 'Update failed');

      return data.event;
    } catch (err) {
      console.error('Update event error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// ── Generate Certificate ────────────────────────────────────────────────
export const generateCertificate = createAsyncThunk(
  'ngo/generateCertificate',
  async ({ eventId, registrationId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;

      const res = await fetch(
        `${API_ENDPOINTS.NGO_GET_EVENTS}/${eventId}/registrations/${registrationId}/certificate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await safeJson(res);
      if (!res.ok) return rejectWithValue(data.message || 'Certificate failed');

      return { eventId, registrationId };
    } catch (err) {
      console.error('Generate certificate error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// ── Dashboard Stats ─────────────────────────────────────────────────────
export const fetchDashboardStats = createAsyncThunk(
  'ngo/fetchDashboardStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;

      const res = await fetch(API_ENDPOINTS.NGO_DASHBOARD_STATS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeJson(res);
      if (!res.ok) return rejectWithValue(data.message || 'Stats failed');

      return data; // backend sends flat object
    } catch (err) {
      console.error('Fetch stats error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// ── Slice ───────────────────────────────────────────────────────────────
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
    clearError: (state) => { state.error = null; },
    clearSelectedEvent: (state) => { state.selectedEvent = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNGOEvents.pending, (s) => { s.isLoading = true; })
      .addCase(fetchNGOEvents.fulfilled, (s, a) => {
        s.isLoading = false;
        s.error = null;
        s.events = a.payload;
      })
      .addCase(fetchNGOEvents.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      })

      .addCase(createEvent.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(createEvent.fulfilled, (s, a) => {
        s.isLoading = false;
        s.error = null;
        if (a.payload) s.events.unshift(a.payload);
      })
      .addCase(createEvent.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      })

      .addCase(updateEvent.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(updateEvent.fulfilled, (s, a) => {
        s.isLoading = false;
        s.error = null;
        const i = s.events.findIndex(e => e._id === a.payload._id);
        if (i !== -1) s.events[i] = a.payload;
      })
      .addCase(updateEvent.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      })

      .addCase(fetchDashboardStats.fulfilled, (s, a) => {
        s.dashboardStats = a.payload;
      });
  },
});

export const { clearError, clearSelectedEvent } = ngoSlice.actions;
export default ngoSlice.reducer;
