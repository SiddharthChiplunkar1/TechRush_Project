import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export async function refreshAuth() {
  try {
    // call refresh endpoint; backend will use refresh cookie
    const res = await axios.post('/api/auth/refresh', {});
    if (res && res.data && res.data.data && res.data.data.accessToken) {
      const token = res.data.data.accessToken;
      // store access token in localStorage for demo purposes
      localStorage.setItem('access_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return token;
    }
  } catch (err) {
    // no active session
    console.debug('No active refresh session', err?.message || err);
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

export function clearAuth() {
  localStorage.removeItem('access_token');
  delete axios.defaults.headers.common['Authorization'];
}
