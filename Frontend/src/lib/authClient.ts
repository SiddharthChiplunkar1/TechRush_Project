import axios from "axios";

import { tokenStorage, userStorage } from "./tokenStorage";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

type AuthSessionPayload = {
  accessToken?: string;
  expiresIn?: number;
  user?: unknown;
};

type AuthSessionEnvelope = {
  data?: AuthSessionPayload;
};

type SessionResponse = AuthSessionPayload | AuthSessionEnvelope;

let refreshPromise: Promise<AuthSessionPayload | null> | null = null;

function unwrapSession(response: { data?: SessionResponse } | null): AuthSessionPayload | null {
  const payload = response?.data;
  if (!payload) {
    return null;
  }

  if ("data" in payload && payload.data) {
    return payload.data;
  }

  return payload;
}

export async function refreshAuth() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = axios
    .post<SessionResponse>(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true })
    .then((response) => {
      const session = unwrapSession(response);

      if (session?.accessToken) {
        tokenStorage.set(session.accessToken, session.expiresIn ?? 900);
        if (session.user) {
          userStorage.set(session.user);
        }
        return session;
      }

      return null;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export function storeAuthSession(session: AuthSessionPayload) {
  if (!session?.accessToken) {
    return;
  }

  tokenStorage.set(session.accessToken, session.expiresIn ?? 900);
  if (session.user) {
    userStorage.set(session.user);
  }
}

export function clearAuth() {
  tokenStorage.clear();
  userStorage.clear();
  delete axios.defaults.headers.common.Authorization;
}

export function getAccessToken() {
  return tokenStorage.get();
}
