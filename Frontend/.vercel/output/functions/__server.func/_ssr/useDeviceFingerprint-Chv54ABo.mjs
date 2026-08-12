import { o as __toESM } from "../_runtime.mjs";
import { l as getDeviceFingerprint } from "./authSession-BkpFMSMQ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion } from "../_libs/framer-motion.mjs";
import { M as FingerprintPattern } from "../_libs/lucide-react.mjs";
import { n as Skeleton } from "./Loader-V5YPL4Np.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useDeviceFingerprint-Chv54ABo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FingerprintVisual({ fingerprint }) {
	if (!fingerprint) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 w-full" });
	const visitorId = fingerprint.visitorId ?? "Unavailable";
	const bits = visitorId.padEnd(32, "0").slice(0, 32).split("").map((char) => (parseInt(char, 36) || 0) % 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-panel rounded-3xl p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintPattern, { className: "size-4" }), "Device fingerprint"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 break-all font-mono text-xs text-muted-foreground",
				children: visitorId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-1",
				style: { gridTemplateColumns: "repeat(16, minmax(0, 1fr))" },
				children: bits.map((bit, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
					initial: {
						opacity: .2,
						scaleY: .4
					},
					animate: {
						opacity: .35 + bit * .16,
						scaleY: .5 + bit * .12
					},
					transition: {
						duration: .6,
						delay: index * .02,
						repeat: Infinity,
						repeatType: "reverse"
					},
					className: "h-8 rounded-sm bg-gradient-brand"
				}, index))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-5 grid grid-cols-2 gap-3 text-xs",
				children: [
					["Platform", fingerprint.platform],
					["Browser", fingerprint.browser],
					["Screen", fingerprint.screen],
					["Timezone", fingerprint.timezone]
				].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-muted/60 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-0.5 font-medium text-foreground",
						children: value
					})]
				}, label))
			})
		]
	});
}
function useDeviceFingerprint() {
	const [fingerprint, setFingerprint] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let active = true;
		getDeviceFingerprint().then((value) => {
			if (active) setFingerprint(value);
		});
		return () => {
			active = false;
		};
	}, []);
	return fingerprint;
}
//#endregion
export { useDeviceFingerprint as n, FingerprintVisual as t };
