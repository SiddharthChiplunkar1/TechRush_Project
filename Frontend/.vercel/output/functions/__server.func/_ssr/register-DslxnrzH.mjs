import { o as __toESM } from "../_runtime.mjs";
import { f as setPendingFlow } from "./authSession-BkpFMSMQ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { d as useRouterState, g as createFileRoute, m as Outlet, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as UserRound, x as Mail } from "../_libs/lucide-react.mjs";
import { i as useAuth, n as Button } from "./router-COFnCbEf.mjs";
import { t as Input } from "./Input-DD5okQ9K.mjs";
import { r as useForm } from "../_libs/@hookform/resolvers+[...].mjs";
import { t as AuthLayout } from "./AuthLayout-gpShQqoX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-DslxnrzH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/register")({});
function RegisterPage() {
	const router = useRouter();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const { register: createAccount, isBusy, pendingFlow } = useAuth();
	const { register, handleSubmit, formState: { errors }, setValue } = useForm({ defaultValues: {
		firstName: pendingFlow?.firstName ?? "",
		lastName: pendingFlow?.lastName ?? "",
		email: pendingFlow?.email ?? ""
	} });
	(0, import_react.useEffect)(() => {
		if (pendingFlow?.type === "registration" && pendingFlow.email) {
			setValue("email", pendingFlow.email);
			setValue("firstName", pendingFlow.firstName ?? "");
			setValue("lastName", pendingFlow.lastName ?? "");
		}
	}, [pendingFlow, setValue]);
	if (pathname === "/register/verify") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Create your account",
		description: "We’ll send a verification code to your email after registration.",
		backTo: "/login",
		backLabel: "Back to sign in",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-5",
			onSubmit: handleSubmit(async (values) => {
				const flow = {
					type: "registration",
					email: ((await createAccount(values))?.email ?? values.email).trim().toLowerCase(),
					firstName: values.firstName?.trim() ?? "",
					lastName: values.lastName?.trim() ?? ""
				};
				setPendingFlow(flow);
				await router.navigate({ to: "/register/verify" });
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "First name",
						placeholder: "Alex",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }),
						error: errors.firstName?.message,
						...register("firstName", {
							required: "First name is required",
							minLength: {
								value: 2,
								message: "Too short"
							}
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Last name",
						placeholder: "Morgan",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }),
						error: errors.lastName?.message,
						...register("lastName", {
							required: "Last name is required",
							minLength: {
								value: 2,
								message: "Too short"
							}
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					label: "Email address",
					type: "email",
					placeholder: "you@company.com",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }),
					error: errors.email?.message,
					...register("email", {
						required: "Email is required",
						pattern: {
							value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
							message: "Enter a valid email"
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					fullWidth: true,
					size: "lg",
					loading: isBusy,
					children: "Create account"
				})
			]
		})
	});
}
//#endregion
export { Route, RegisterPage as component };
