import { g as createFileRoute, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion } from "../_libs/framer-motion.mjs";
import { A as KeyRound, S as MailCheck, m as ScanFace, y as MonitorSmartphone } from "../_libs/lucide-react.mjs";
import { t as AuthLayout } from "./AuthLayout-gpShQqoX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login.index-Dz3gGGJS.js
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/login/")({});
var methods = [
	{
		to: "/login/otp",
		icon: MailCheck,
		title: "OTP Login",
		description: "Six digit single-use code sent straight to your inbox.",
		meta: "~15 sec"
	},
	{
		to: "/login/google",
		icon: KeyRound,
		title: "Google Login",
		description: "Federated OAuth sign-in with your Google account.",
		meta: "1 tap"
	},
	{
		to: "/login/face",
		icon: ScanFace,
		title: "Face Login",
		description: "Biometric match with live scan and liveness detection.",
		meta: "~2 sec"
	},
	{
		to: "/login/device",
		icon: MonitorSmartphone,
		title: "Trusted Device",
		description: "Silent login using this device's approved fingerprint.",
		meta: "instant"
	}
];
function LoginPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthLayout, {
		title: "Choose how you sign in",
		description: "No passwords. Pick the method that fits the moment.",
		backTo: "/",
		backLabel: "Back to home",
		wide: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: methods.map((method, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: {
					opacity: 0,
					y: 20
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .45,
					delay: index * .08
				},
				whileHover: { y: -8 },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: method.to,
					className: "glass-panel gradient-border group relative block h-full overflow-hidden rounded-3xl p-6 transition-shadow hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-8 -top-8 size-24 rounded-full bg-accent/25 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-lift",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(method.icon, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground",
								children: method.meta
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "relative mt-5 text-base font-semibold text-foreground",
							children: method.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "relative mt-2 text-sm leading-relaxed text-muted-foreground",
							children: method.description
						}),
						method.title === "Face Login" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative mt-4 h-1.5 overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								className: "h-full w-1/3 rounded-full bg-gradient-brand",
								animate: { x: ["-10%", "230%"] },
								transition: {
									duration: 2.2,
									repeat: Infinity,
									ease: "easeInOut"
								}
							})
						})
					]
				})
			}, method.to))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-7 text-center text-sm text-muted-foreground",
			children: [
				"New to SecurePass AI?",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/register",
					className: "font-semibold text-primary hover:underline",
					children: "Create an account"
				})
			]
		})]
	});
}
//#endregion
export { Route, LoginPage as component };
