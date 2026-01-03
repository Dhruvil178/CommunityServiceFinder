import axios from "axios";
import { getToken } from "../redux/authSlice"; // or however you get JWT

const API_BASE = "http://192.168.0.104:5000/api"; // replace with your backend IP

export const changePassword = async (oldPassword, newPassword, token) => {
  try {
    const res = await axios.put(
      `${API_BASE}/security/change-password`,
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }
};
