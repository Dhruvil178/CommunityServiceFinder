import api from "./api";

export const changePassword = async (oldPassword, newPassword, token) => {
  const res = await api.put(
    "/security/change-password",
    { oldPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
export const resetPassword = async (email) => {
  const res = await api.post("/security/reset-password", { email });
  return res.data;
}