import { o as __toESM } from "../_runtime.mjs";
import { r as authService } from "./authSession-BkpFMSMQ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as motion } from "../_libs/framer-motion.mjs";
import { d as ShieldCheck } from "../_libs/lucide-react.mjs";
import { i as useAuth, n as Button } from "./router-COFnCbEf.mjs";
import { t as AuthLayout } from "./AuthLayout-gpShQqoX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login.google-Cwi7lTNp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GOOGLE_STATE_KEY = "techrush.auth.google-state";
var GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
var Route = createFileRoute("/login/google")({});
function getGoogleRedirectUri() {
	if (typeof window === "undefined") return "";
	return `${window.location.origin}/login/google`;
}
function createOauthState() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function isUsableGoogleClientId(clientId) {
	return Boolean(clientId && !clientId.startsWith("your-google-client-id"));
}
function GoogleLoginPage() {
	const { loginWithGoogle, isBusy } = useAuth();
	const [googleConfig, setGoogleConfig] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let active = true;
		authService.getGoogleConfig().then((config) => {
			if (active) setGoogleConfig(config);
		}).catch(() => {
			if (active) setGoogleConfig(null);
		});
		return () => {
			active = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		const returnedState = params.get("state");
		if (!code) return;
		window.history.replaceState({}, "", window.location.pathname);
		const expectedState = window.sessionStorage.getItem(GOOGLE_STATE_KEY);
		window.sessionStorage.removeItem(GOOGLE_STATE_KEY);
		if (!expectedState || expectedState !== returnedState) {
			toast.error("Google sign-in state could not be verified");
			return;
		}
		loginWithGoogle({
			authorizationCode: code,
			redirectUri: getGoogleRedirectUri()
		}).catch(() => void 0);
	}, [loginWithGoogle]);
	const startGoogleLogin = () => {
		if (typeof window === "undefined") return;
		if (!isUsableGoogleClientId(googleConfig?.clientId)) {
			toast.error("Google login is not configured for this frontend");
			return;
		}
		const state = createOauthState();
		window.sessionStorage.setItem(GOOGLE_STATE_KEY, state);
		const params = new URLSearchParams({
			client_id: googleClientId,
			redirect_uri: googleConfig.redirectUri || getGoogleRedirectUri(),
			response_type: "code",
			scope: "openid email profile",
			state,
			prompt: "select_account"
		});
		window.location.assign(`${GOOGLE_AUTH_URL}?${params.toString()}`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Continue with Google",
		description: "Use the identity provider you already trust.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					animate: { rotate: isBusy ? 360 : 0 },
					transition: {
						duration: 1.2,
						repeat: isBusy ? Infinity : 0,
						ease: "linear"
					},
					className: "relative inline-flex size-28 items-center justify-center rounded-full border border-glass-border bg-card/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-full bg-gradient-brand opacity-20 blur-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: "0 0 48 48",
						className: "relative size-12",
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								fill: "#EA4335",
								d: "M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6c1.9-5.6 7.2-9.7 13.6-9.7z"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								fill: "#4285F4",
								d: "M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8.4h12.7c-.3 2.1-1.6 5.2-4.7 7.3l7.6 5.9c4.5-4.2 6.9-10.3 6.9-17.5z"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								fill: "#FBBC05",
								d: "M10.4 28.8A14.6 14.6 0 0 1 9.6 24c0-1.7.3-3.3.8-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6z"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								fill: "#34A853",
								d: "M24 48c6.5 0 11.9-2.1 15.6-5.9l-7.6-5.9c-2 1.4-4.7 2.4-8 2.4-6.4 0-11.7-4.1-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					fullWidth: true,
					size: "lg",
					loading: isBusy,
					onClick: startGoogleLogin,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), "Sign in with Google"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-muted-foreground",
					children: "We only read your name, email and avatar. A short-lived JWT is issued after consent."
				})
			]
		})
	});
}
//#endregion
export { Route, GoogleLoginPage as component };
