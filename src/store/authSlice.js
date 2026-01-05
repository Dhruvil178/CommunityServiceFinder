// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, apiLog } from '../config/config';

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const userType = await AsyncStorage.getItem('userType');

      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData),
          userType: userType || 'student'
        };
      }
      return null;
    } catch (error) {
      console.log('AsyncStorage error:', error);
      return null;
    }
  }
);

// Student Registration
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

      if (!res.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('userType', 'student');

      return { ...data, userType: 'student' };
    } catch (err) {
      console.log('Register error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// Student Login
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
      await AsyncStorage.setItem('userType', 'student');

      return { ...data, userType: 'student' };
    } catch (err) {
      console.log('Login error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// NGO Registration
export const registerNGO = createAsyncThunk(
  'auth/registerNGO',
  async (ngoData, { rejectWithValue }) => {
    try {
      apiLog(API_ENDPOINTS.NGO_REGISTER, 'POST', { email: ngoData.email });
      const res = await fetch(API_ENDPOINTS.NGO_REGISTER, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(ngoData),
});
      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'NGO registration failed');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.ngo));
      await AsyncStorage.setItem('userType', 'ngo');

      return { user: data.ngo, token: data.token, userType: 'ngo' };
    } catch (err) {
      console.log('NGO Register error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// NGO Login
export const loginNGO = createAsyncThunk(
  'auth/loginNGO',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      apiLog(API_ENDPOINTS.NGO_LOGIN, 'POST', { email });
      const res = await fetch(API_ENDPOINTS.NGO_LOGIN, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Invalid credentials');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.ngo));
      await AsyncStorage.setItem('userType', 'ngo');

      return { user: data.ngo, token: data.token, userType: 'ngo' };
    } catch (err) {
      console.log('NGO Login error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// Update Profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { token, userType } = getState().auth;
      const endpoint = userType === 'ngo' ? API_ENDPOINTS.NGO_UPDATE_PROFILE : API_ENDPOINTS.UPDATE_PROFILE;

      apiLog(endpoint, 'PUT', profileData);

      const res = await fetch(endpoint, {
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

      const updatedUser = userType === 'ngo' ? data.ngo : data.user;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      console.log('Update profile error:', err);
      return rejectWithValue('Network error');
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('userType');
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    userType: null, // 'student' or 'ngo'
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUserType(state, action) {
      state.userType = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Check Auth State
      .addCase(checkAuthState.pending, state => {
        state.isLoading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.userType = action.payload.userType;
          state.isAuthenticated = true;
        }
      })
      .addCase(checkAuthState.rejected, state => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })

      // Student Register
      .addCase(register.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.userType = 'student';
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Student Login
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.userType = 'student';
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // NGO Register
      .addCase(registerNGO.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerNGO.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.userType = 'ngo';
        state.isAuthenticated = true;
      })
      .addCase(registerNGO.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // NGO Login
      .addCase(loginNGO.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginNGO.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.userType = 'ngo';
        state.isAuthenticated = true;
      })
      .addCase(loginNGO.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Profile
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

      // Logout
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.userType = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUserType } = authSlice.actions;
export default authSlice.reducer;