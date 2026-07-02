/**
 * Minimal, dependency-free JWT payload decoder.
 * Does NOT verify the signature — verification happens on the backend.
 * This is only used client-side to read display claims (e.g. email, role)
 * that the backend already put in the token when it was issued.
 */
export function decodeJwt<T = Record<string, unknown>>(
  token: string | null | undefined
): T | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}