// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';           // ← changed path (no features/)

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});