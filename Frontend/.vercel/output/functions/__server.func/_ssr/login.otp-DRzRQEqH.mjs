import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as ShieldCheck, x as Mail } from "../_libs/lucide-react.mjs";
import { i as useAuth, n as Button } from "./router-COFnCbEf.mjs";
import { t as Input } from "./Input-DD5okQ9K.mjs";
import { t as AuthLayout } from "./AuthLayout-gpShQqoX.mjs";
import { t as OtpInput } from "./OtpInput-C11DP6A2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login.otp-DRzRQEqH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/login/otp")({});
function OtpLoginPage() {
	const router = useRouter();
	const { pendingFlow, requestLoginOtp, verifyLoginOtp, isBusy, status } = useAuth();
	const [stage, setStage] = (0, import_react.useState)(pendingFlow?.type === "login" && pendingFlow.email ? "verify" : "request");
	const [email, setEmail] = (0, import_react.useState)(pendingFlow?.email ?? "");
	const [code, setCode] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (pendingFlow?.type === "registration") router.navigate({
			to: "/register/verify",
			replace: true
		});
	}, [pendingFlow, router]);
	(0, import_react.useEffect)(() => {
		if (pendingFlow?.type === "step-up" && pendingFlow.challengeId) router.navigate({
			to: "/login/step-up",
			replace: true
		});
	}, [pendingFlow, router]);
	(0, import_react.useEffect)(() => {
		if (pendingFlow?.type === "login" && pendingFlow.email) {
			setEmail(pendingFlow.email);
			setStage("verify");
		}
	}, [pendingFlow]);
	const title = (0, import_react.useMemo)(() => stage === "verify" ? "Enter your code" : "Continue with email", [stage]);
	const description = (0, import_react.useMemo)(() => {
		if (stage === "verify") return `We sent a single-use code to ${email || "your email"}.`;
		return "We will send a one-time code to your inbox. No password required.";
	}, [email, stage]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title,
		description,
		children: stage === "request" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-5",
			onSubmit: async (event) => {
				event.preventDefault();
				await requestLoginOtp(email);
				setCode("");
				setStage("verify");
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				label: "Email address",
				type: "email",
				placeholder: "you@company.com",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }),
				value: email,
				onChange: (event) => setEmail(event.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				fullWidth: true,
				size: "lg",
				loading: isBusy,
				disabled: !email.trim() || status === "INITIALIZING",
				children: "Request code"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl border border-glass-border bg-muted/30 p-4 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-foreground",
						children: "Verification email sent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1",
						children: email || "Check your inbox for the latest code."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtpInput, {
					value: code,
					onChange: setCode,
					disabled: isBusy,
					onComplete: async (value) => {
						if (value.length === 6) try {
							if ((await verifyLoginOtp({
								email,
								code: value
							}))?.authenticationState === "STEP_UP_REQUIRED") await router.navigate({
								to: "/login/step-up",
								replace: true
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
								if ((await verifyLoginOtp({
									email,
									code
								}))?.authenticationState === "STEP_UP_REQUIRED") await router.navigate({
									to: "/login/step-up",
									replace: true
								});
							} catch {
								setCode("");
							}
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), "Verify and continue"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						fullWidth: true,
						size: "lg",
						variant: "glass",
						disabled: isBusy,
						onClick: async () => {
							await requestLoginOtp(email);
							setCode("");
						},
						children: "Resend code"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm font-semibold text-primary hover:underline",
					onClick: () => setStage("request"),
					children: "Use a different email"
				})
			]
		})
	});
}
//#endregion
export { Route, OtpLoginPage as component };
