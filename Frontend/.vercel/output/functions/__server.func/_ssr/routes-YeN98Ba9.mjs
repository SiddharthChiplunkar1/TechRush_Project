import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-_lkLOWLq.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as motion, i as useMotionValue, n as animate, o as AnimatePresence, r as useTransform, t as useInView } from "../_libs/framer-motion.mjs";
import { A as KeyRound, J as ArrowRight, M as FingerprintPattern, N as Cpu, S as MailCheck, b as Menu, d as ShieldCheck, j as Gauge, l as Sparkles, m as ScanFace, n as X, t as Zap, w as Lock, y as MonitorSmartphone } from "../_libs/lucide-react.mjs";
import { n as Button } from "./router-COFnCbEf.mjs";
import { t as AnimatedBackground } from "./AnimatedBackground-CxNNc361.mjs";
import { t as ThemeToggle } from "./ThemeToggle-CHFGQ-oh.mjs";
import { t as CircularProgress } from "./CircularProgress-CdpeuoCj.mjs";
import { t as SecurityTipsCarousel } from "./SecurityTipsCarousel-B9mK5NcB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-YeN98Ba9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var links = [
	{
		label: "Features",
		href: "#features"
	},
	{
		label: "Security",
		href: "#security"
	},
	{
		label: "How it works",
		href: "#how-it-works"
	},
	{
		label: "About",
		href: "#about"
	}
];
function Navbar() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "fixed inset-x-0 top-0 z-40 px-4 pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "glass-panel mx-auto flex max-w-6xl items-center justify-between rounded-3xl px-4 py-3 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2.5",
					"aria-label": "SecurePass AI home",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-lift",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-base font-semibold tracking-tight",
						children: ["PasswordLess", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gradient",
							children: " Auth"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "hidden items-center gap-1 lg:flex",
					children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: link.href,
						className: "rounded-xl px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
						children: link.label
					}) }, link.href))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden items-center gap-2 sm:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								children: "Login"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/register",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								children: "Register"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 sm:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "rounded-xl p-2 text-foreground",
						onClick: () => setOpen((value) => !value),
						"aria-label": open ? "Close menu" : "Open menu",
						"aria-expanded": open,
						children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: -10
			},
			animate: {
				opacity: 1,
				y: 0
			},
			exit: {
				opacity: 0,
				y: -10
			},
			className: "glass-panel mx-auto mt-2 max-w-6xl rounded-3xl p-4 sm:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: link.href,
					onClick: () => setOpen(false),
					className: "block rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
					children: link.label
				}) }, link.href))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					onClick: () => setOpen(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "glass",
						fullWidth: true,
						size: "sm",
						children: "Login"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/register",
					onClick: () => setOpen(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						fullWidth: true,
						size: "sm",
						children: "Register"
					})
				})]
			})]
		}) })]
	});
}
function FeatureCard({ icon: Icon, title, description, index = 0, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
		initial: {
			opacity: 0,
			y: 24
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-60px"
		},
		transition: {
			duration: .5,
			delay: index * .07
		},
		whileHover: { y: -8 },
		className: cn("glass-panel gradient-border group relative overflow-hidden rounded-3xl p-6", "transition-shadow duration-300 hover:shadow-glow", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -top-10 size-28 rounded-full bg-primary/20 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-lift",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-5 text-base font-semibold text-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted-foreground",
				children: description
			})
		]
	});
}
function Counter({ to, prefix = "", suffix = "", decimals = 0, duration = 1.6 }) {
	const ref = (0, import_react.useRef)(null);
	const inView = useInView(ref, {
		once: true,
		margin: "-80px"
	});
	const count = useMotionValue(0);
	const rounded = useTransform(count, (latest) => latest.toFixed(decimals));
	const [display, setDisplay] = (0, import_react.useState)(0 .toFixed(decimals));
	(0, import_react.useEffect)(() => {
		return rounded.on("change", setDisplay);
	}, [rounded]);
	(0, import_react.useEffect)(() => {
		if (!inView) return;
		const controls = animate(count, to, {
			duration,
			ease: "easeOut"
		});
		return () => controls.stop();
	}, [
		inView,
		count,
		to,
		duration
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.span, {
		ref,
		className: "tabular-nums",
		children: [
			prefix,
			display,
			suffix
		]
	});
}
var Route = createFileRoute("/")({});
var features = [
	{
		icon: ScanFace,
		title: "Face Recognition",
		description: "Liveness-checked biometric login that completes in under two seconds."
	},
	{
		icon: MailCheck,
		title: "OTP Authentication",
		description: "Single-use six digit codes delivered by email with a 60 second lifetime."
	},
	{
		icon: KeyRound,
		title: "Google OAuth",
		description: "Federated sign-in with the identity provider your users already trust."
	},
	{
		icon: MonitorSmartphone,
		title: "Trusted Devices",
		description: "Silent re-authentication for devices you have explicitly approved."
	},
	{
		icon: Lock,
		title: "JWT Security",
		description: "Short-lived signed tokens with rotation, revocation and expiry countdown."
	},
	{
		icon: FingerprintPattern,
		title: "Device Fingerprinting",
		description: "Every session is bound to a hardware and browser entropy signature."
	}
];
var steps = [
	{
		title: "Choose authentication method",
		description: "Face, OTP, Google or a trusted device — the user decides.",
		icon: Sparkles
	},
	{
		title: "Verify identity",
		description: "Biometric match, code validation or fingerprint challenge.",
		icon: ShieldCheck
	},
	{
		title: "Generate JWT",
		description: "A short-lived signed token is issued and bound to the device.",
		icon: Lock
	},
	{
		title: "Access dashboard",
		description: "Enter the account with a live security posture snapshot.",
		icon: Gauge
	}
];
function LandingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedBackground, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 sm:pt-40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid items-center gap-14 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 26
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: { duration: .6 },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3.5" }), "Zero passwords. Zero friction."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "mt-6 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl",
									children: [
										"Experience ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-gradient",
											children: "Passwordless"
										}),
										" Authentication"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg",
									children: "Secure your identity using Face ID, Google OAuth, Email OTP and Trusted Devices."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 flex flex-wrap gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/register",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "lg",
											children: ["Get started", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: "#features",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "lg",
											variant: "glass",
											children: "Learn more"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-success" }), " SOC2-style audit trail"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, { className: "size-4 text-accent" }), " On-device biometric matching"]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								scale: .94
							},
							animate: {
								opacity: 1,
								scale: 1
							},
							transition: {
								duration: .7,
								delay: .15
							},
							className: "relative mx-auto w-full max-w-md",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "glass-panel relative aspect-square rounded-[2.5rem] p-8",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-10 rounded-full bg-gradient-brand opacity-25 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex h-full flex-col items-center justify-center gap-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
												animate: { rotate: 360 },
												transition: {
													duration: 26,
													repeat: Infinity,
													ease: "linear"
												},
												className: "absolute inset-4 rounded-full border border-dashed border-primary/35"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
												animate: { rotate: -360 },
												transition: {
													duration: 38,
													repeat: Infinity,
													ease: "linear"
												},
												className: "absolute inset-12 rounded-full border border-accent/30"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "relative inline-flex size-28 items-center justify-center rounded-[2rem] bg-gradient-brand text-primary-foreground shadow-lift",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "size-14" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative text-center",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-semibold text-foreground",
													children: "Identity verified"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground",
													children: "Face ID · 1.4s · JWT issued"
												})]
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									className: "glass-panel animate-float absolute -left-6 top-14 w-44 rounded-2xl p-4",
									initial: {
										opacity: 0,
										x: -20
									},
									animate: {
										opacity: 1,
										x: 0
									},
									transition: { delay: .5 },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] uppercase tracking-widest text-muted-foreground",
										children: "Security score"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-2xl font-semibold text-success",
										children: "96"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									className: "glass-panel animate-float absolute -right-4 bottom-16 w-48 rounded-2xl p-4 [animation-delay:-3s]",
									initial: {
										opacity: 0,
										x: 20
									},
									animate: {
										opacity: 1,
										x: 0
									},
									transition: { delay: .65 },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] uppercase tracking-widest text-muted-foreground",
										children: "Trusted devices"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm font-medium text-foreground",
										children: "3 active sessions"
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "features",
						className: "mt-28 scroll-mt-28",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
							eyebrow: "Platform",
							title: "Six layers of passwordless defence",
							description: "Every authentication path is first-class, auditable and instant."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
							children: features.map((feature, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureCard, {
								index,
								...feature
							}, feature.title))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "how-it-works",
						className: "mt-28 scroll-mt-28",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
							eyebrow: "How it works",
							title: "Four steps from intent to access"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "relative mt-10 space-y-4 pl-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute left-3 top-4 bottom-4 w-px bg-gradient-to-b from-primary via-secondary to-accent",
								"aria-hidden": true
							}), steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
								initial: {
									opacity: 0,
									x: -18
								},
								whileInView: {
									opacity: 1,
									x: 0
								},
								viewport: {
									once: true,
									margin: "-60px"
								},
								transition: {
									duration: .45,
									delay: index * .1
								},
								className: "glass-panel relative rounded-3xl p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -left-[1.85rem] top-6 inline-flex size-7 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground ring-4 ring-background",
									children: index + 1
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex size-10 items-center justify-center rounded-2xl bg-muted text-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(step.icon, { className: "size-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-base font-semibold text-foreground",
										children: step.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: step.description
									})] })]
								})]
							}, step.title))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "security",
						className: "mt-28 scroll-mt-28",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
								eyebrow: "Security",
								title: "Numbers our team is measured on"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-10 grid gap-5 sm:grid-cols-3",
								children: [
									{
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Counter, {
											to: 99.9,
											decimals: 1,
											suffix: "%"
										}),
										label: "Authentication success"
									},
									{
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Counter, {
											to: 2,
											prefix: "<",
											suffix: " sec"
										}),
										label: "Average login"
									},
									{
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Counter, {
											to: 100,
											suffix: "%"
										}),
										label: "Passwordless"
									}
								].map((stat, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										y: 20
									},
									whileInView: {
										opacity: 1,
										y: 0
									},
									viewport: { once: true },
									transition: {
										duration: .5,
										delay: index * .1
									},
									className: "glass-panel rounded-3xl p-7 text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-4xl font-bold text-gradient",
										children: stat.value
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground",
										children: stat.label
									})]
								}, stat.label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 grid gap-5 lg:grid-cols-[1fr_auto]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityTipsCarousel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "glass-panel flex items-center justify-center rounded-3xl p-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircularProgress, {
										value: 96,
										caption: "Posture"
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						id: "about",
						className: "mt-28 scroll-mt-28",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-panel gradient-border overflow-hidden rounded-[2.5rem] p-8 sm:p-12",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
								eyebrow: "About",
								title: "Built for teams who refuse to ship passwords",
								description: "SecurePass AI is a hackathon-born identity layer: biometrics, federated sign-in and device intelligence behind a single, elegant API. Drop it in front of any product and delete your password reset flow forever."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/register",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "lg",
										children: ["Create free account", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "lg",
										variant: "glass",
										children: "I already have an account"
									})
								})]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-glass-border py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" SecurePass AI. Passwordless by default."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5 text-success" }), " Tokens rotate every 60 minutes"]
					})]
				})
			})
		]
	});
}
function SectionHeading({ eyebrow, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 18
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-60px"
		},
		transition: { duration: .5 },
		className: "max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.2em] text-accent",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 text-2xl font-bold sm:text-3xl",
				children: title
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base",
				children: description
			})
		]
	});
}
//#endregion
export { Route, LandingPage as component };
