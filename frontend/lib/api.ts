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

export async function apiFetch(
  endpoint: string,
  options: CustomFetchOptions = {}
) {
  const { skipAuthRedirect = false, ...fetchOptions } = options;

  const isClient = typeof window !== "undefined";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  const fullUrl = `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      credentials: "include",
      headers,
    });

    // =========================================================
    // 401 UNAUTHORIZED
    // User belum login / cookie tidak valid / session expired
    // =========================================================
    if (response.status === 401) {
      if (isClient && !skipAuthRedirect) {
        const currentPath =
          window.location.pathname +
          window.location.search;

        const loginUrl =
          `/login?redirect=${encodeURIComponent(currentPath)}`;

        window.location.href = loginUrl;
      }

      throw new ApiError(
        "Sesi Anda telah berakhir atau belum login.",
        401
      );
    }

    // =========================================================
    // 403 FORBIDDEN
    // User sudah login tetapi tidak punya permission
    // =========================================================
    if (response.status === 403) {
      const errorData = await response.json().catch(() => null);

      if (isClient && !skipAuthRedirect) {
        window.location.href = "/403";
      }

      throw new ApiError(
        errorData?.message || "Akses ditolak (403).",
        403,
        errorData
      );
    }

    // =========================================================
    // ERROR LAIN
    // =========================================================
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new ApiError(
        errorData?.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return response;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "Gagal terhubung ke server.",
      0
    );
  }
}

export const api = {
  // =========================================================
  // GET
  // =========================================================
  get: async <T = any>(
    endpoint: string,
    options?: CustomFetchOptions
  ): Promise<T> => {
    const res = await apiFetch(endpoint, {
      method: "GET",
      ...options,
    });

    return res.json();
  },

  // =========================================================
  // POST
  // =========================================================
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

  // =========================================================
  // PUT
  // =========================================================
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

  // =========================================================
  // PATCH
  // =========================================================
  patch: async <T = any>(
    endpoint: string,
    body?: any,
    options?: CustomFetchOptions
  ): Promise<T> => {
    const res = await apiFetch(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return res.json();
  },

  // =========================================================
  // DELETE
  // =========================================================
  delete: async <T = any>(
    endpoint: string,
    options?: CustomFetchOptions
  ): Promise<T> => {
    const res = await apiFetch(endpoint, {
      method: "DELETE",
      ...options,
    });

    return res.json();
  },
};