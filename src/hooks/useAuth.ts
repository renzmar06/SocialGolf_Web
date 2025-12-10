"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setUser, clearUser, setLoading } from "@/store/slices/userSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true));
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          dispatch(setUser(data.user));
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (!user) {
      checkAuth();
    }
  }, [dispatch, user]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    dispatch(clearUser());
    window.location.href = "/login";
  };

  return { user, isAuthenticated, loading, logout };
}