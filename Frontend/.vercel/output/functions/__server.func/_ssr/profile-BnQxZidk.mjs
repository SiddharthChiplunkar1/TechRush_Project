import { g as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { A as KeyRound, W as CalendarDays, d as ShieldCheck, i as UserRound, m as ScanFace, x as Mail, y as MonitorSmartphone } from "../_libs/lucide-react.mjs";
import { i as useAuth } from "./router-COFnCbEf.mjs";
import { t as AppShell } from "./AppShell-BBejEn7w.mjs";
import { t as AuthBadge } from "./SecurityCard-DqOOsxa2.mjs";
import { t as CircularProgress } from "./CircularProgress-CdpeuoCj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-BnQxZidk.js
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/_authenticated/profile")({});
function ProfilePage() {
	const { user } = useAuth();
	const methods = [
		{
			label: "Email OTP",
			icon: Mail,
			enabled: true
		},
		{
			label: "Google OAuth",
			icon: KeyRound,
			enabled: user?.authMethod === "google"
		},
		{
			label: "Face ID",
			icon: ScanFace,
			enabled: Boolean(user?.faceEnrolled)
		},
		{
			label: "Trusted device",
			icon: MonitorSmartphone,
			enabled: true
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Profile",
		subtitle: "Identity details and enabled methods",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-[1fr_1.3fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass-panel gradient-border rounded-[2rem] p-7 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex size-24 items-center justify-center rounded-full bg-gradient-brand text-2xl font-bold text-primary-foreground shadow-lift",
						children: (user?.name ?? "SP").split(" ").map((part) => part[0]).slice(0, 2).join("")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-5 text-xl font-semibold",
						children: user?.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: user?.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex justify-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBadge, {
							label: `${user?.authLevel ?? "Basic"} level`,
							tone: "primary",
							icon: ShieldCheck
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-7 flex justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircularProgress, {
							value: user?.securityScore ?? 70,
							caption: "Security score",
							size: 120
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-panel rounded-[2rem] p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold",
						children: "Personal information"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [
							[
								"Full name",
								user?.name ?? "—",
								UserRound
							],
							[
								"Email",
								user?.email ?? "—",
								Mail
							],
							[
								"Member since",
								user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—",
								CalendarDays
							],
							[
								"User ID",
								user?.id ?? "—",
								KeyRound
							]
						].map(([label, value, Icon]) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-muted/60 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), label]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 truncate text-sm font-medium text-foreground",
									children: value
								})]
							}, label);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-panel rounded-[2rem] p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold",
						children: "Authentication methods"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: methods.map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between rounded-2xl bg-muted/60 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-3 text-sm font-medium text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(method.icon, { className: "size-4 text-primary" }), method.label]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBadge, {
								label: method.enabled ? "Enabled" : "Not set up",
								tone: method.enabled ? "success" : "warning"
							})]
						}, method.label))
					})]
				})]
			})]
		})
	});
}
//#endregion
export { Route, ProfilePage as component };
