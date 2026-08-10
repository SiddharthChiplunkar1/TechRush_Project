import axios from "axios";
import { tokenStorage } from "./tokenStorage";
let refreshPromise = null;
const NON_RETRYABLE_MUTATIONS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const api = axios.create({
  baseURL: import.meta.env["VITE_API_URL"] ?? "http://localhost:8080",
  timeout: 15e3,
  headers: { "Content-Type": "application/json" }
});
api.defaults.withCredentials = true;
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const method = (error.config?.method ?? "get").toUpperCase();
    const isFinancialMutation = NON_RETRYABLE_MUTATIONS.has(method) &&
      /\/(transfer|beneficiar|favorite)/i.test(error.config?.url ?? "");
    if (status === 401 && !error.config?._authRetry && !isFinancialMutation && !error.config?.url?.includes("/api/auth/")) {
      if (!refreshPromise) {
        refreshPromise = api.post("/api/auth/refresh", {}).then((r) => {
          const session = r.data?.data ?? r.data;
          tokenStorage.set(session.accessToken, session.expiresIn ?? 900);
          return session.accessToken;
        }).finally(() => { refreshPromise = null; });
      }
      try {
        const token = await refreshPromise;
        const retry = { ...error.config, _authRetry: true };
        retry.headers = { ...retry.headers, Authorization: `Bearer ${token}` };
        return api.request(retry);
      } catch { /* safe logout path below */ }
    }
    if (status === 401 && typeof window !== "undefined") {
      tokenStorage.clear();
      if (!window.location.pathname.startsWith("/login")) window.location.assign("/login");
    }
    const failure = {
      status,
      message: error.response?.data?.message ?? error.message ?? "Unexpected network error"
    };
    return Promise.reject(failure);
  }
);
export {
  api,
};
