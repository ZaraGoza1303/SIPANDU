// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Custom Error Class untuk menangani error HTTP dengan rapi
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface CustomFetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

/**
 * Main fetch wrapper
 */
export async function apiFetch(endpoint: string, options: CustomFetchOptions = {}) {
  const { skipAuthRedirect = false, ...fetchOptions } = options;

  const isClient = typeof window !== "undefined";
  const token = isClient ? localStorage.getItem("token") : null;

  // Header Standar
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // 1. Header wajib melewati cegatan warning Ngrok
    "ngrok-skip-browser-warning": "69420",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // 2. Otomatis pasang Bearer Token jika ada
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });

    // 3. Penanganan HTTP 401 (Unauthorized / Token Kadaluarsa)
    if (response.status === 401) {
      if (isClient && !skipAuthRedirect) {
        localStorage.removeItem("token");
        window.location.href = "/login"; // Otomatis balik ke halaman login
      }
      throw new ApiError("Sesi Anda telah berakhir. Silakan login kembali.", 401);
    }

    // 4. Penanganan HTTP 403 (Forbidden / Role Ditolak Backend)
    if (response.status === 403) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.message ||
        "Akses Ditolak (403): Akun Anda tidak memiliki izin untuk fitur ini.";

      throw new ApiError(message, 403, errorData);
    }

    // 5. Penanganan status error HTTP lainnya (400, 404, 500, dll)
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.message || `Gagal memuat data dari server (HTTP ${response.status})`;

      throw new ApiError(message, response.status, errorData);
    }

    return response;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Error jaringan / CORS failure / Server down
    throw new ApiError(
      error.message || "Gagal terhubung ke server. Periksa koneksi backend Anda.",
      0
    );
  }
}

/**
 * Short-hand Helper Methods (GET, POST, PUT, DELETE)
 */
export const api = {
  get: async <T = any>(endpoint: string, options?: CustomFetchOptions): Promise<T> => {
    const res = await apiFetch(endpoint, { method: "GET", ...options });
    return res.json();
  },

  post: async <T = any>(
    endpoint: string,
    body?: any,
    options?: CustomFetchOptions
  ): Promise<T> => {
    const res = await apiFetch(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return res.json();
  },

  put: async <T = any>(
    endpoint: string,
    body?: any,
    options?: CustomFetchOptions
  ): Promise<T> => {
    const res = await apiFetch(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return res.json();
  },

  delete: async <T = any>(endpoint: string, options?: CustomFetchOptions): Promise<T> => {
    const res = await apiFetch(endpoint, { method: "DELETE", ...options });
    return res.json();
  },
};