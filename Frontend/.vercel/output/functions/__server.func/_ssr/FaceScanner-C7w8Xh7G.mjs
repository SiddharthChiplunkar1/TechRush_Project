import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion, o as AnimatePresence } from "../_libs/framer-motion.mjs";
import { H as Check, U as Camera, h as RefreshCw, m as ScanFace } from "../_libs/lucide-react.mjs";
import { n as Button } from "./router-COFnCbEf.mjs";
import { t as require_react_webcam } from "../_libs/react-webcam.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FaceScanner-C7w8Xh7G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_webcam = /* @__PURE__ */ __toESM(require_react_webcam());
function FaceScanner({ onSubmit, submitLabel, busy = false, succeeded = false }) {
	const webcamRef = (0, import_react.useRef)(null);
	const [shot, setShot] = (0, import_react.useState)(null);
	const [cameraError, setCameraError] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		return () => {
			(webcamRef.current?.stream)?.getTracks().forEach((track) => track.stop());
		};
	}, []);
	const capture = (0, import_react.useCallback)(async () => {
		const frames = [];
		for (let index = 0; index < 5; index += 1) {
			const image = webcamRef.current?.getScreenshot();
			if (image) frames.push(image);
			await new Promise((resolve) => window.setTimeout(resolve, 140));
		}
		if (frames.length === 5) setShot(frames);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-square w-full max-w-sm overflow-hidden rounded-[2rem] border border-glass-border bg-card/60 shadow-glow",
			children: [
				shot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: shot[0],
					alt: "Captured face preview",
					className: "size-full object-cover"
				}) : cameraError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "size-10 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Camera unavailable. Allow camera access in your browser to continue."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_webcam.default, {
					ref: webcamRef,
					audio: false,
					mirrored: true,
					screenshotFormat: "image/jpeg",
					onUserMediaError: () => setCameraError(true),
					videoConstraints: { facingMode: "user" },
					className: "size-full object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-6 rounded-[1.6rem] border border-primary/50" }),
						[
							"left-6 top-6",
							"right-6 top-6",
							"left-6 bottom-6",
							"right-6 bottom-6"
						].map((pos) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute ${pos} size-8 rounded-md border-2 border-accent` }, pos)),
						!shot && !cameraError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-x-6 top-6 h-[calc(100%-3rem)] overflow-hidden rounded-[1.6rem]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-scan h-24 w-full bg-gradient-to-b from-transparent via-accent/45 to-transparent" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							className: "absolute inset-0 -rotate-90",
							viewBox: "0 0 100 100",
							preserveAspectRatio: "none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.circle, {
								cx: "50",
								cy: "50",
								r: "46",
								fill: "none",
								stroke: "var(--accent)",
								strokeWidth: "0.7",
								strokeDasharray: "289",
								animate: { strokeDashoffset: busy ? [289, 0] : [
									289,
									120,
									289
								] },
								transition: {
									duration: busy ? 1.4 : 4,
									repeat: Infinity,
									ease: "easeInOut"
								},
								vectorEffect: "non-scaling-stroke"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: succeeded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: { opacity: 0 },
					animate: { opacity: 1 },
					exit: { opacity: 0 },
					className: "absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
						initial: {
							scale: .4,
							opacity: 0
						},
						animate: {
							scale: 1,
							opacity: 1
						},
						transition: {
							type: "spring",
							stiffness: 320,
							damping: 18
						},
						className: "inline-flex size-20 items-center justify-center rounded-full bg-success text-success-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-10" })
					})
				}) })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap justify-center gap-3",
			children: !shot ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "lg",
				onClick: capture,
				disabled: cameraError,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" }), "Capture face"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "lg",
				loading: busy,
				onClick: () => void onSubmit(shot),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "size-4" }), submitLabel]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "lg",
				variant: "glass",
				onClick: () => setShot(null),
				disabled: busy,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Retake"]
			})] })
		})]
	});
}
//#endregion
export { FaceScanner as t };
