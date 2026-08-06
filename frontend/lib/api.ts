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
    "ngrok-skip-browser-warning": "69420",
    ...(fetchOptions.headers as Record<string, string>),
  };

  const fullUrl = `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      credentials: "include", // <-- tambah ini
      headers,
    });

    if (response.status === 401) {
      if (isClient && !skipAuthRedirect) {
        window.location.href = "/login";
      }

      throw new ApiError(
        "Sesi Anda telah berakhir atau belum login.",
        401
      );
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => null);

      throw new ApiError(
        errorData?.message ||
          "Akses ditolak (403).",
        403,
        errorData
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new ApiError(
        errorData?.message ||
          `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return response;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      "Gagal terhubung ke server.",
      0
    );
  }
}
export const api = {
  get: async <T = any>(endpoint: string, options?: CustomFetchOptions): Promise<T> => {
    const res = await apiFetch(endpoint, {
      method: "GET",
      ...options,
    });
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