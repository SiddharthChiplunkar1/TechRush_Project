import axios from "axios";

import { getDeviceFingerprint } from "./fingerprint";
import { clearAuth, refreshAuth } from "./authClient";
import { tokenStorage } from "./tokenStorage";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const NON_RETRYABLE_MUTATIONS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let refreshPromise = null;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const headers = config.headers ?? {};
  const token = tokenStorage.get();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const fingerprint = await getDeviceFingerprint();
    if (fingerprint?.visitorId) {
      headers["X-Device-Fingerprint"] = fingerprint.visitorId;
    }
  } catch {
    // Device fingerprinting is best-effort.
  }

  config.headers = headers;
  return config;
});

function normalizeApiError(error) {
  const status = error?.response?.status ?? null;
  const backendMessage = error?.response?.data?.message ?? error?.response?.data?.error;
  const fallback = error?.message ?? "Unexpected network error";

  const statusMessages = {
    400: "Please check the submitted information and try again.",
    401: "Your session expired. Please sign in again.",
    403: "You do not have access to perform this action.",
    404: "The requested item could not be found.",
    409: "That action could not be completed because of a conflict.",
    422: "The request could not be processed.",
    429: "Too many attempts. Please wait and try again.",
    500: "The service is temporarily unavailable.",
    502: "The service gateway returned a bad response.",
    503: "The service is temporarily unavailable.",
    504: "The request timed out.",
  };

  return {
    status,
    message: statusMessages[status] ?? backendMessage ?? fallback,
  };
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const method = (error.config?.method ?? "get").toUpperCase();
    const isFinancialMutation =
      NON_RETRYABLE_MUTATIONS.has(method) &&
      /\/(transfer|beneficiar|favorite)/i.test(error.config?.url ?? "");
    const isAuthRefreshCall = error.config?.url?.includes("/api/auth/refresh");

    if (status === 401 && !error.config?._authRetry && !isFinancialMutation && !isAuthRefreshCall) {
      if (!refreshPromise) {
        refreshPromise = refreshAuth().finally(() => {
          refreshPromise = null;
        });
      }

      try {
        const session = await refreshPromise;
        if (session?.accessToken) {
          const retryConfig = {
            ...error.config,
            _authRetry: true,
            headers: {
              ...error.config?.headers,
              Authorization: `Bearer ${session.accessToken}`,
            },
          };
          return api.request(retryConfig);
        }
      } catch {
        // fall through to logout handling below
      }
    }

    if (status === 401 && typeof window !== "undefined") {
      clearAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export { api, normalizeApiError };
