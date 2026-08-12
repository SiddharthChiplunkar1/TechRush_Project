import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useAuth } from "./router-COFnCbEf.mjs";
import { t as Input } from "./Input-DD5okQ9K.mjs";
import { t as FaceScanner } from "./FaceScanner-C7w8Xh7G.mjs";
import { t as AuthLayout } from "./AuthLayout-gpShQqoX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login.face-gzPFEdAA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/login/face")({});
function FaceLoginPage() {
	const { loginWithFace, isBusy } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [succeeded, setSucceeded] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Face login",
		description: "Center your face and blink naturally or slowly turn your head during capture.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				label: "Email address",
				type: "email",
				placeholder: "you@company.com",
				value: email,
				onChange: (event) => {
					setEmail(event.target.value);
					setSucceeded(false);
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaceScanner, {
				submitLabel: "Verify face",
				busy: isBusy,
				succeeded,
				onSubmit: async (images) => {
					if (!email.trim()) {
						toast.error("Enter your email before starting face login");
						return;
					}
					try {
						await loginWithFace({
							email: email.trim().toLowerCase(),
							image: images[0],
							images
						});
						setSucceeded(true);
					} catch {
						setSucceeded(false);
					}
				}
			})]
		})
	});
}
//#endregion
export { Route, FaceLoginPage as component };
