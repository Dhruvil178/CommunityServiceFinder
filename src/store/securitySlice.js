import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { changePassword as apiChangePassword } from "../api/api";

export const changePassword = createAsyncThunk(
  "security/changePassword",
  async ({ oldPassword, newPassword, token }, { rejectWithValue }) => {
    try {
      const res = await apiChangePassword(oldPassword, newPassword, token);
      return res.message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const securitySlice = createSlice({
  name: "security",
  initialState: { loading: false, message: "", error: "" },
  reducers: { reset: (state) => ({ loading: false, message: "", error: "" }) },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.message = "";
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { reset } = securitySlice.actions;
export default securitySlice.reducer;
