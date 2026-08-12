import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as ShieldCheck, f as ShieldAlert } from "../_libs/lucide-react.mjs";
import { i as useAuth, n as Button } from "./router-COFnCbEf.mjs";
import { t as AuthLayout } from "./AuthLayout-gpShQqoX.mjs";
import { t as OtpInput } from "./OtpInput-C11DP6A2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login.step-up-3lwQg5Hf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/login/step-up")({});
function StepUpPage() {
	const router = useRouter();
	const { pendingFlow, verifyLoginStepUp, isBusy } = useAuth();
	const [code, setCode] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (pendingFlow?.type !== "step-up" || !pendingFlow.challengeId) router.navigate({
			to: "/login/otp",
			replace: true
		});
	}, [pendingFlow, router]);
	const email = pendingFlow?.email ?? "your account";
	const challengeId = pendingFlow?.challengeId ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Additional verification required",
		description: `We need one more OTP for ${email}. Finish the step-up challenge to continue.`,
		backTo: "/login/otp",
		backLabel: "Back to login",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4 text-amber-500" }), "High-risk login detected"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted-foreground",
						children: "No session has been created yet. Enter the step-up code to complete sign-in."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtpInput, {
					value: code,
					onChange: setCode,
					disabled: isBusy
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						fullWidth: true,
						size: "lg",
						loading: isBusy,
						disabled: code.length !== 6 || !challengeId,
						onClick: async () => {
							try {
								await verifyLoginStepUp({
									challengeId,
									code,
									email
								});
							} catch {
								setCode("");
							}
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), "Verify step-up"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						fullWidth: true,
						size: "lg",
						variant: "glass",
						onClick: () => void router.navigate({
							to: "/login/otp",
							replace: true
						}),
						children: "Restart login"
					})]
				})
			]
		})
	});
}
//#endregion
export { Route, StepUpPage as component };
