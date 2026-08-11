import { authService } from "@/services/authService";
import { clearPendingAuthFlow, getPendingAuthFlow, writePendingAuthFlow } from "./authFlow";
import { clearAuth, refreshAuth, storeAuthSession } from "./authClient";
import { tokenStorage, userStorage } from "./tokenStorage";

let bootstrapPromise = null;
let currentDeviceId = null;

function getStoredSession() {
  const token = tokenStorage.get();
  const user = userStorage.get();

  if (token && !tokenStorage.isExpired() && user) {
    return {
      status: "AUTHENTICATED",
      token,
      user,
      expiresAt: tokenStorage.expiresAt(),
    };
  }

  return {
    status: "UNAUTHENTICATED",
    token: null,
    user: null,
    expiresAt: null,
  };
}

async function updateCurrentDeviceId() {
  try {
    const devices = await authService.getDevices();
    if (!Array.isArray(devices) || devices.length === 0) {
      currentDeviceId = null;
      return null;
    }

    const sorted = [...devices].sort(
      (left, right) =>
        new Date(right.lastUsed ?? right.firstSeen ?? 0).getTime() -
        new Date(left.lastUsed ?? left.firstSeen ?? 0).getTime(),
    );
    currentDeviceId = sorted[0]?.deviceId ?? null;
    return currentDeviceId;
  } catch {
    currentDeviceId = null;
    return null;
  }
}

async function bootstrapAuthSession() {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    const pendingFlow = getPendingAuthFlow();
    if (
      pendingFlow?.type === "registration" ||
      pendingFlow?.type === "login" ||
      pendingFlow?.type === "step-up"
    ) {
      clearAuth();
      currentDeviceId = null;
      return {
        status: pendingFlow.type === "step-up" ? "STEP_UP_REQUIRED" : "OTP_REQUIRED",
        token: null,
        user: null,
        expiresAt: null,
        currentDeviceId: null,
      };
    }

    const stored = getStoredSession();
    if (stored.status === "AUTHENTICATED") {
      clearPendingAuthFlow();
      await updateCurrentDeviceId();
      return { ...stored, currentDeviceId };
    }

    const session = await refreshAuth();
    if (session?.accessToken) {
      clearPendingAuthFlow();
      storeAuthSession(session);
      await updateCurrentDeviceId();
      return {
        status: "AUTHENTICATED",
        token: tokenStorage.get(),
        user: userStorage.get(),
        expiresAt: tokenStorage.expiresAt(),
        currentDeviceId,
      };
    }

    clearAuth();
    currentDeviceId = null;
    return {
      status: "UNAUTHENTICATED",
      token: null,
      user: null,
      expiresAt: null,
      currentDeviceId: null,
    };
  })().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}

async function establishSession(session) {
  storeAuthSession(session);
  clearPendingAuthFlow();
  await updateCurrentDeviceId();
  return {
    status: "AUTHENTICATED",
    token: tokenStorage.get(),
    user: userStorage.get(),
    expiresAt: tokenStorage.expiresAt(),
    currentDeviceId,
  };
}

async function endSession({ allDevices = false } = {}) {
  try {
    await authService.logout({
      allDevices,
      deviceId: currentDeviceId,
    });
  } catch {
    // The frontend still clears state even if the backend call fails.
  } finally {
    clearAuth();
    clearPendingAuthFlow();
    currentDeviceId = null;
  }
}

function getCurrentDeviceId() {
  return currentDeviceId;
}

function setPendingFlow(flow) {
  return writePendingAuthFlow(flow);
}

export {
  bootstrapAuthSession,
  establishSession,
  endSession,
  getCurrentDeviceId,
  getPendingAuthFlow,
  setPendingFlow,
};
