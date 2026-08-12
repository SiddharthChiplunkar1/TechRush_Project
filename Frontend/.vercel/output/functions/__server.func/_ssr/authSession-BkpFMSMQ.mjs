import { r as __exportAll$1 } from "../_runtime.mjs";
import { t as axios } from "../_libs/axios+[...].mjs";
import { t as index } from "../_libs/fingerprintjs__fingerprintjs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/authSession-BkpFMSMQ.js
var authSession_BkpFMSMQ_exports = /* @__PURE__ */ __exportAll$1({
	a: () => getCurrentDeviceId,
	c: () => normalizeUser,
	d: () => tokenStorage,
	f: () => getDeviceFingerprint,
	i: () => establishSession,
	l: () => authService,
	n: () => bootstrapAuthSession,
	o: () => setPendingFlow,
	p: () => __exportAll,
	r: () => endSession,
	s: () => getPendingAuthFlow,
	t: () => authSession_exports,
	u: () => api
});
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var cached = null;
function detectBrowser(ua) {
	if (/edg/i.test(ua)) return "Edge";
	if (/chrome/i.test(ua)) return "Chrome";
	if (/safari/i.test(ua)) return "Safari";
	if (/firefox/i.test(ua)) return "Firefox";
	return "Unknown browser";
}
async function getDeviceFingerprint() {
	if (cached) return cached;
	if (typeof window === "undefined") return {
		visitorId: null,
		platform: "server",
		browser: "server",
		screen: "-",
		timezone: "UTC"
	};
	let visitorId = null;
	try {
		visitorId = (await (await index.load()).get()).visitorId;
	} catch {}
	cached = {
		visitorId,
		platform: navigator.platform || "Unknown",
		browser: detectBrowser(navigator.userAgent),
		screen: `${window.screen.width}\xD7${window.screen.height}`,
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
	};
	return cached;
}
var accessToken = null;
var accessTokenExpiry = null;
var tokenStorage = {
	get: () => accessToken,
	set: (token, expiresInSeconds = 900) => {
		accessToken = token;
		accessTokenExpiry = Date.now() + Number(expiresInSeconds) * 1e3;
	},
	expiresAt: () => accessTokenExpiry,
	isExpired: () => accessTokenExpiry !== null && accessTokenExpiry <= Date.now(),
	clear: () => {
		accessToken = null;
		accessTokenExpiry = null;
	}
};
var currentUser = null;
var userStorage = {
	get: () => currentUser,
	set: (user) => {
		currentUser = user;
	},
	clear: () => {
		currentUser = null;
	}
};
var API_BASE$1 = "http://localhost:8080";
var refreshPromise$1 = null;
function unwrapSession(response) {
	const payload = response?.data;
	if (!payload) return null;
	if ("data" in payload && payload.data) return payload.data;
	return payload;
}
async function refreshAuth() {
	if (refreshPromise$1) return refreshPromise$1;
	refreshPromise$1 = axios.post(`${API_BASE$1}/api/auth/refresh`, {}, { withCredentials: true }).then((response) => {
		const session = unwrapSession(response);
		if (session?.accessToken) {
			tokenStorage.set(session.accessToken, session.expiresIn ?? 900);
			if (session.user) userStorage.set(session.user);
			return session;
		}
		return null;
	}).catch(() => null).finally(() => {
		refreshPromise$1 = null;
	});
	return refreshPromise$1;
}
function storeAuthSession(session) {
	if (!session?.accessToken) return;
	tokenStorage.set(session.accessToken, session.expiresIn ?? 900);
	if (session.user) userStorage.set(session.user);
}
function clearAuth() {
	tokenStorage.clear();
	userStorage.clear();
	delete axios.defaults.headers.common.Authorization;
}
var API_BASE = "http://localhost:8080";
var NON_RETRYABLE_MUTATIONS = /* @__PURE__ */ new Set([
	"POST",
	"PUT",
	"PATCH",
	"DELETE"
]);
var refreshPromise = null;
var api = axios.create({
	baseURL: API_BASE,
	timeout: 15e3,
	headers: { "Content-Type": "application/json" },
	withCredentials: true
});
api.interceptors.request.use(async (config) => {
	const headers = config.headers ?? {};
	const token = tokenStorage.get();
	if (token) headers.Authorization = `Bearer ${token}`;
	try {
		const fingerprint = await getDeviceFingerprint();
		if (fingerprint?.visitorId) headers["X-Device-Fingerprint"] = fingerprint.visitorId;
	} catch {}
	config.headers = headers;
	return config;
});
function normalizeApiError(error) {
	const status = error?.response?.status ?? null;
	const backendMessage = error?.response?.data?.message ?? error?.response?.data?.error;
	const fallback = error?.message ?? "Unexpected network error";
	return {
		status,
		message: {
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
			504: "The request timed out."
		}[status] ?? backendMessage ?? fallback
	};
}
api.interceptors.response.use((response) => response, async (error) => {
	const status = error.response?.status;
	const method = (error.config?.method ?? "get").toUpperCase();
	const isFinancialMutation = NON_RETRYABLE_MUTATIONS.has(method) && /\/(transfer|beneficiar|favorite)/i.test(error.config?.url ?? "");
	const isAuthRefreshCall = error.config?.url?.includes("/api/auth/refresh");
	if (status === 401 && !error.config?._authRetry && !isFinancialMutation && !isAuthRefreshCall) {
		if (!refreshPromise) refreshPromise = refreshAuth().finally(() => {
			refreshPromise = null;
		});
		try {
			const session = await refreshPromise;
			if (session?.accessToken) {
				const retryConfig = {
					...error.config,
					_authRetry: true,
					headers: {
						...error.config?.headers,
						Authorization: `Bearer ${session.accessToken}`
					}
				};
				return api.request(retryConfig);
			}
		} catch {}
	}
	if (status === 401 && typeof window !== "undefined") {
		clearAuth();
		if (!window.location.pathname.startsWith("/login")) window.location.assign("/login");
	}
	return Promise.reject(normalizeApiError(error));
});
var unwrap = (response) => response.data?.data ?? response.data;
var authService = {
	identify: (email) => api.post("/api/auth/identify", { email }).then(unwrap),
	continueEmail: (input) => api.post("/api/auth/continue", input).then(unwrap),
	register: (input) => api.post("/api/auth/register", input).then(unwrap),
	verifyRegistration: ({ email, code }) => api.post("/api/auth/register/verify", {
		email,
		otp: code
	}).then(unwrap),
	requestLoginOtp: (email) => api.post("/api/auth/login/otp/request", { email }).then(unwrap),
	getGoogleConfig: () => api.get("/api/auth/google/config").then(unwrap),
	verifyLoginOtp: ({ email, code }) => api.post("/api/auth/login/otp/verify", {
		loginId: email,
		otp: code
	}).then(unwrap),
	verifyLoginStepUp: ({ challengeId, code }) => api.post("/api/auth/login/step-up/verify", {
		challengeId,
		otp: code
	}).then(unwrap),
	loginWithGoogle: (input) => api.post("/api/auth/login/google", input).then(unwrap),
	loginWithFace: ({ email, image, images }) => api.post("/api/auth/login/face", {
		email,
		faceImage: image,
		faceImages: images
	}).then(unwrap),
	loginWithTrustedDevice: ({ email }) => api.post("/api/auth/login/trusted-device", { email }).then(unwrap),
	refreshSession: () => api.post("/api/auth/refresh", {}).then(unwrap),
	logout: ({ allDevices = false, deviceId = null } = {}) => api.post("/api/auth/logout", null, {
		params: { allDevices },
		headers: deviceId ? { "X-Device-Id": deviceId } : void 0
	}).then(unwrap),
	logoutAllDevices: () => authService.logout({ allDevices: true }),
	getDevices: () => api.get("/api/devices").then(unwrap),
	trustDevice: (deviceId) => api.post(`/api/devices/${deviceId}/trust`).then(unwrap),
	removeDevice: (deviceId) => api.delete(`/api/devices/${deviceId}`).then(unwrap),
	getProfile: () => api.get("/api/users/me").then(unwrap),
	updateProfile: (payload) => api.put("/api/users/me", payload).then(unwrap),
	enrollFace: (frames) => api.post("/api/users/me/face-enroll", { faceImages: frames }).then(unwrap),
	loginHistory: () => api.get("/api/users/me/login-history").then(unwrap)
};
var PENDING_FLOW_KEY = "techrush.auth.pending-flow";
function readPendingAuthFlow() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.sessionStorage.getItem(PENDING_FLOW_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		return parsed;
	} catch {
		return null;
	}
}
var getPendingAuthFlow = readPendingAuthFlow;
function writePendingAuthFlow(flow) {
	if (typeof window === "undefined") return flow;
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
	if (!user) return "Guest";
	const parts = [user.firstName, user.lastName].filter(Boolean);
	if (parts.length > 0) return parts.join(" ");
	return user.email ?? "Guest";
}
function getSessionSecurityScore(user, authMethod = "otp") {
	let score = 68;
	if (user?.emailVerified) score += 8;
	if (user?.faceEnrolled) score += 12;
	if (user?.role === "ADMIN") score += 6;
	if (authMethod === "face") score += 4;
	else if (authMethod === "device") score += 2;
	return Math.min(99, score);
}
function normalizeUser(user, authMethod = "otp") {
	if (!user) return null;
	return {
		...user,
		id: user.userId,
		name: getDisplayName(user),
		authMethod,
		authLevel: authMethod === "device" ? "WEAK" : "STRONG",
		securityScore: getSessionSecurityScore(user, authMethod)
	};
}
var authSession_exports = /* @__PURE__ */ __exportAll({
	bootstrapAuthSession: () => bootstrapAuthSession,
	endSession: () => endSession,
	establishSession: () => establishSession,
	getCurrentDeviceId: () => getCurrentDeviceId,
	getPendingAuthFlow: () => getPendingAuthFlow,
	setPendingFlow: () => setPendingFlow
});
var bootstrapPromise = null;
var currentDeviceId = null;
function getStoredSession() {
	const token = tokenStorage.get();
	const user = userStorage.get();
	if (token && !tokenStorage.isExpired() && user) return {
		status: "AUTHENTICATED",
		token,
		user,
		expiresAt: tokenStorage.expiresAt()
	};
	return {
		status: "UNAUTHENTICATED",
		token: null,
		user: null,
		expiresAt: null
	};
}
async function updateCurrentDeviceId() {
	try {
		const devices = await authService.getDevices();
		if (!Array.isArray(devices) || devices.length === 0) {
			currentDeviceId = null;
			return null;
		}
		currentDeviceId = [...devices].sort((left, right) => new Date(right.lastUsed ?? right.firstSeen ?? 0).getTime() - new Date(left.lastUsed ?? left.firstSeen ?? 0).getTime())[0]?.deviceId ?? null;
		return currentDeviceId;
	} catch {
		currentDeviceId = null;
		return null;
	}
}
async function bootstrapAuthSession() {
	if (bootstrapPromise) return bootstrapPromise;
	bootstrapPromise = (async () => {
		const pendingFlow = getPendingAuthFlow();
		if (pendingFlow?.type === "registration" || pendingFlow?.type === "login" || pendingFlow?.type === "step-up") {
			clearAuth();
			currentDeviceId = null;
			return {
				status: pendingFlow.type === "step-up" ? "STEP_UP_REQUIRED" : "OTP_REQUIRED",
				token: null,
				user: null,
				expiresAt: null,
				currentDeviceId: null
			};
		}
		const stored = getStoredSession();
		if (stored.status === "AUTHENTICATED") {
			clearPendingAuthFlow();
			await updateCurrentDeviceId();
			return {
				...stored,
				currentDeviceId
			};
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
				currentDeviceId
			};
		}
		clearAuth();
		currentDeviceId = null;
		return {
			status: "UNAUTHENTICATED",
			token: null,
			user: null,
			expiresAt: null,
			currentDeviceId: null
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
		currentDeviceId
	};
}
async function endSession({ allDevices = false } = {}) {
	try {
		await authService.logout({
			allDevices,
			deviceId: currentDeviceId
		});
	} catch {} finally {
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
//#endregion
export { bootstrapAuthSession as a, getCurrentDeviceId as c, normalizeUser as d, setPendingFlow as f, authSession_BkpFMSMQ_exports as i, getDeviceFingerprint as l, api as n, endSession as o, tokenStorage as p, authService as r, establishSession as s, __exportAll as t, getPendingAuthFlow as u };
