const TOKEN_KEY = "securepass.jwt";
const USER_KEY = "securepass.user";
const EXPIRY_KEY = "securepass.jwt.expiry";
const isBrowser = () => typeof window !== "undefined";
const tokenStorage = {
  get() {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token, expiresInSeconds = 3600) {
    if (!isBrowser()) return;
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresInSeconds * 1e3));
  },
  expiresAt() {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(EXPIRY_KEY);
    return raw ? Number(raw) : null;
  },
  isExpired() {
    const expiry = tokenStorage.expiresAt();
    return expiry !== null && expiry < Date.now();
  },
  clear() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(EXPIRY_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
};
const userStorage = {
  get() {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  set(user) {
    if (!isBrowser()) return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};
function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
export {
  decodeJwt,
  tokenStorage,
  userStorage
};
