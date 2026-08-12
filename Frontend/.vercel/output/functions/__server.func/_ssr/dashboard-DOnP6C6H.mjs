import { r as authService } from "./authSession-BkpFMSMQ.mjs";
import { g as createFileRoute, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as motion } from "../_libs/framer-motion.mjs";
import { A as KeyRound, C as LogOut, F as Clock, M as FingerprintPattern, S as MailCheck, d as ShieldCheck, f as ShieldAlert, m as ScanFace, y as MonitorSmartphone } from "../_libs/lucide-react.mjs";
import { i as useAuth, n as Button } from "./router-COFnCbEf.mjs";
import { n as useSessionCountdown, t as AppShell } from "./AppShell-BBejEn7w.mjs";
import { t as CardSkeleton } from "./Loader-V5YPL4Np.mjs";
import { t as EmptyState } from "./EmptyState-CY8pxcEZ.mjs";
import { n as SecurityCard, t as AuthBadge } from "./SecurityCard-DqOOsxa2.mjs";
import { t as CircularProgress } from "./CircularProgress-CdpeuoCj.mjs";
import { n as useDeviceFingerprint, t as FingerprintVisual } from "./useDeviceFingerprint-Chv54ABo.mjs";
import { t as SecurityTipsCarousel } from "./SecurityTipsCarousel-B9mK5NcB.mjs";
import { a as Area, c as Cell, i as XAxis, l as ResponsiveContainer, n as BarChart, o as CartesianGrid, r as YAxis, s as Bar, t as AreaChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DOnP6C6H.js
var import_jsx_runtime = require_jsx_runtime();
var tooltipStyle = {
	borderRadius: 16,
	border: "1px solid var(--border)",
	background: "var(--popover)",
	color: "var(--popover-foreground)",
	fontSize: 12
};
function AuthTrendChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 240,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
			data,
			margin: {
				left: -18,
				right: 8,
				top: 8
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "loginsFill",
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "var(--primary)",
						stopOpacity: .6
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "var(--primary)",
						stopOpacity: 0
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "blockedFill",
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "var(--destructive)",
						stopOpacity: .5
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "var(--destructive)",
						stopOpacity: 0
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "4 6",
					stroke: "var(--border)",
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "label",
					stroke: "var(--muted-foreground)",
					fontSize: 12,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					stroke: "var(--muted-foreground)",
					fontSize: 12,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: tooltipStyle }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					type: "monotone",
					dataKey: "logins",
					stroke: "var(--primary)",
					strokeWidth: 2.5,
					fill: "url(#loginsFill)",
					name: "Successful"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					type: "monotone",
					dataKey: "blocked",
					stroke: "var(--destructive)",
					strokeWidth: 2,
					fill: "url(#blockedFill)",
					name: "Blocked"
				})
			]
		})
	});
}
var methodColors = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)"
];
function MethodBreakdownChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 240,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data,
			margin: {
				left: -18,
				right: 8,
				top: 8
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "4 6",
					stroke: "var(--border)",
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "method",
					stroke: "var(--muted-foreground)",
					fontSize: 12,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					stroke: "var(--muted-foreground)",
					fontSize: 12,
					tickLine: false,
					axisLine: false,
					unit: "%"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: tooltipStyle }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "value",
					radius: [
						10,
						10,
						6,
						6
					],
					name: "Share",
					children: data.map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: methodColors[index % methodColors.length] }, entry.method))
				})
			]
		})
	});
}
var methodMeta = {
	face: {
		label: "Face ID",
		icon: ScanFace
	},
	otp: {
		label: "Email OTP",
		icon: MailCheck
	},
	google: {
		label: "Google OAuth",
		icon: KeyRound
	},
	device: {
		label: "Trusted device",
		icon: MonitorSmartphone
	}
};
function AuthTimeline({ events }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
		className: "relative space-y-4 pl-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute left-2 top-2 bottom-2 w-px bg-border",
			"aria-hidden": true
		}), events.map((event, index) => {
			const meta = methodMeta[event.method];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
				initial: {
					opacity: 0,
					x: -12
				},
				animate: {
					opacity: 1,
					x: 0
				},
				transition: {
					duration: .4,
					delay: index * .07
				},
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `absolute left-[-1.35rem] top-3 size-3 rounded-full ring-4 ring-background ${event.status === "success" ? "bg-success" : "bg-destructive"}`,
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex size-9 items-center justify-center rounded-xl bg-muted text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(meta.icon, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-foreground",
							children: meta.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								event.device,
								" · ",
								event.location
							]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBadge, {
							label: event.status === "success" ? "Verified" : "Blocked",
							tone: event.status === "success" ? "success" : "danger",
							icon: event.status === "success" ? ShieldCheck : ShieldAlert
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: new Date(event.at).toLocaleString(void 0, {
								day: "2-digit",
								month: "short",
								hour: "2-digit",
								minute: "2-digit"
							})
						})]
					})]
				})]
			}, event.id);
		})]
	});
}
var Route = createFileRoute("/_authenticated/dashboard")({});
var methodLabels = {
	face: "Face ID",
	otp: "Email OTP",
	google: "Google OAuth",
	device: "Trusted device"
};
var historyMethodLabels = {
	OTP: "otp",
	GOOGLE_OAUTH: "google",
	FACE_RECOGNITION: "face",
	TRUSTED_DEVICE: "device",
	STEP_UP: "otp"
};
function normalizeLoginHistory(events) {
	return events.map((event, index) => ({
		id: event.loginId ?? `${event.timestamp ?? "event"}-${index}`,
		method: historyMethodLabels[event.method] ?? "otp",
		status: event.status === "SUCCESS" ? "success" : "failed",
		device: event.deviceInfo || "Unknown device",
		location: event.ipAddress || "Unknown location",
		at: event.timestamp
	}));
}
function buildAnalytics(events) {
	const now = /* @__PURE__ */ new Date();
	const days = Array.from({ length: 7 }, (_, index) => {
		const date = new Date(now);
		date.setHours(0, 0, 0, 0);
		date.setDate(date.getDate() - (6 - index));
		return date;
	});
	const timeline = days.map((day) => ({
		label: day.toLocaleDateString(void 0, { weekday: "short" }),
		logins: 0,
		blocked: 0
	}));
	const methodCounts = /* @__PURE__ */ new Map();
	events.forEach((event) => {
		const timestamp = new Date(event.timestamp).getTime();
		const dayIndex = days.findIndex((day, index) => {
			const nextDay = days[index + 1];
			return timestamp >= day.getTime() && (!nextDay || timestamp < nextDay.getTime());
		});
		if (dayIndex >= 0) {
			if (event.status === "SUCCESS") timeline[dayIndex].logins += 1;
			else timeline[dayIndex].blocked += 1;
		}
		const method = historyMethodLabels[event.method] ?? "otp";
		methodCounts.set(method, (methodCounts.get(method) ?? 0) + 1);
	});
	const total = events.length || 1;
	return {
		timeline,
		methods: Object.entries(methodLabels).map(([method, label]) => ({
			method: label,
			value: Math.round((methodCounts.get(method) ?? 0) / total * 100)
		})).filter((entry) => entry.value > 0)
	};
}
function DashboardPage() {
	const { user, logout, expiresAt } = useAuth();
	const fingerprint = useDeviceFingerprint();
	const { formatted, remaining } = useSessionCountdown(expiresAt);
	const history = useQuery({
		queryKey: ["login-history"],
		queryFn: authService.loginHistory
	});
	const loginHistory = normalizeLoginHistory(history.data?.content ?? history.data ?? []);
	const analytics = history.isLoading ? null : buildAnalytics(history.data?.content ?? history.data ?? []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: `Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`,
		subtitle: "Your live identity posture",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-[1.6fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel gradient-border rounded-[2rem] p-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBadge, {
									label: user ? methodLabels[user.authMethod] : "Session",
									tone: "primary",
									icon: ShieldCheck
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBadge, {
									label: `${user?.authLevel ?? "Basic"} level`,
									tone: "accent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBadge, {
									label: "Session protected",
									tone: "success",
									icon: KeyRound
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-5 text-2xl font-bold sm:text-3xl",
							children: user?.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: user?.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-7 flex flex-wrap gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/face-enrollment",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "size-4" }), "Enroll face"] })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/trusted-devices",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "glass",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorSmartphone, { className: "size-4" }), "Manage devices"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "glass",
									onClick: () => logout(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Logout"]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel flex flex-col items-center justify-center gap-3 rounded-[2rem] p-7",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircularProgress, {
						value: user?.securityScore ?? 70,
						caption: "Security score"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs text-muted-foreground",
						children: "Boost your score by enrolling Face ID and pruning unknown devices."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityCard, {
						icon: MonitorSmartphone,
						label: "Current device",
						value: fingerprint ? `${fingerprint.platform} \xB7 ${fingerprint.browser}` : "Detecting…",
						meta: fingerprint?.timezone,
						index: 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityCard, {
						icon: ShieldCheck,
						label: "Trusted device",
						value: "Approved",
						meta: "Bound to fingerprint",
						tone: "success",
						index: 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityCard, {
						icon: Clock,
						label: "JWT expires in",
						value: formatted,
						meta: remaining < 300 ? "Rotating soon" : "Healthy",
						tone: remaining < 300 ? "warning" : "accent",
						index: 2
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityCard, {
						icon: FingerprintPattern,
						label: "Recent login",
						value: user ? methodLabels[user.authMethod] : "—",
						meta: "Just now",
						index: 3
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-5 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-panel rounded-[2rem] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: "Authentication trend"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Successful versus blocked attempts this week"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: analytics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthTrendChart, { data: analytics.timeline }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-panel rounded-[2rem] p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: "Method breakdown"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "How your account is being accessed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: analytics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodBreakdownChart, { data: analytics.methods }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-panel rounded-[2rem] p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold",
						children: "Authentication timeline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						children: history.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {})]
						}) : loginHistory.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthTimeline, { events: loginHistory }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: ShieldCheck,
							title: "No activity yet",
							description: "Sign-in events will appear here as soon as they happen."
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintVisual, { fingerprint }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityTipsCarousel, {})]
				})]
			})
		]
	});
}
//#endregion
export { Route, DashboardPage as component };
