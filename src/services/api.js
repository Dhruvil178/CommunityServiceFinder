import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT:
// Base URL should NOT include /api
// Routes already include it
export const API_BASE_URL = "http://192.168.0.104:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================
   REQUEST INTERCEPTOR
   (inject auth token automatically)
============================ */
api.interceptors.request.use(
  async (config) => {
    try {
      // Try NGO token first
      const ngoToken = await AsyncStorage.getItem("ngoToken");

      // Fallback to student token if needed
      const studentToken = await AsyncStorage.getItem("token");

      const token = ngoToken || studentToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (__DEV__) {
        console.log("🛰️ API Request:", config.method?.toUpperCase(), config.url);
        if (config.data) console.log("📦 Payload:", config.data);
      }

      return config;
    } catch (err) {
      console.warn("Auth token injection failed:", err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

/* ============================
   RESPONSE INTERCEPTOR
============================ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.errors?.[0]?.msg ||
      error?.message ||
      "Network request failed";

    if (__DEV__) {
      console.error("❌ API Error:", message);
    }

    return Promise.reject(message);
  }
);

export default api;
