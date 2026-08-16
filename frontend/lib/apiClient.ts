import type { ApiEnvelope } from "@/types/Api";

// Base URL dari environment
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * GET wrapper untuk autentikasi via HttpOnly Cookie.
 */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json: ApiEnvelope<T> | null = await res.json().catch(() => null);

  if (!res.ok || !json || json.success === false) {
    throw new Error(
      json?.message || `Gagal memuat ${path} (${res.status})`
    );
  }

  return json.data;
}