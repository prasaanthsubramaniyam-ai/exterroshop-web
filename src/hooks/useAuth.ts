"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  loginThunk,
  logoutThunk,
  fetchProfileThunk,
} from "@/store/slices/authSlice";
import type { LoginPayload } from "@/types";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (s) => s.auth
  );

  const login = useCallback(
    (payload: LoginPayload) => dispatch(loginThunk(payload)).unwrap(),
    [dispatch]
  );

  const logout = useCallback(
    () => dispatch(logoutThunk()).unwrap(),
    [dispatch]
  );

  const refreshProfile = useCallback(
    () => dispatch(fetchProfileThunk()).unwrap(),
    [dispatch]
  );

  return { user, isAuthenticated, isLoading, error, login, logout, refreshProfile };
};
