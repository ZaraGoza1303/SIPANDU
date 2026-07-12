"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Reads the JWT saved by the login flow, e.g.:
 *
 *   localStorage.setItem("token", result.data.jwt_token);
 *
 * Key is intentionally hardcoded to "token" to match that existing code —
 * update STORAGE_KEY here if the login flow ever changes it.
 */
const STORAGE_KEY = "token";

interface UseAuthTokenResult {
  token: string | null;
  setToken: (value: string | null) => void;
  clearToken: () => void;
  ready: boolean;
}

export function useAuthToken(): UseAuthTokenResult {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setTokenState(stored || null);
    setReady(true);
  }, []);

  const setToken = useCallback((value: string | null) => {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setTokenState(value || null);
  }, []);

  const clearToken = useCallback(() => setToken(null), [setToken]);

  return { token, setToken, clearToken, ready };
}