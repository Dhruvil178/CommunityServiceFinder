import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT:
// Routes already include it
export const API_BASE_URL = "http://192.168.0.104:5000/api";

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
    let message = "Something went wrong";

if (error?.response?.data) {
  const data = error.response.data;

  if (typeof data.message === "string") {
    message = data.message;
  } 
  else if (Array.isArray(data.errors)) {
    message = data.errors.map(err => err.msg).join(", ");
  } 
  else if (typeof data.message === "object") {
    message = Object.values(data.message).join(", ");
  }
} else if (error?.message) {
  message = error.message;
}

    if (__DEV__) {
      console.error("❌ API Error:", message);
    }

    return Promise.reject(message);
  }
);

export default api;
