import { o as __toESM } from "../_runtime.mjs";
import { f as setPendingFlow, u as getPendingAuthFlow } from "./authSession-BkpFMSMQ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as ShieldCheck, x as Mail } from "../_libs/lucide-react.mjs";
import { i as useAuth, n as Button } from "./router-COFnCbEf.mjs";
import { t as AuthLayout } from "./AuthLayout-gpShQqoX.mjs";
import { t as OtpInput } from "./OtpInput-C11DP6A2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register.verify-DswFFcAO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/register/verify")({});
function RegistrationOtpPage() {
	const router = useRouter();
	const { pendingFlow, register: createAccount, verifyRegistration, isBusy } = useAuth();
	const storedFlow = getPendingAuthFlow();
	const initialFlow = pendingFlow?.type === "registration" ? pendingFlow : storedFlow?.type === "registration" ? storedFlow : null;
	const [email, setEmail] = (0, import_react.useState)(initialFlow?.email ?? "");
	const [firstName, setFirstName] = (0, import_react.useState)(initialFlow?.firstName ?? "");
	const [lastName, setLastName] = (0, import_react.useState)(initialFlow?.lastName ?? "");
	const [code, setCode] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const registrationFlow = pendingFlow?.type === "registration" && pendingFlow.email ? pendingFlow : getPendingAuthFlow();
		if (registrationFlow?.type !== "registration" || !registrationFlow.email) {
			if (!email) router.navigate({
				to: "/register",
				replace: true
			});
			return;
		}
		setEmail(registrationFlow.email);
		setFirstName(registrationFlow.firstName ?? "");
		setLastName(registrationFlow.lastName ?? "");
	}, [
		email,
		pendingFlow,
		router
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Verify your registration",
		description: `Enter the six digit code sent to ${email || "your email"} to finish creating your account.`,
		backTo: "/register",
		backLabel: "Back to registration",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl border border-glass-border bg-muted/30 p-4 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-foreground",
						children: "Account setup in progress"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1",
						children: "We already sent the verification code. Check your inbox and finish the sign-up."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtpInput, {
					value: code,
					onChange: setCode,
					disabled: isBusy,
					onComplete: async (value) => {
						if (value.length !== 6) return;
						try {
							await verifyRegistration({
								email,
								code: value
							});
						} catch {
							setCode("");
						}
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						fullWidth: true,
						size: "lg",
						loading: isBusy,
						disabled: code.length !== 6,
						onClick: async () => {
							try {
								await verifyRegistration({
									email,
									code
								});
							} catch {
								setCode("");
							}
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), "Verify account"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						fullWidth: true,
						size: "lg",
						variant: "glass",
						disabled: isBusy,
						onClick: async () => {
							await createAccount({
								email,
								firstName,
								lastName
							});
							setPendingFlow({
								type: "registration",
								email,
								firstName,
								lastName
							});
							setCode("");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), "Resend code"]
					})]
				})
			]
		})
	});
}
//#endregion
export { Route, RegistrationOtpPage as component };
