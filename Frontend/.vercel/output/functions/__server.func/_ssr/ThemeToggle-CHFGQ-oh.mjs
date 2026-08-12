import { t as cn } from "./utils-_lkLOWLq.mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion, o as AnimatePresence } from "../_libs/framer-motion.mjs";
import { s as Sun, v as Moon } from "../_libs/lucide-react.mjs";
import { r as useThemeContext } from "./router-COFnCbEf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ThemeToggle-CHFGQ-oh.js
var import_jsx_runtime = require_jsx_runtime();
function ThemeToggle({ className }) {
	const { theme, toggle } = useThemeContext();
	const isDark = theme === "dark";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
		type: "button",
		onClick: toggle,
		whileTap: { scale: .94 },
		"aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
		title: isDark ? "Light mode" : "Dark mode",
		className: cn("relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-glass-border bg-glass text-foreground transition-colors hover:border-primary/40 hover:text-primary", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
			mode: "wait",
			initial: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				initial: {
					y: 12,
					opacity: 0,
					rotate: -35
				},
				animate: {
					y: 0,
					opacity: 1,
					rotate: 0
				},
				exit: {
					y: -12,
					opacity: 0,
					rotate: 35
				},
				transition: {
					duration: .22,
					ease: "easeOut"
				},
				className: "inline-flex",
				children: isDark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4.5" })
			}, theme)
		})
	});
}
//#endregion
export { ThemeToggle as t };
