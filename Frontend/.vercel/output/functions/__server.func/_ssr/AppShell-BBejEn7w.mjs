import { o as __toESM } from "../_runtime.mjs";
import { p as tokenStorage } from "./authSession-BkpFMSMQ.mjs";
import { t as cn } from "./utils-_lkLOWLq.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion, o as AnimatePresence } from "../_libs/framer-motion.mjs";
import { C as LogOut, O as LayoutDashboard, P as ContactRound, Y as ArrowRightLeft, b as Menu, d as ShieldCheck, g as ReceiptText, i as UserRound, m as ScanFace, n as X, p as Settings, y as MonitorSmartphone } from "../_libs/lucide-react.mjs";
import { i as useAuth, n as Button } from "./router-COFnCbEf.mjs";
import { t as AnimatedBackground } from "./AnimatedBackground-CxNNc361.mjs";
import { t as ThemeToggle } from "./ThemeToggle-CHFGQ-oh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-BBejEn7w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useSessionCountdown(expiresAt) {
	const [remaining, setRemaining] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const target = expiresAt ?? tokenStorage.expiresAt();
		if (!target) return;
		const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1e3)));
		tick();
		const id = window.setInterval(tick, 1e3);
		return () => window.clearInterval(id);
	}, [expiresAt]);
	return {
		remaining,
		formatted: `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`
	};
}
var navItems = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/transfer",
		label: "Transfer",
		icon: ArrowRightLeft
	},
	{
		to: "/beneficiaries",
		label: "Beneficiaries",
		icon: ContactRound
	},
	{
		to: "/transactions",
		label: "Transactions",
		icon: ReceiptText
	},
	{
		to: "/profile",
		label: "Profile",
		icon: UserRound
	},
	{
		to: "/face-enrollment",
		label: "Face enrollment",
		icon: ScanFace
	},
	{
		to: "/trusted-devices",
		label: "Trusted devices",
		icon: MonitorSmartphone
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings
	}
];
function AppShell({ title, subtitle, children }) {
	const { user, logout, expiresAt } = useAuth();
	const { formatted } = useSessionCountdown(expiresAt);
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const visibleNavItems = user?.role === "ADMIN" ? [...navItems, {
		to: "/admin",
		label: "Admin panel",
		icon: ShieldCheck
	}] : navItems;
	const nav = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "space-y-1",
		children: visibleNavItems.map((item) => {
			const active = pathname === item.to;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				onClick: () => setMobileOpen(false),
				className: cn("flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all", active ? "bg-gradient-brand text-primary-foreground shadow-lift" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4.5" }), item.label]
			}, item.to);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedBackground, { variant: "subtle" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-glass-border bg-sidebar/60 p-5 backdrop-blur-2xl lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-base font-semibold",
							children: ["Secure", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gradient",
								children: "Pass AI"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 flex-1",
						children: nav
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-panel rounded-2xl p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-widest text-muted-foreground",
							children: "Session expires in"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-lg text-foreground",
							children: formatted
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "glass",
						className: "mt-3",
						onClick: () => logout(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Sign out"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:pl-72",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "sticky top-0 z-20 border-b border-glass-border bg-background/70 backdrop-blur-2xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "rounded-xl p-2 text-foreground lg:hidden",
								onClick: () => setMobileOpen(true),
								"aria-label": "Open navigation",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "truncate text-lg font-semibold tracking-tight sm:text-xl",
									children: title
								}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground sm:text-sm",
									children: subtitle
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden text-right sm:block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-foreground",
										children: user?.name ?? "Guest"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: user?.email
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex size-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground",
									children: (user?.name ?? "SP").split(" ").map((part) => part[0]).slice(0, 2).join("")
								})
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.main, {
					initial: {
						opacity: 0,
						y: 14
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { duration: .4 },
					className: "mx-auto max-w-7xl px-4 py-8 sm:px-8",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				className: "fixed inset-0 z-40 lg:hidden",
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					"aria-label": "Close navigation",
					className: "absolute inset-0 bg-background/70 backdrop-blur-sm",
					onClick: () => setMobileOpen(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.aside, {
					initial: { x: -320 },
					animate: { x: 0 },
					exit: { x: -320 },
					transition: {
						type: "spring",
						stiffness: 320,
						damping: 32
					},
					className: "relative z-10 flex h-full w-72 flex-col border-r border-glass-border bg-sidebar p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-base font-semibold",
								children: ["Secure", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gradient",
									children: "Pass AI"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setMobileOpen(false),
								"aria-label": "Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 flex-1",
							children: nav
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "glass",
							onClick: () => logout(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Sign out"]
						})
					]
				})]
			}) })
		]
	});
}
//#endregion
export { useSessionCountdown as n, AppShell as t };
