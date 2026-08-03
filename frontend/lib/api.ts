// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
    ...(fetchOptions.headers as Record<string, string>),
  };

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
      // Pastikan HANYA redirect jika token benar-benar ada tapi ditolak server (expired/invalid)
      // Jika token memang tidak ada dari awal, atau server mati, jangan asal tendang ke login
      if (isClient && !skipAuthRedirect && token) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      throw new ApiError("Sesi Anda telah berakhir atau token tidak valid.", 401);
    }

    // 4. Penanganan HTTP 403 (Forbidden)
    if (response.status === 403) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.message || "Akses Ditolak (403): Akun Anda tidak memiliki izin untuk fitur ini.";
      throw new ApiError(message, 403, errorData);
    }

    // 5. Penanganan error HTTP lainnya
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
    
    // 🔥 PENTING: Jika server mati (status 0 / gagal koneksi), JANGAN redirect ke login!
    // Cukup lempar error biasa agar halaman menampilkan pesan "Gagal terhubung ke server" saja.
    throw new ApiError(
      "Gagal terhubung ke server Express. Pastikan server backend Anda sudah menyala.",
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