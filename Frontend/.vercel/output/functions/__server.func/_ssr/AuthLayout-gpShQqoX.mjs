import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion } from "../_libs/framer-motion.mjs";
import { X as ArrowLeft, d as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as AnimatedBackground } from "./AnimatedBackground-CxNNc361.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthLayout-gpShQqoX.js
var import_jsx_runtime = require_jsx_runtime();
function AuthLayout({ title, description, children, backTo = "/login", backLabel = "All methods", wide = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen flex-col items-center justify-center px-4 py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedBackground, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "mb-8 flex items-center gap-2.5",
				"aria-label": "SecurePass AI home",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-lift",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-base font-semibold",
					children: ["Secure", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-gradient",
						children: "Pass AI"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
				initial: {
					opacity: 0,
					y: 22,
					scale: .985
				},
				animate: {
					opacity: 1,
					y: 0,
					scale: 1
				},
				transition: { duration: .5 },
				className: `glass-panel w-full rounded-[2rem] p-6 sm:p-9 ${wide ? "max-w-4xl" : "max-w-md"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-7",
						children
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: backTo,
				className: "mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), backLabel]
			})
		]
	});
}
//#endregion
export { AuthLayout as t };
