import api from "./api";

/* ============================
   STUDENT AUTH
============================ */
export const loginStudent = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerStudent = async (payload) => {
  const res = await api.post("/auth/register", payload);
  return res.data;
};

/* ============================
   NGO AUTH
============================ */
export const registerNGO = async (payload) => {
  const res = await api.post("/ngo/register", payload);
  return res.data;
};

export const loginNGO = async (email, password) => {
  const res = await api.post("/ngo/login", { email, password });
  return res.data;
};
export const fetchNGOProfile = async (token) => {
  const res = await api.get("/ngo/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}