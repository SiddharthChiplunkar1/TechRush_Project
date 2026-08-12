import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion, o as AnimatePresence } from "../_libs/framer-motion.mjs";
import { D as Lightbulb } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SecurityTipsCarousel-B9mK5NcB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tips = [
	"Face ID unlocks in under two seconds and never leaves your device unencrypted.",
	"Trusted devices are bound to a rotating fingerprint — stolen tokens alone are useless.",
	"Email OTPs expire in 60 seconds and are single-use by design.",
	"Review your login history weekly and revoke anything unfamiliar."
];
function SecurityTipsCarousel() {
	const [index, setIndex] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setIndex((i) => (i + 1) % tips.length), 5200);
		return () => window.clearInterval(id);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-panel relative overflow-hidden rounded-3xl p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4" }), "Security tip"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mt-3 h-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
					mode: "wait",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						initial: {
							opacity: 0,
							y: 12
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -12
						},
						transition: { duration: .4 },
						className: "text-sm leading-relaxed text-muted-foreground",
						children: tips[index]
					}, index)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex gap-1.5",
				children: tips.map((tip, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					"aria-label": `Show tip ${i + 1}`,
					onClick: () => setIndex(i),
					className: `h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-3 bg-muted"}`
				}, tip))
			})
		]
	});
}
//#endregion
export { SecurityTipsCarousel as t };
