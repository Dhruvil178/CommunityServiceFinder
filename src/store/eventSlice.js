import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchEvents, registerForEvent } from '../services/EventService';

export const loadEvents = createAsyncThunk('events/loadEvents', async () => {
  const events = await fetchEvents();
  return events;
});

export const registerEvent = createAsyncThunk('events/registerEvent', async ({ eventId, userId }) => {
  const response = await registerForEvent(eventId, userId);
  return { eventId, userId, ...response };
});

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    loading: false,
    error: null,
    registrationStatus: null,
  },
  reducers: {
    clearRegistrationStatus: (state) => {
      state.registrationStatus = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(loadEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(registerEvent.pending, (state) => {
        state.registrationStatus = 'loading';
      })
      .addCase(registerEvent.fulfilled, (state) => {
        state.registrationStatus = 'success';
      })
      .addCase(registerEvent.rejected, (state, action) => {
        state.registrationStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { clearRegistrationStatus } = eventSlice.actions;
export default eventSlice.reducer;
