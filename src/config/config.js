// src/config/config.js

const DEV_API_URL = 'http://192.168.0.106:5000';
const PROD_API_URL = 'https://your-production-url.com';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const API_ENDPOINTS = {
  // Student Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,

  // NGO Auth (NO AUTH HEADER REQUIRED)
  NGO_LOGIN: `${API_BASE_URL}/api/ngo/login`,
  NGO_REGISTER: `${API_BASE_URL}/api/ngo/register`,

  // Events
  GET_EVENTS: `${API_BASE_URL}/api/events`,
  REGISTER_EVENT: `${API_BASE_URL}/api/events/register`,

  // Profiles
  GET_PROFILE: `${API_BASE_URL}/api/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/profile`,
  NGO_UPDATE_PROFILE: `${API_BASE_URL}/api/ngo/profile`,

  // NGO Event Management (AUTH REQUIRED)
  NGO_CREATE_EVENT: `${API_BASE_URL}/api/ngo/events`,
  NGO_GET_EVENTS: `${API_BASE_URL}/api/ngo/events`,
  NGO_DASHBOARD_STATS: `${API_BASE_URL}/api/ngo/dashboard/stats`,

  // Others
  GET_RECOMMENDATIONS: `${API_BASE_URL}/api/recommend`,
  CHATBOT: `${API_BASE_URL}/api/chatbot/chat`,
  GET_CERTIFICATES: `${API_BASE_URL}/api/certificates`,
};

export const apiLog = (endpoint, method, data) => {
  if (__DEV__) {
    console.log(`[API ${method}] ${endpoint}`);
    if (data) console.log('Data:', data);
  }
};
