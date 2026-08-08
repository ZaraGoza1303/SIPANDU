"use client";

interface UseAuthTokenResult {
  token: null;
  setToken: (value: string | null) => void;
  clearToken: () => void;
  ready: boolean;
}

export function useAuthToken(): UseAuthTokenResult {
  return {
    token: null,
    setToken: () => {},
    clearToken: () => {},
    ready: true,
  };
}