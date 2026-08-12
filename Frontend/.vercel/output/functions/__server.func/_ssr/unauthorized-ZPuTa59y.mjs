import { g as createFileRoute, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { f as ShieldAlert } from "../_libs/lucide-react.mjs";
import { n as Button } from "./router-COFnCbEf.mjs";
import { t as AnimatedBackground } from "./AnimatedBackground-CxNNc361.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/unauthorized-ZPuTa59y.js
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/unauthorized")({});
function UnauthorizedPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen items-center justify-center px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedBackground, { variant: "subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-panel max-w-md rounded-[2rem] p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/12 text-destructive",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 text-2xl font-bold",
					children: "401 — Unauthorized"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Your token expired or was revoked. Re-authenticate to regain access."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-7 flex flex-wrap justify-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Sign in again" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "glass",
							children: "Back to home"
						})
					})]
				})
			]
		})]
	});
}
//#endregion
export { Route, UnauthorizedPage as component };
