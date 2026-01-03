import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, apiLog } from '../config/config';

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData),
        };
      }
      return null;
    } catch (error) {
      console.log('AsyncStorage error:', error);
      return null;
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      apiLog(API_ENDPOINTS.REGISTER, 'POST', { name, email });

      const res = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      console.log('UPDATE PROFILE RESPONSE 👉', data);

      if (!res.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (err) {
      console.log('Register error:', err);
      return rejectWithValue('Network error');
    }
  }
);

/* ============================
   Login
============================ */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      apiLog(API_ENDPOINTS.LOGIN, 'POST', { email });

      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Invalid credentials');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (err) {
      console.log('Login error:', err);
      return rejectWithValue('Network error');
    }
  }
);

/* ============================
   Update Profile (ASYNC)
============================ */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;

      apiLog(API_ENDPOINTS.UPDATE_PROFILE, 'PUT', profileData);

      const res = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Update failed');
      }

      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      return data.user;
    } catch (err) {
      console.log('Update profile error:', err);
      return rejectWithValue('Network error');
    }
  }
);

/* ============================
   Logout
============================ */
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    return null;
  }
);

/* ============================
   Slice
============================ */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      /* Auth check */
      .addCase(checkAuthState.pending, state => {
        state.isLoading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(checkAuthState.rejected, state => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })

      /* Register */
      .addCase(register.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      /* Login */
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      /* Update Profile */
      .addCase(updateProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      /* Logout */
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
