import { o as __toESM } from "../_runtime.mjs";
import { a as bootstrapAuthSession, c as getCurrentDeviceId, d as normalizeUser, f as setPendingFlow, o as endSession, p as tokenStorage, r as authService, s as establishSession, t as __exportAll, u as getPendingAuthFlow } from "./authSession-BkpFMSMQ.mjs";
import { t as cn } from "./utils-_lkLOWLq.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as redirect, _ as createRootRouteWithContext, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as motion, o as AnimatePresence } from "../_libs/framer-motion.mjs";
import { E as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-COFnCbEf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var INITIAL_STATE = {
	status: "INITIALIZING",
	user: null,
	token: null,
	expiresAt: null,
	pendingFlow: null,
	currentDeviceId: null,
	error: null,
	isBusy: false
};
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const router = useRouter();
	const [state, setState] = (0, import_react.useState)({
		...INITIAL_STATE,
		pendingFlow: getPendingAuthFlow()
	});
	(0, import_react.useEffect)(() => {
		let active = true;
		bootstrapAuthSession().then((snapshot) => {
			if (!active) return;
			setState((current) => ({
				...current,
				status: snapshot.status,
				user: snapshot.user ? normalizeUser(snapshot.user, snapshot.user.authMethod ?? "otp") : null,
				token: snapshot.token,
				expiresAt: snapshot.expiresAt,
				currentDeviceId: snapshot.currentDeviceId ?? getCurrentDeviceId(),
				pendingFlow: getPendingAuthFlow(),
				error: null
			}));
		}).catch((error) => {
			if (!active) return;
			setState((current) => ({
				...current,
				status: "AUTH_ERROR",
				user: null,
				token: null,
				expiresAt: null,
				currentDeviceId: null,
				pendingFlow: getPendingAuthFlow(),
				error: error?.message ?? "Unable to restore session"
			}));
		});
		return () => {
			active = false;
		};
	}, []);
	const commitSession = (0, import_react.useCallback)(async (session, authMethod = "otp") => {
		const enrichedSession = {
			...session,
			user: normalizeUser(session.user, authMethod)
		};
		const snapshot = await establishSession(enrichedSession);
		setState((current) => ({
			...current,
			status: snapshot.status,
			user: snapshot.user,
			token: snapshot.token,
			expiresAt: snapshot.expiresAt,
			pendingFlow: getPendingAuthFlow(),
			currentDeviceId: snapshot.currentDeviceId ?? getCurrentDeviceId(),
			error: null
		}));
		return enrichedSession.user;
	}, []);
	const finishAuthentication = (0, import_react.useCallback)(async (session, authMethod = "otp") => {
		await commitSession(session, authMethod);
		await router.navigate({ to: "/dashboard" });
		return session;
	}, [commitSession, router]);
	const markPendingFlow = (0, import_react.useCallback)((flow) => {
		setPendingFlow(flow);
		setState((current) => ({
			...current,
			pendingFlow: flow,
			status: flow?.type === "step-up" ? "STEP_UP_REQUIRED" : "OTP_REQUIRED",
			error: null
		}));
		return flow;
	}, []);
	const run = (0, import_react.useCallback)(async (task, successMessage, options = {}) => {
		setState((current) => ({
			...current,
			isBusy: true,
			error: null
		}));
		try {
			const result = await task();
			if (result?.authenticationState === "STEP_UP_REQUIRED") {
				markPendingFlow({
					type: "step-up",
					email: options.email ?? result?.user?.email ?? null,
					challengeId: result.authenticationChallenge
				});
				toast.info("Additional verification is required");
				return result;
			}
			if (result?.accessToken) {
				await finishAuthentication(result, options.authMethod ?? "otp");
				toast.success(successMessage);
				return result;
			}
			throw new Error("Authentication could not be completed. Please try again.");
		} catch (error) {
			const message = error?.message ?? "Authentication failed";
			setState((current) => ({
				...current,
				error: message
			}));
			toast.error(message);
			throw error;
		} finally {
			setState((current) => ({
				...current,
				isBusy: false
			}));
		}
	}, [finishAuthentication, markPendingFlow]);
	const register = (0, import_react.useCallback)(async (input) => {
		setState((current) => ({
			...current,
			isBusy: true,
			error: null
		}));
		try {
			const result = await authService.register(input);
			markPendingFlow({
				type: "registration",
				email: (result?.email ?? input.email).trim().toLowerCase(),
				firstName: input.firstName?.trim() ?? "",
				lastName: input.lastName?.trim() ?? ""
			});
			toast.success("Verification code sent");
			return result;
		} catch (error) {
			const message = error?.message ?? "Unable to start registration";
			setState((current) => ({
				...current,
				error: message
			}));
			toast.error(message);
			throw error;
		} finally {
			setState((current) => ({
				...current,
				isBusy: false
			}));
		}
	}, [markPendingFlow]);
	const requestLoginOtp = (0, import_react.useCallback)(async (email) => {
		const normalizedEmail = email.trim().toLowerCase();
		setState((current) => ({
			...current,
			isBusy: true,
			error: null
		}));
		try {
			await authService.identify(normalizedEmail);
			const result = await authService.requestLoginOtp(normalizedEmail);
			markPendingFlow({
				type: "login",
				email: normalizedEmail
			});
			toast.success("Verification code sent");
			return result;
		} catch (error) {
			const message = error?.status === 404 ? "No account is registered with that email." : error?.message ?? "Unable to send verification code";
			setState((current) => ({
				...current,
				error: message
			}));
			toast.error(message);
			throw error;
		} finally {
			setState((current) => ({
				...current,
				isBusy: false
			}));
		}
	}, [markPendingFlow]);
	const verifyRegistration = (0, import_react.useCallback)(async ({ email, code }) => run(() => authService.verifyRegistration({
		email,
		code
	}), "Account created and verified", { authMethod: "otp" }), [run]);
	const verifyLoginOtp = (0, import_react.useCallback)(async ({ email, code }) => run(() => authService.verifyLoginOtp({
		email,
		code
	}), "Identity verified", {
		authMethod: "otp",
		email
	}), [run]);
	const verifyLoginStepUp = (0, import_react.useCallback)(async ({ challengeId, code, email }) => run(() => authService.verifyLoginStepUp({
		challengeId,
		code
	}), "Additional verification complete", {
		authMethod: "otp",
		email
	}), [run]);
	const loginWithGoogle = (0, import_react.useCallback)(async (input) => run(() => authService.loginWithGoogle(input), "Signed in with Google", { authMethod: "google" }), [run]);
	const loginWithFace = (0, import_react.useCallback)(async ({ email, image, images }) => run(() => authService.loginWithFace({
		email,
		image,
		images
	}), "Face matched", { authMethod: "face" }), [run]);
	const loginWithTrustedDevice = (0, import_react.useCallback)(async ({ email }) => run(() => authService.loginWithTrustedDevice({ email: email.trim().toLowerCase() }), "Trusted device recognised", {
		authMethod: "device",
		email
	}), [run]);
	const markFaceEnrolled = (0, import_react.useCallback)(() => {
		setState((current) => {
			if (!current.user) return current;
			const user = normalizeUser({
				...current.user,
				faceEnrolled: true
			}, current.user.authMethod ?? "otp");
			return {
				...current,
				user
			};
		});
	}, []);
	const logout = (0, import_react.useCallback)(async (options = {}) => {
		await endSession({ allDevices: Boolean(options.allDevices) });
		setState({
			...INITIAL_STATE,
			status: "UNAUTHENTICATED",
			pendingFlow: null
		});
		if (!options.silent) toast.success("Signed out securely");
		await router.navigate({
			to: "/login",
			replace: true
		});
	}, [router]);
	const clearPendingState = (0, import_react.useCallback)(() => {
		setPendingFlow(null);
		setState((current) => ({
			...current,
			pendingFlow: null,
			status: current.token && current.user ? "AUTHENTICATED" : "UNAUTHENTICATED"
		}));
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		user: state.user,
		token: state.token,
		expiresAt: state.expiresAt,
		pendingFlow: state.pendingFlow,
		status: state.status,
		isHydrated: state.status !== "INITIALIZING",
		isInitializing: state.status === "INITIALIZING",
		isAuthenticated: state.status === "AUTHENTICATED",
		isBusy: state.isBusy,
		error: state.error,
		identify: (email) => authService.identify(email),
		continueEmail: (input) => authService.continueEmail(input),
		register,
		requestLoginOtp,
		verifyRegistration,
		verifyLoginOtp,
		verifyLoginStepUp,
		loginWithGoogle,
		loginWithFace,
		loginWithTrustedDevice,
		markFaceEnrolled,
		clearPendingState,
		logout
	}), [
		clearPendingState,
		logout,
		register,
		requestLoginOtp,
		state.error,
		state.expiresAt,
		state.isBusy,
		state.pendingFlow,
		state.status,
		state.token,
		state.user,
		verifyLoginOtp,
		verifyLoginStepUp,
		verifyRegistration,
		loginWithFace,
		loginWithGoogle,
		loginWithTrustedDevice,
		markFaceEnrolled
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const context = (0, import_react.useContext)(AuthContext);
	if (!context) throw new Error("useAuth must be used within <AuthProvider>");
	return context;
}
var THEME_STORAGE_KEY = "securepass.theme";
var ThemeContext = (0, import_react.createContext)(null);
var themeBootstrapScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"dark";document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`;
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("dark");
	(0, import_react.useEffect)(() => {
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
		const initial = stored === "light" || stored === "dark" ? stored : "dark";
		setThemeState(initial);
		document.documentElement.classList.toggle("dark", initial === "dark");
	}, []);
	const setTheme = (0, import_react.useCallback)((next) => {
		setThemeState(next);
		document.documentElement.classList.toggle("dark", next === "dark");
		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, next);
		} catch {}
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		theme,
		setTheme,
		toggle: () => setTheme(theme === "dark" ? "light" : "dark")
	}), [theme, setTheme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value,
		children
	});
}
function useThemeContext() {
	const context = (0, import_react.useContext)(ThemeContext);
	if (!context) throw new Error("useThemeContext must be used inside ThemeProvider");
	return context;
}
function PageTransition({ children }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
		mode: "wait",
		initial: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: {
				opacity: 0,
				y: 16,
				filter: "blur(6px)"
			},
			animate: {
				opacity: 1,
				y: 0,
				filter: "blur(0px)"
			},
			exit: {
				opacity: 0,
				y: -10,
				filter: "blur(6px)"
			},
			transition: {
				duration: .32,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			children
		}, pathname)
	});
}
var variants = {
	primary: "bg-gradient-brand text-primary-foreground shadow-lift hover:brightness-110 focus-visible:ring-primary",
	secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary",
	glass: "glass-panel text-foreground hover:border-primary/45 hover:shadow-glow focus-visible:ring-primary",
	ghost: "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-primary",
	danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
	success: "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success"
};
var sizes = {
	sm: "h-9 px-4 text-sm rounded-xl",
	md: "h-11 px-5 text-sm rounded-2xl",
	lg: "h-13 px-7 text-base rounded-2xl"
};
var Button = (0, import_react.forwardRef)(function Button2({ className, variant = "primary", size = "md", loading = false, fullWidth, children, disabled, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
		ref,
		...disabled || loading ? {} : {
			whileHover: { y: -2 },
			whileTap: { scale: .975 }
		},
		transition: {
			type: "spring",
			stiffness: 420,
			damping: 26
		},
		disabled: disabled || loading,
		className: cn("inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-colors", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background", "disabled:pointer-events-none disabled:opacity-55", variants[variant], sizes[size], fullWidth && "w-full", className),
		...props,
		children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-4 animate-spin",
			"aria-hidden": true
		}), children]
	});
});
var styles_default = "/assets/styles-CiLtmmZo.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-panel max-w-md rounded-3xl p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-7xl font-bold text-gradient",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "This route doesn't exist inside SecurePass AI."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Back to home" })
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-panel max-w-md rounded-3xl p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. Try again or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							router.invalidate();
							reset();
						},
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "glass",
							children: "Go home"
						})
					})]
				})
			]
		})
	});
}
var Route$20 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "SecurePass AI — Passwordless Authentication Platform" },
			{
				name: "description",
				content: "SecurePass AI secures identity with Face ID, Google OAuth, email OTP and trusted device fingerprinting."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "theme-color",
				content: "#020617"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: themeBootstrapScript } })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$20.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-center",
			richColors: true,
			closeButton: true
		})] }) })
	});
}
var $$splitComponentImporter$19 = () => import("./routes-YeN98Ba9.mjs");
var Route$19 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "SecurePass AI — Experience Passwordless Authentication" },
		{
			name: "description",
			content: "Face ID, Google OAuth, email OTP and trusted device login in one premium passwordless identity platform."
		},
		{
			property: "og:title",
			content: "SecurePass AI — Experience Passwordless Authentication"
		},
		{
			property: "og:description",
			content: "Passwordless identity with biometrics, OTP, OAuth and device fingerprinting."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./route-Cfvz5fsE.mjs");
var Route$18 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const session = await bootstrapAuthSession();
		if (!tokenStorage.get() || tokenStorage.isExpired()) {
			tokenStorage.clear();
			throw redirect({ to: "/login" });
		}
		return { session };
	},
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./register-DslxnrzH.mjs");
var Route$17 = createFileRoute("/register")({
	beforeLoad: async () => {
		await bootstrapAuthSession();
		if (tokenStorage.get() && !tokenStorage.isExpired()) throw redirect({ to: "/dashboard" });
	},
	head: () => ({ meta: [
		{ title: "Create your SecurePass AI account" },
		{
			name: "description",
			content: "Register once and sign in forever without a password."
		},
		{
			property: "og:title",
			content: "Create your SecurePass AI account"
		},
		{
			property: "og:description",
			content: "Register once, then verify the OTP to finish setup."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./unauthorized-ZPuTa59y.mjs");
var Route$16 = createFileRoute("/unauthorized")({
	head: () => ({ meta: [
		{ title: "Unauthorized — SecurePass AI" },
		{
			name: "description",
			content: "Your session expired or you lack access to this area."
		},
		{
			property: "og:title",
			content: "Unauthorized — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Sign in again to continue."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./admin-BsEg6Hhy.mjs");
var Route$15 = createFileRoute("/_authenticated/admin")({
	beforeLoad: ({ context }) => {
		if (context.session?.user?.role !== "ADMIN") throw redirect({ to: "/unauthorized" });
	},
	head: () => ({ meta: [
		{ title: "Admin panel - SecurePass AI" },
		{
			name: "description",
			content: "Restricted authentication administration controls."
		},
		{
			name: "robots",
			content: "noindex, nofollow"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./beneficiaries-BygIRzGl.mjs");
var Route$14 = createFileRoute("/_authenticated/beneficiaries")({
	head: () => ({ meta: [
		{ title: "Beneficiaries - SecurePass AI" },
		{
			name: "description",
			content: "Manage the beneficiaries owned by your authenticated account."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./dashboard-DOnP6C6H.mjs");
var Route$13 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "Security dashboard — SecurePass AI" },
		{
			name: "description",
			content: "Live security score, session status, device trust and authentication history."
		},
		{
			property: "og:title",
			content: "Security dashboard — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Your passwordless identity posture at a glance."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./face-enrollment-Bbb7UnAC.mjs");
var Route$12 = createFileRoute("/_authenticated/face-enrollment")({
	head: () => ({ meta: [
		{ title: "Face enrollment — SecurePass AI" },
		{
			name: "description",
			content: "Capture and enroll your face template for biometric passwordless login."
		},
		{
			property: "og:title",
			content: "Face enrollment — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Enroll once, then log in with a glance."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./profile-BnQxZidk.mjs");
var Route$11 = createFileRoute("/_authenticated/profile")({
	head: () => ({ meta: [
		{ title: "Profile — SecurePass AI" },
		{
			name: "description",
			content: "Your personal information, enabled authentication methods and security status."
		},
		{
			property: "og:title",
			content: "Profile — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Manage your passwordless identity profile."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./settings-Vv9NMCui.mjs");
var Route$10 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [
		{ title: "Settings — SecurePass AI" },
		{
			name: "description",
			content: "Theme, notification, privacy and session controls for your account."
		},
		{
			property: "og:title",
			content: "Settings — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Tune appearance, alerts and session security."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./transactions-VetfZMli.mjs");
var Route$9 = createFileRoute("/_authenticated/transactions")({
	head: () => ({ meta: [
		{ title: "Transactions — SecurePass AI" },
		{
			name: "description",
			content: "Recent banking transactions for the authenticated user."
		},
		{
			property: "og:title",
			content: "Transactions — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Review recent transfer history and receipts."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./transfer-r-30HAYA.mjs");
var Route$8 = createFileRoute("/_authenticated/transfer")({
	head: () => ({ meta: [
		{ title: "Transfer funds - SecurePass AI" },
		{
			name: "description",
			content: "Send a real transfer to an existing beneficiary and complete any required step-up verification."
		},
		{
			property: "og:title",
			content: "Transfer funds - SecurePass AI"
		},
		{
			property: "og:description",
			content: "A secure banking transfer flow with server-recorded step-up verification."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./trusted-devices-C6aRAjz8.mjs");
var Route$7 = createFileRoute("/_authenticated/trusted-devices")({
	head: () => ({ meta: [
		{ title: "Trusted devices — SecurePass AI" },
		{
			name: "description",
			content: "Review, trust and revoke the devices allowed to access your account."
		},
		{
			property: "og:title",
			content: "Trusted devices — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Device-level control over every session."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./login.index-Dz3gGGJS.mjs");
var Route$6 = createFileRoute("/login/")({
	beforeLoad: async () => {
		await bootstrapAuthSession();
		if (tokenStorage.get() && !tokenStorage.isExpired()) throw redirect({ to: "/dashboard" });
	},
	head: () => ({ meta: [
		{ title: "Sign in — SecurePass AI" },
		{
			name: "description",
			content: "Choose Face ID, Google OAuth, email OTP or a trusted device to sign in."
		},
		{
			property: "og:title",
			content: "Sign in — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Four passwordless ways to prove who you are."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./login.device-B-VnL5g4.mjs");
var Route$5 = createFileRoute("/login/device")({
	beforeLoad: async () => {
		await bootstrapAuthSession();
		if (tokenStorage.get() && !tokenStorage.isExpired()) throw redirect({ to: "/dashboard" });
	},
	head: () => ({ meta: [
		{ title: "Trusted device login — SecurePass AI" },
		{
			name: "description",
			content: "Silent re-authentication using this device's approved fingerprint."
		},
		{
			property: "og:title",
			content: "Trusted device login — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Recognized hardware signs you in when it is already trusted."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./login.face-gzPFEdAA.mjs");
var Route$4 = createFileRoute("/login/face")({
	head: () => ({ meta: [
		{ title: "Face login — SecurePass AI" },
		{
			name: "description",
			content: "Biometric face login with live scanning and liveness detection."
		},
		{
			property: "og:title",
			content: "Face login — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Look at the camera and you are in."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./login.google-Cwi7lTNp.mjs");
var Route$3 = createFileRoute("/login/google")({
	head: () => ({ meta: [
		{ title: "Google login — SecurePass AI" },
		{
			name: "description",
			content: "Sign in to SecurePass AI with federated Google OAuth."
		},
		{
			property: "og:title",
			content: "Google login — SecurePass AI"
		},
		{
			property: "og:description",
			content: "One tap federated sign-in."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./login.otp-DRzRQEqH.mjs");
var Route$2 = createFileRoute("/login/otp")({
	beforeLoad: async () => {
		await bootstrapAuthSession();
		if (tokenStorage.get() && !tokenStorage.isExpired()) throw redirect({ to: "/dashboard" });
	},
	head: () => ({ meta: [
		{ title: "Email OTP login — SecurePass AI" },
		{
			name: "description",
			content: "Request a six digit code and verify your identity in seconds."
		},
		{
			property: "og:title",
			content: "Email OTP login — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Single-use codes that expire quickly."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./login.step-up-3lwQg5Hf.mjs");
var Route$1 = createFileRoute("/login/step-up")({
	beforeLoad: async () => {
		await bootstrapAuthSession();
		if (tokenStorage.get() && !tokenStorage.isExpired()) throw redirect({ to: "/dashboard" });
	},
	head: () => ({ meta: [
		{ title: "Step-up verification — SecurePass AI" },
		{
			name: "description",
			content: "Complete additional OTP verification to finish sign-in."
		},
		{
			property: "og:title",
			content: "Step-up verification — SecurePass AI"
		},
		{
			property: "og:description",
			content: "High-risk logins require a second code before access is granted."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./register.verify-DswFFcAO.mjs");
var Route = createFileRoute("/register/verify")({
	beforeLoad: async () => {
		await bootstrapAuthSession();
		if (tokenStorage.get() && !tokenStorage.isExpired()) throw redirect({ to: "/dashboard" });
	},
	head: () => ({ meta: [
		{ title: "Verify registration — SecurePass AI" },
		{
			name: "description",
			content: "Enter the OTP sent after registration to complete account creation."
		},
		{
			property: "og:title",
			content: "Verify registration — SecurePass AI"
		},
		{
			property: "og:description",
			content: "Complete your account setup with a one-time code."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$19.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$20
});
var AuthenticatedRouteRoute = Route$18.update({
	id: "/_authenticated",
	getParentRoute: () => Route$20
});
var RegisterRoute = Route$17.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => Route$20
});
var UnauthorizedRoute = Route$16.update({
	id: "/unauthorized",
	path: "/unauthorized",
	getParentRoute: () => Route$20
});
var AuthenticatedAdminRoute = Route$15.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedBeneficiariesRoute = Route$14.update({
	id: "/beneficiaries",
	path: "/beneficiaries",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$13.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedFaceEnrollmentRoute = Route$12.update({
	id: "/face-enrollment",
	path: "/face-enrollment",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$11.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$10.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTransactionsRoute = Route$9.update({
	id: "/transactions",
	path: "/transactions",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTransferRoute = Route$8.update({
	id: "/transfer",
	path: "/transfer",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTrustedDevicesRoute = Route$7.update({
	id: "/trusted-devices",
	path: "/trusted-devices",
	getParentRoute: () => AuthenticatedRouteRoute
});
var LoginIndexRoute = Route$6.update({
	id: "/login/",
	path: "/login/",
	getParentRoute: () => Route$20
});
var LoginDeviceRoute = Route$5.update({
	id: "/login/device",
	path: "/login/device",
	getParentRoute: () => Route$20
});
var LoginFaceRoute = Route$4.update({
	id: "/login/face",
	path: "/login/face",
	getParentRoute: () => Route$20
});
var LoginGoogleRoute = Route$3.update({
	id: "/login/google",
	path: "/login/google",
	getParentRoute: () => Route$20
});
var LoginOtpRoute = Route$2.update({
	id: "/login/otp",
	path: "/login/otp",
	getParentRoute: () => Route$20
});
var LoginStepUpRoute = Route$1.update({
	id: "/login/step-up",
	path: "/login/step-up",
	getParentRoute: () => Route$20
});
var RegisterVerifyRoute = Route.update({
	id: "/verify",
	path: "/verify",
	getParentRoute: () => RegisterRoute
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminRoute,
	AuthenticatedBeneficiariesRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedFaceEnrollmentRoute,
	AuthenticatedProfileRoute,
	AuthenticatedSettingsRoute,
	AuthenticatedTransactionsRoute,
	AuthenticatedTransferRoute,
	AuthenticatedTrustedDevicesRoute
};
var AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
var RegisterRouteChildren = { RegisterVerifyRoute };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
	RegisterRoute: RegisterRoute._addFileChildren(RegisterRouteChildren),
	UnauthorizedRoute,
	LoginDeviceRoute,
	LoginFaceRoute,
	LoginGoogleRoute,
	LoginOtpRoute,
	LoginStepUpRoute,
	LoginIndexRoute
};
var routeTree = Route$20._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { useAuth as i, Button as n, useThemeContext as r, router_exports as t };
