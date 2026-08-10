import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function refreshAuth() {
  try {
    // call refresh endpoint; backend will use refresh cookie
    const res = await axios.post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true });
    if (res && res.data && res.data.data && res.data.data.accessToken) {
      const token = res.data.data.accessToken;
      tokenStorage.set(token, res.data.data.expiresIn ?? 900);
      return token;
    }
  } catch (err) {
    // no active session
    return null;
  }
}

export function getAccessToken() {
  return tokenStorage.get();
}

export function clearAuth() {
  tokenStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
}
