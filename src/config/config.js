// src/config/config.js
import { Platform } from 'react-native';

const DEV_API_URL = 'http://192.168.0.104:5000'; 

const PROD_API_URL = 'https://your-production-url.com';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  
  // Events
  GET_EVENTS: `${API_BASE_URL}/api/events`,
  REGISTER_EVENT: `${API_BASE_URL}/api/events/register`,
  
  // Profile
  GET_PROFILE: `${API_BASE_URL}/api/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/profile`,
  
  // Recommendations
  GET_RECOMMENDATIONS: `${API_BASE_URL}/api/recommend`,
  
  // Chatbot
  CHATBOT: `${API_BASE_URL}/api/chatbot/chat`,
};

// Helper function to log API calls in development
export const apiLog = (endpoint, method, data) => {
  if (__DEV__) {
    console.log(`[API ${method}] ${endpoint}`);
    if (data) console.log('Data:', data);
  }
};

export default API_BASE_URL;