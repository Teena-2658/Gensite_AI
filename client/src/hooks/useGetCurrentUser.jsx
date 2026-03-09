import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { serverUrl } from "../constants";
import { setUser, setLoading, setError, clearUser } from "../userSlice";

export default function useGetCurrentUser() {
  const dispatch = useDispatch();
  const { userData, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchCurrentUser = async () => {

      const token = localStorage.getItem("token");

      // ❗ If no token → stop request
      if (!token) {
        dispatch(clearUser());
        return;
      }

      dispatch(setLoading(true));

      try {
        const res = await axios.get(`${serverUrl}/api/user/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data?.user || res.data;

        if (user && user._id) {
          dispatch(setUser(user));
        } else {
          dispatch(clearUser());
        }

      } catch (error) {

        console.log("Auth error:", error?.response?.data || error.message);

        if (error?.response?.status === 401) {
          localStorage.removeItem("token");
          dispatch(clearUser());
        } else {
          dispatch(setError(error.message));
        }

      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCurrentUser();

  }, [dispatch]);

}