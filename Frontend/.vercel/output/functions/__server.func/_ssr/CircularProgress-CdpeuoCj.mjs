import { t as cn } from "./utils-_lkLOWLq.mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CircularProgress-CdpeuoCj.js
var import_jsx_runtime = require_jsx_runtime();
function CircularProgress({ value, size = 132, strokeWidth = 10, label, caption, className }) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const clamped = Math.max(0, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative inline-flex items-center justify-center", className),
		style: {
			width: size,
			height: size
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			className: "-rotate-90",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "gauge-gradient",
					x1: "0",
					y1: "0",
					x2: "1",
					y2: "1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--primary)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "55%",
							stopColor: "var(--secondary)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--accent)"
						})
					]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: size / 2,
					cy: size / 2,
					r: radius,
					strokeWidth,
					className: "fill-none stroke-muted"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.circle, {
					cx: size / 2,
					cy: size / 2,
					r: radius,
					strokeWidth,
					strokeLinecap: "round",
					stroke: "url(#gauge-gradient)",
					className: "fill-none",
					strokeDasharray: circumference,
					initial: { strokeDashoffset: circumference },
					animate: { strokeDashoffset: circumference - clamped / 100 * circumference },
					transition: {
						duration: 1.2,
						ease: "easeOut"
					}
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-2xl font-semibold text-foreground",
				children: label ?? `${Math.round(clamped)}`
			}), caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] uppercase tracking-widest text-muted-foreground",
				children: caption
			})]
		})]
	});
}
//#endregion
export { CircularProgress as t };
