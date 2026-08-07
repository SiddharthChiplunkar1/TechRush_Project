import axios from "axios";
import { tokenStorage } from "./tokenStorage";
const api = axios.create({
  baseURL: import.meta.env["VITE_API_URL"] ?? "http://localhost:8080",
  timeout: 15e3,
  headers: { "Content-Type": "application/json" }
});
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      tokenStorage.clear();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/unauthorized");
      }
    }
    const failure = {
      status,
      message: error.response?.data?.message ?? error.message ?? "Unexpected network error"
    };
    return Promise.reject(failure);
  }
);
async function requestWithFallback(call, fallback) {
  try {
    return await call();
  } catch {
    return await fallback();
  }
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export {
  api,
  delay,
  requestWithFallback
};
