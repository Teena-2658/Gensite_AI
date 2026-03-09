// src/hooks/useGetCurrentUser.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { serverUrl } from '../constants';
import { setUser, setLoading, setError, clearUser } from '../userSlice';

export default function useGetCurrentUser() {
  const dispatch = useDispatch();
  const { userData, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    // Skip if we already have user data or are loading
    if (userData || isLoading) return;

    const fetchCurrentUser = async () => {
      dispatch(setLoading(true));

      try {
        const response = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });

        // Adjust based on your actual response shape
        // Common patterns:
        //   response.data.user
        //   response.data.data
        //   response.data
        const user = response.data?.user || response.data?.data || response.data;

        if (user && user._id) {
          dispatch(setUser(user));
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        console.log('Not authenticated or error:', error?.message);
        dispatch(clearUser());
        if (error?.response?.status !== 401) {
          dispatch(setError(error?.message || 'Failed to fetch user'));
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCurrentUser();
  }, [dispatch, userData, isLoading]);

  // Optional: return useful values if needed by callers
  // return { user: userData, isLoading, error: state.user.error };
}