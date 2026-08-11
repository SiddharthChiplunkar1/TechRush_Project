const PENDING_FLOW_KEY = "techrush.auth.pending-flow";

function readPendingAuthFlow() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(PENDING_FLOW_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

const getPendingAuthFlow = readPendingAuthFlow;

function writePendingAuthFlow(flow) {
  if (typeof window === "undefined") {
    return flow;
  }

  if (!flow) {
    window.sessionStorage.removeItem(PENDING_FLOW_KEY);
    return null;
  }

  window.sessionStorage.setItem(PENDING_FLOW_KEY, JSON.stringify(flow));
  return flow;
}

function clearPendingAuthFlow() {
  return writePendingAuthFlow(null);
}

function getDisplayName(user) {
  if (!user) {
    return "Guest";
  }

  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(" ");
  }

  return user.email ?? "Guest";
}

function getSessionSecurityScore(user, authMethod = "otp") {
  let score = 68;

  if (user?.emailVerified) {
    score += 8;
  }

  if (user?.faceEnrolled) {
    score += 12;
  }

  if (user?.role === "ADMIN") {
    score += 6;
  }

  if (authMethod === "face") {
    score += 4;
  } else if (authMethod === "device") {
    score += 2;
  }

  return Math.min(99, score);
}

function normalizeUser(user, authMethod = "otp") {
  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user.userId,
    name: getDisplayName(user),
    authMethod,
    authLevel: authMethod === "device" ? "WEAK" : "STRONG",
    securityScore: getSessionSecurityScore(user, authMethod),
  };
}

export {
  clearPendingAuthFlow,
  getDisplayName,
  getPendingAuthFlow,
  getSessionSecurityScore,
  normalizeUser,
  readPendingAuthFlow,
  writePendingAuthFlow,
};
