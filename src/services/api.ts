import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL } from "@/constants";
import { tokenStorage } from "@/utils/storage";

interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Axios instance with:
 *  • Bearer JWT injection
 *  • 401 → silent refresh → replay (deduped)
 *  • On refresh failure → clear tokens + redirect to /login
 *
 * Single-flight pattern: while a refresh is in progress, queued 401s wait
 * on the same promise instead of triggering N concurrent refreshes.
 */

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

const refresh = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const { data } = await axios.post<{
    data: { token: string; refreshToken?: string };
  }>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );

  const newAccess = data.data.token;
  const newRefresh = data.data.refreshToken ?? refreshToken;
  tokenStorage.setTokens(newAccess, newRefresh);
  return newAccess;
};

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined;

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise ??= refresh().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (original.headers) {
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
      }
      return client(original);
    } catch (refreshError) {
      tokenStorage.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  }
);

export default client;

/**
 * Unwrap `{ data, message, success }` envelope when present.
 * Only strips the envelope when we see the discriminating `success` field —
 * otherwise we'd accidentally strip the inner `.data` of a PaginatedResponse
 * (which itself has shape `{ data: T[], total, page, ... }`).
 */
export const unwrap = <T>(response: {
  data: T | { data: T; success?: unknown; message?: unknown };
}): T => {
  const body = response.data;
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    ("success" in body || "message" in body)
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
};
