"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AppPreferences,
  DEFAULT_PREFERENCES,
  NotificationPreferences,
  ThemePreference,
} from "@/types/settings";

/**
 * API-Documentation.md has no endpoint for reading/writing user or app
 * settings, so preferences here are stored locally in the browser
 * (localStorage) rather than synced to a server. If a settings endpoint
 * is added later (e.g. `PATCH /api/user/preferences`), swap the
 * localStorage read/write below for an `apiGet`/`apiPatch` call.
 */
const STORAGE_KEY = "posyandu_preferences";

export function usePreferences() {
  const [preferences, setPreferences] =
    useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
      }
    } catch {
      // ignore malformed local data, fall back to defaults
    } finally {
      setReady(true);
    }
  }, []);

  const persist = useCallback((next: AppPreferences) => {
    setPreferences(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      persist({ ...preferences, theme });
    },
    [preferences, persist]
  );

  const setNotification = useCallback(
    (key: keyof NotificationPreferences, value: boolean) => {
      persist({
        ...preferences,
        notifications: { ...preferences.notifications, [key]: value },
      });
    },
    [preferences, persist]
  );

  return { preferences, ready, setTheme, setNotification };
}