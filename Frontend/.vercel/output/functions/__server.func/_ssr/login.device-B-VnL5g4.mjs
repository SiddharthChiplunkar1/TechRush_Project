import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as ShieldCheck } from "../_libs/lucide-react.mjs";
import { i as useAuth, n as Button } from "./router-COFnCbEf.mjs";
import { t as Input } from "./Input-DD5okQ9K.mjs";
import { n as useDeviceFingerprint, t as FingerprintVisual } from "./useDeviceFingerprint-Chv54ABo.mjs";
import { t as AuthLayout } from "./AuthLayout-gpShQqoX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login.device-B-VnL5g4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/login/device")({});
function DeviceLoginPage() {
	const fingerprint = useDeviceFingerprint();
	const { loginWithTrustedDevice, isBusy } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Trusted device login",
		description: "Use an already approved device to sign in without another OTP.",
		backTo: "/login",
		backLabel: "All methods",
		wide: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[1.15fr_0.85fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Email address",
						type: "email",
						placeholder: "you@company.com",
						value: email,
						onChange: (event) => setEmail(event.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						fullWidth: true,
						size: "lg",
						loading: isBusy,
						disabled: !email.trim(),
						onClick: async () => {
							await loginWithTrustedDevice({ email });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), "Continue on this device"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel rounded-[2rem] p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs font-semibold uppercase tracking-widest text-accent",
						children: "Device fingerprint"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintVisual, { fingerprint })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-xs text-muted-foreground",
				children: "Trusted device sign-in still goes through the gateway and uses the current browser fingerprint."
			})]
		})
	});
}
//#endregion
export { Route, DeviceLoginPage as component };
