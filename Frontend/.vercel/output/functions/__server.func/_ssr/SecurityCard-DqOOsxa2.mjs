import { t as cn } from "./utils-_lkLOWLq.mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SecurityCard-DqOOsxa2.js
var import_jsx_runtime = require_jsx_runtime();
var tones = {
	primary: "text-primary bg-primary/12 border-primary/25",
	accent: "text-accent bg-accent/12 border-accent/25",
	success: "text-success bg-success/12 border-success/25",
	warning: "text-warning bg-warning/12 border-warning/25",
	danger: "text-destructive bg-destructive/12 border-destructive/25"
};
function SecurityCard({ icon: Icon, label, value, meta, tone = "primary", index = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 18
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .45,
			delay: index * .06
		},
		whileHover: { y: -6 },
		className: "glass-panel gradient-border card-glow rounded-3xl p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-widest text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("inline-flex size-9 items-center justify-center rounded-xl border", tones[tone]),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-lg font-semibold text-foreground",
				children: value
			}),
			meta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: meta
			})
		]
	});
}
function AuthBadge({ label, tone = "primary", icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", tones[tone]),
		children: [Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), label]
	});
}
//#endregion
export { SecurityCard as n, AuthBadge as t };
