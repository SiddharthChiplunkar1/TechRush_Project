import { o as __toESM } from "../_runtime.mjs";
import { r as authService } from "./authSession-BkpFMSMQ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useAuth } from "./router-COFnCbEf.mjs";
import { t as AppShell } from "./AppShell-BBejEn7w.mjs";
import { t as FaceScanner } from "./FaceScanner-C7w8Xh7G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/face-enrollment-Bbb7UnAC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/_authenticated/face-enrollment")({});
function FaceEnrollmentPage() {
	const { markFaceEnrolled } = useAuth();
	const router = useRouter();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [done, setDone] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Face enrollment",
		subtitle: "Add biometric login to your account",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-panel mx-auto max-w-2xl rounded-[2rem] p-7",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-7 text-sm text-muted-foreground",
				children: "Find even lighting, remove sunglasses and keep your face centered. During capture, blink naturally or slowly turn your head so the live-face check can reject photographs and screen replays."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaceScanner, {
				submitLabel: "Enroll face",
				busy,
				succeeded: done,
				onSubmit: async (image) => {
					setBusy(true);
					let enrolled = false;
					try {
						await authService.enrollFace(image);
						markFaceEnrolled();
						setDone(true);
						enrolled = true;
						toast.success("Face enrolled — Biometric level unlocked");
					} catch (error) {
						toast.error(error?.message ?? "Enrollment failed, please retake");
					} finally {
						setBusy(false);
					}
					if (enrolled) try {
						await router.navigate({ to: "/dashboard" });
					} catch {
						toast.error("Face enrolled, but dashboard navigation failed. Open /dashboard manually.");
					}
				}
			})]
		})
	});
}
//#endregion
export { Route, FaceEnrollmentPage as component };
