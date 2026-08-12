import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-_lkLOWLq.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Input-DD5okQ9K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = (0, import_react.forwardRef)(function Input2({ className, label, hint, error, icon, id, ...props }, ref) {
	const generatedId = (0, import_react.useId)();
	const inputId = id ?? generatedId;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: inputId,
				className: "block text-sm font-medium text-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
					children: icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref,
					id: inputId,
					"aria-invalid": Boolean(error),
					className: cn("h-12 w-full rounded-2xl border border-border bg-card/70 px-4 text-sm text-foreground", "placeholder:text-muted-foreground/70 transition-all", "focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/15", icon && "pl-11", error && "border-destructive/70 focus:ring-destructive/20", className),
					...props
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-destructive",
				children: error
			}) : hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
});
//#endregion
export { Input as t };
