import type { ApiEnvelope } from "@/types/Api";

// Base URL comes from the environment so it can differ between
// development, staging, and production without touching the code.
// Set NEXT_PUBLIC_API_BASE_URL in .env.local, e.g.:
//   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Thin fetch wrapper matching the response envelope documented in
 * API-Documentation.md: { success, data, message }.
 * Throws with the backend's `message` on failure so callers can
 * surface it directly.
 */
export async function apiGet<T>(path: string, token: string | null): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
    "Content-Type": "application/json",
    "Authorization":`Bearer ${token}`,
    "ngrok-skip-browser-warning": "true"
  },
  });

  const json: ApiEnvelope<T> | null = await res.json().catch(() => null);

  if (!res.ok || !json || json.success === false) {
    throw new Error(json?.message || `Gagal memuat ${path} (${res.status})`);
  }

  return json.data;
}