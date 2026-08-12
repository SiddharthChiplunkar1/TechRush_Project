import { o as __toESM } from "../_runtime.mjs";
import { r as authService } from "./authSession-BkpFMSMQ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as LogOut, K as Bell, s as Sun, u as Shield, v as Moon } from "../_libs/lucide-react.mjs";
import { i as useAuth, n as Button, r as useThemeContext } from "./router-COFnCbEf.mjs";
import { t as AppShell } from "./AppShell-BBejEn7w.mjs";
import { t as Modal } from "./Modal-BruMXIUu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-Vv9NMCui.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/_authenticated/settings")({});
function Toggle({ checked, onChange, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		onClick: () => onChange(!checked),
		className: `relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-gradient-brand" : "bg-muted"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-1 size-5 rounded-full bg-card shadow-sm transition-all ${checked ? "left-6" : "left-1"}` })
	});
}
function Row({ icon: Icon, title, description, control }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4 rounded-2xl bg-muted/60 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-foreground",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: description
			})] })]
		}), control]
	});
}
function SettingsPage() {
	const { theme, setTheme } = useThemeContext();
	const { logout } = useAuth();
	const [emailAlerts, setEmailAlerts] = (0, import_react.useState)(true);
	const [pushAlerts, setPushAlerts] = (0, import_react.useState)(false);
	const [analyticsOptIn, setAnalyticsOptIn] = (0, import_react.useState)(true);
	const [confirmOpen, setConfirmOpen] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Settings",
		subtitle: "Appearance, alerts and session control",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 xl:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-panel rounded-[2rem] p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: "Appearance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: theme === "dark" ? Moon : Sun,
							title: "Dark mode",
							description: "Deep space canvas tuned for low-light use",
							control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "Dark mode",
								checked: theme === "dark",
								onChange: (value) => setTheme(value ? "dark" : "light")
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-3",
							children: ["dark", "light"].map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setTheme(mode),
								className: `rounded-2xl border p-4 text-left text-sm capitalize transition-all ${theme === mode ? "border-primary/60 shadow-glow" : "border-border hover:border-primary/30"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block font-medium text-foreground",
									children: [mode, " theme"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: mode === "dark" ? "#020617 canvas" : "#F8FAFC canvas"
								})]
							}, mode))
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-panel rounded-[2rem] p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: "Notifications"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: Bell,
							title: "Email alerts",
							description: "New device and blocked attempt notices",
							control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "Email alerts",
								checked: emailAlerts,
								onChange: setEmailAlerts
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: Bell,
							title: "Push alerts",
							description: "Real-time push on suspicious activity",
							control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "Push alerts",
								checked: pushAlerts,
								onChange: setPushAlerts
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-panel rounded-[2rem] p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: "Privacy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: Shield,
							title: "Anonymous analytics",
							description: "Share aggregate auth metrics to improve detection",
							control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "Analytics",
								checked: analyticsOptIn,
								onChange: setAnalyticsOptIn
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-panel rounded-[2rem] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold",
							children: "Sessions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Revoke every issued JWT and force re-authentication everywhere."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "danger",
							className: "mt-5",
							onClick: () => setConfirmOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Logout all devices"]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: confirmOpen,
			onClose: () => setConfirmOpen(false),
			title: "Logout all devices?",
			description: "Every active session will end immediately, including this one.",
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "glass",
				onClick: () => setConfirmOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "danger",
				loading: busy,
				onClick: async () => {
					setBusy(true);
					try {
						const result = await authService.logoutAllDevices();
						toast.success(`${result.revoked} sessions revoked`);
						logout({ silent: true });
					} finally {
						setBusy(false);
					}
				},
				children: "Revoke everything"
			})] })
		})]
	});
}
//#endregion
export { Route, SettingsPage as component };
