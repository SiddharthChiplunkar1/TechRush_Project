import { o as __toESM } from "../_runtime.mjs";
import { r as authService } from "./authSession-BkpFMSMQ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as ShieldCheck, h as RefreshCw, o as Trash2, y as MonitorSmartphone } from "../_libs/lucide-react.mjs";
import { n as Button } from "./router-COFnCbEf.mjs";
import { t as AppShell } from "./AppShell-BBejEn7w.mjs";
import { t as CardSkeleton } from "./Loader-V5YPL4Np.mjs";
import { t as EmptyState } from "./EmptyState-CY8pxcEZ.mjs";
import { t as AuthBadge } from "./SecurityCard-DqOOsxa2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trusted-devices-C6aRAjz8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/_authenticated/trusted-devices")({});
function sortDevices(devices) {
	return [...devices].sort((left, right) => new Date(right.lastUsed ?? right.firstSeen ?? 0).getTime() - new Date(left.lastUsed ?? left.firstSeen ?? 0).getTime());
}
function TrustedDevicesPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const devicesQuery = useQuery({
		queryKey: ["devices"],
		queryFn: authService.getDevices
	});
	const devices = (0, import_react.useMemo)(() => sortDevices(devicesQuery.data ?? []), [devicesQuery.data]);
	const currentDeviceId = devices[0]?.deviceId ?? null;
	const refresh = () => queryClient.invalidateQueries({ queryKey: ["devices"] });
	const trustDevice = useMutation({
		mutationFn: (deviceId) => authService.trustDevice(deviceId),
		onSuccess: () => {
			toast.success("Device trusted");
			refresh();
		},
		onError: () => toast.error("Could not trust that device")
	});
	const removeDevice = useMutation({
		mutationFn: (deviceId) => authService.removeDevice(deviceId),
		onSuccess: () => {
			toast.success("Device removed");
			refresh();
		},
		onError: () => toast.error("Could not remove that device")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Trusted devices",
		subtitle: "Every session is bound to a device fingerprint",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 flex justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "glass",
				onClick: () => refresh(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Refresh list"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "glass",
				onClick: () => void router.navigate({ to: "/login/device" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorSmartphone, { className: "size-4" }), "Add this device"]
			})]
		}), devicesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {})
			]
		}) : devices.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
			children: devices.map((device) => {
				const isCurrent = device.deviceId === currentDeviceId;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "glass-panel gradient-border rounded-3xl p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBadge, {
								label: isCurrent ? "This device" : device.trusted ? "Trusted" : "Untrusted",
								tone: isCurrent || device.trusted ? "success" : "warning",
								icon: ShieldCheck
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-base font-semibold text-foreground",
							children: device.deviceName ?? "Unknown device"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 space-y-1.5 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "text-foreground/80",
										children: device.deviceType ?? "UNKNOWN"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Browser" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "text-foreground/80",
										children: device.browser ?? "Unknown"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Operating system" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "text-foreground/80",
										children: device.operatingSystem ?? "Unknown"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "First seen" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "text-foreground/80",
										children: device.firstSeen ? new Date(device.firstSeen).toLocaleString() : "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Last used" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "text-foreground/80",
										children: device.lastUsed ? new Date(device.lastUsed).toLocaleString() : "—"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex gap-2",
							children: [!device.trusted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								loading: trustDevice.isPending,
								onClick: () => trustDevice.mutate(device.deviceId),
								children: "Trust device"
							}), !isCurrent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "glass",
								loading: removeDevice.isPending,
								onClick: () => removeDevice.mutate(device.deviceId),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Remove"]
							})]
						})
					]
				}, device.deviceId);
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: MonitorSmartphone,
			title: "No devices yet",
			description: "The first time you sign in, we’ll show the device the backend registered."
		})]
	});
}
//#endregion
export { Route, TrustedDevicesPage as component };
