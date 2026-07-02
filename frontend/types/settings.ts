// The JWT payload shape below is a best guess — API-Documentation.md only
// documents the login response as { jwt_token: string } and doesn't specify
// what claims are inside it. All fields are optional so the UI degrades
// gracefully (hides a field) instead of crashing if a claim is missing.
export interface JwtPayload {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  posyandu_id?: string;
  posyandu_name?: string;
  iat?: number;
  exp?: number;
}

export type ThemePreference = "light" | "dark";

export interface NotificationPreferences {
  jadwalPemeriksaan: boolean;
  kasusStuntingBaru: boolean;
  ringkasanMingguan: boolean;
}

export interface AppPreferences {
  theme: ThemePreference;
  notifications: NotificationPreferences;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: "light",
  notifications: {
    jadwalPemeriksaan: true,
    kasusStuntingBaru: true,
    ringkasanMingguan: false,
  },
};