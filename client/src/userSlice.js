// src/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.userData = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearUser(state) {
      state.userData = null;
      state.error = null;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;