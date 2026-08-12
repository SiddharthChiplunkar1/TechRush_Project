import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-_lkLOWLq.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as LoaderCircle, G as CalendarClock, H as Check, I as Clock3, L as CircleCheck, R as ChevronUp, V as ChevronDown, Y as ArrowRightLeft, d as ShieldCheck, f as ShieldAlert, g as ReceiptText, i as UserRound, k as Landmark, q as BadgeCheck } from "../_libs/lucide-react.mjs";
import { n as Button } from "./router-COFnCbEf.mjs";
import { t as AppShell } from "./AppShell-BBejEn7w.mjs";
import { t as EmptyState } from "./EmptyState-CY8pxcEZ.mjs";
import { t as Modal } from "./Modal-BruMXIUu.mjs";
import { t as Input } from "./Input-DD5okQ9K.mjs";
import { t as bankingService } from "./bankingService-DaWVvy8s.mjs";
import { n as Controller, r as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as objectType, r as stringType } from "../_libs/zod.mjs";
import { t as OtpInput } from "./OtpInput-C11DP6A2.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transfer-r-30HAYA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var amountPattern = /^\d+(?:\.\d{1,2})?$/;
var transferSchema = objectType({
	recipient: stringType().min(1, "Recipient is required"),
	amount: stringType().trim().min(1, "Amount is required").refine((value) => amountPattern.test(value) && Number.isFinite(Number(value)) && Number(value) > 0, "Enter a valid amount with up to 2 decimal places"),
	description: stringType().trim().max(255, "Description must not exceed 255 characters")
});
var wizardSteps = [
	"Recipient",
	"Amount",
	"Review",
	"Verification",
	"Complete"
];
function formatMoney(value) {
	const amount = Number(value ?? 0);
	if (!Number.isFinite(amount)) return "$0.00";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(amount);
}
function formatDateTime(value) {
	return new Date(value).toLocaleString();
}
function formatRecipient(beneficiary) {
	if (!beneficiary) return "Unknown recipient";
	return `${beneficiary.name} - ${beneficiary.accountIdentifier}`;
}
function cleanDescription(value) {
	const trimmed = value?.trim() ?? "";
	return trimmed.length > 0 ? trimmed : void 0;
}
function mapTransferError(error, operation) {
	const status = error?.status;
	if (status === 401) return "Your session expired. Please sign in again.";
	if (operation === "verify") {
		if (status === 403) return "Step-up verification failed or expired.";
		if (status === 404) return "The verification challenge could not be found.";
		if (status === 429) return "Too many verification attempts. Please wait and try again.";
		if (status === 500) return "The verification service is unavailable right now.";
		return "Step-up verification could not be completed.";
	}
	if (operation === "confirm") {
		if (status === 403) return "The transfer was blocked by security controls.";
		if (status === 404) return "The transfer could not be found.";
		if (status === 409) return "This transfer has already been processed.";
		if (status === 422) return "The transfer could not be completed because of insufficient funds.";
		if (status === 429) return "Too many confirmation attempts. Please wait and try again.";
		if (status === 500) return "The transfer service is unavailable right now.";
		return "The transfer could not be confirmed.";
	}
	if (status === 400) return "Please check the recipient, amount and description.";
	if (status === 404) return "The selected recipient could not be found.";
	if (status === 409) return "This transfer has already been processed.";
	if (status === 422) return "You do not have enough available balance for this transfer.";
	if (status === 429) return "Too many transfer attempts. Please wait and try again.";
	if (status === 500) return "The banking service is unavailable right now.";
	return "The transfer could not be started.";
}
var Route = createFileRoute("/_authenticated/transfer")({});
function StepItem({ label, index, active }) {
	const completed = index < active;
	const current = index === active;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-1 items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors", completed && "border-success bg-success text-success-foreground", current && !completed && "border-primary bg-primary text-primary-foreground", !completed && !current && "border-border bg-card text-muted-foreground"),
			children: completed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }) : index + 1
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("text-xs font-medium", current || completed ? "text-foreground" : "text-muted-foreground"),
				children: label
			})
		})]
	});
}
function WizardProgress({ step }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-3xl border border-glass-border bg-card/70 p-4 backdrop-blur",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-5",
			children: wizardSteps.map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepItem, {
				label,
				index,
				active: step
			}, label))
		})
	});
}
function InfoRow({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-muted/60 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 break-words text-sm font-medium text-foreground",
			children: value
		})]
	});
}
function TransferPage() {
	const queryClient = useQueryClient();
	const [selectedRecipient, setSelectedRecipient] = (0, import_react.useState)("");
	const [pendingTransfer, setPendingTransfer] = (0, import_react.useState)(null);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const [errorState, setErrorState] = (0, import_react.useState)(null);
	const [receiptOpen, setReceiptOpen] = (0, import_react.useState)(false);
	const [stepUpExpiresAt, setStepUpExpiresAt] = (0, import_react.useState)(null);
	const [stepUpSecondsRemaining, setStepUpSecondsRemaining] = (0, import_react.useState)(null);
	const [stepUpState, setStepUpState] = (0, import_react.useState)("idle");
	const [stepUpOtp, setStepUpOtp] = (0, import_react.useState)("");
	const [preTransferOtpOpen, setPreTransferOtpOpen] = (0, import_react.useState)(false);
	const [preTransferOtp, setPreTransferOtp] = (0, import_react.useState)("");
	const [pendingTransferValues, setPendingTransferValues] = (0, import_react.useState)(null);
	const beneficiariesQuery = useQuery({
		queryKey: ["beneficiaries"],
		queryFn: bankingService.getBeneficiaries
	});
	const balanceQuery = useQuery({
		queryKey: ["balance"],
		queryFn: bankingService.getBalance
	});
	const beneficiaries = beneficiariesQuery.data ?? [];
	const availableBalance = Number(balanceQuery.data?.balance);
	const recipientOptions = (0, import_react.useMemo)(() => beneficiaries.map((beneficiary) => ({
		label: formatRecipient(beneficiary),
		value: beneficiary.accountIdentifier
	})), [beneficiaries]);
	const selectedBeneficiary = (0, import_react.useMemo)(() => beneficiaries.find((beneficiary) => beneficiary.accountIdentifier === selectedRecipient) ?? null, [beneficiaries, selectedRecipient]);
	const form = useForm({
		resolver: u(transferSchema),
		defaultValues: {
			recipient: "",
			amount: "",
			description: ""
		},
		mode: "onBlur"
	});
	const requestTransferOtpMutation = useMutation({
		mutationFn: bankingService.requestTransferOtp,
		retry: false,
		onSuccess: () => {
			setErrorState(null);
			setPreTransferOtpOpen(true);
			toast.success("Transfer OTP sent to your registered email");
		},
		onError: (error) => {
			if (error?.status === 429) {
				setErrorState(null);
				setPreTransferOtpOpen(true);
				toast.info("A transfer OTP was already sent. Enter the latest code.");
				return;
			}
			setPendingTransferValues(null);
			setErrorState(mapTransferError(error, "initiate"));
			toast.error(error?.status === 500 ? "The transfer OTP service is unavailable right now" : "Could not send the transfer OTP");
		}
	});
	const initiateTransferMutation = useMutation({
		mutationFn: bankingService.initiateTransfer,
		retry: false,
		onMutate: () => {
			setErrorState(null);
			setReceipt(null);
		},
		onSuccess: (result, variables) => {
			if (variables.otp) {
				setPreTransferOtpOpen(false);
				setPendingTransferValues(null);
				setPreTransferOtp("");
			}
			const recipient = beneficiaries.find((beneficiary) => beneficiary.accountIdentifier === variables.toUserId) ?? null;
			const basePayload = {
				transferId: result.transferId,
				recipientName: recipient?.name ?? "Selected recipient",
				recipientAccountIdentifier: variables.toUserId,
				amount: variables.amount,
				description: cleanDescription(variables.description) ?? "",
				initiatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			if (result.stepUpRequired && result.stepUpChallengeId) {
				setPendingTransfer({
					...basePayload,
					stepUpChallengeId: result.stepUpChallengeId,
					requiredAuthStrength: result.requiredAuthStrength,
					status: result.status
				});
				setStepUpState("required");
				setStepUpOtp("");
				setStepUpExpiresAt(null);
				setStepUpSecondsRemaining(600);
				return;
			}
			setPendingTransfer(basePayload);
			setStepUpState("confirming");
			confirmTransferMutation.mutate({
				transferId: result.transferId,
				confirm: true,
				basePayload
			});
		},
		onError: (error, variables) => {
			setErrorState(mapTransferError(error, "initiate"));
			if (variables?.otp) {
				setPreTransferOtpOpen(true);
				if (error?.status === 404) toast.error("The selected beneficiary could not be found. Check the registered email.");
				else if (error?.status === 400) toast.error("The transfer OTP was invalid or expired");
				else toast.error("The transfer could not be authorized");
			} else toast.error("Transfer could not be started");
		}
	});
	const confirmTransferMutation = useMutation({
		mutationFn: ({ transferId, confirm }) => bankingService.confirmTransfer({
			transferId,
			confirm
		}),
		retry: false,
		onSuccess: (result, variables) => {
			if (variables.confirm === false) {
				setStepUpState("cancelled");
				setErrorState(null);
				toast.info("Transfer cancelled");
				return;
			}
			const basePayload = variables.basePayload ?? pendingTransfer;
			const completed = {
				transferId: result.transferId,
				status: result.status,
				recipientName: basePayload?.recipientName ?? "Selected recipient",
				recipientAccountIdentifier: basePayload?.recipientAccountIdentifier ?? "",
				amount: basePayload?.amount ?? "0",
				description: basePayload?.description ?? "",
				completedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			setReceipt(completed);
			setStepUpState("complete");
			setPendingTransfer(null);
			setErrorState(null);
			toast.success("Transfer completed");
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
		},
		onError: (error) => {
			setStepUpState("failed");
			setErrorState(mapTransferError(error, "confirm"));
			toast.error("Transfer confirmation failed");
		}
	});
	const verifyStepUpMutation = useMutation({
		mutationFn: ({ challengeId, otp }) => bankingService.verifyStepUpChallenge(challengeId, otp),
		retry: false,
		onMutate: () => {
			setStepUpState("verifying");
			setErrorState(null);
		},
		onSuccess: (challenge) => {
			setStepUpState("verified");
			setStepUpExpiresAt(challenge.expiresAt ?? null);
			if (challenge.expiresAt) {
				const expiresAt = new Date(challenge.expiresAt).getTime();
				setStepUpSecondsRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1e3)));
			}
			confirmTransferMutation.mutate({
				transferId: pendingTransfer.transferId,
				confirm: true,
				basePayload: pendingTransfer
			});
		},
		onError: (error) => {
			setStepUpState("failed");
			setErrorState(mapTransferError(error, "verify"));
			toast.error("Step-up verification failed");
		}
	});
	(0, import_react.useEffect)(() => {
		if (!stepUpSecondsRemaining || stepUpSecondsRemaining <= 0) return;
		const timer = window.setInterval(() => {
			setStepUpSecondsRemaining((value) => {
				if (value == null) return value;
				if (value <= 1) {
					window.clearInterval(timer);
					if (stepUpState === "required" || stepUpState === "verifying" || stepUpState === "verified") {
						setStepUpState("expired");
						setErrorState("The verification window expired. Start a new transfer to continue.");
					}
					return 0;
				}
				return value - 1;
			});
		}, 1e3);
		return () => window.clearInterval(timer);
	}, [stepUpSecondsRemaining, stepUpState]);
	const activeStep = receipt ? 4 : pendingTransfer ? stepUpState === "required" || stepUpState === "verifying" || stepUpState === "verified" ? 3 : 2 : form.formState.isValid && selectedBeneficiary ? 2 : selectedBeneficiary ? 1 : 0;
	const isBusy = initiateTransferMutation.isPending || requestTransferOtpMutation.isPending || confirmTransferMutation.isPending || verifyStepUpMutation.isPending;
	const onSubmit = form.handleSubmit((values) => {
		const recipient = beneficiaries.find((beneficiary) => beneficiary.accountIdentifier === values.recipient);
		if (!recipient) {
			form.setError("recipient", {
				type: "validate",
				message: "Recipient is required"
			});
			return;
		}
		if (Number.isFinite(availableBalance) && Number(values.amount) > availableBalance) {
			form.setError("amount", {
				type: "validate",
				message: "Amount exceeds your available balance"
			});
			return;
		}
		const payload = {
			toUserId: recipient.accountIdentifier,
			amount: values.amount.trim(),
			description: cleanDescription(values.description)
		};
		if (Number(values.amount) > 500) {
			setPendingTransferValues(payload);
			setPreTransferOtp("");
			requestTransferOtpMutation.mutate();
		} else initiateTransferMutation.mutate(payload);
		setSelectedRecipient(values.recipient);
	});
	const submitPreTransferOtp = () => {
		if (!pendingTransferValues || preTransferOtp.length !== 6) return;
		initiateTransferMutation.mutate({
			...pendingTransferValues,
			otp: preTransferOtp
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: receipt ? "Transfer successful" : pendingTransfer && stepUpState === "required" ? "Additional verification required" : "Transfer funds",
		subtitle: receipt ? "Your transfer has been completed successfully." : pendingTransfer && stepUpState === "required" ? "Complete the server-recorded step-up challenge to release the transfer." : "Send money to a real beneficiary from your authenticated account.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WizardProgress, { step: activeStep }), receipt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 xl:grid-cols-[1.2fr_0.8fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass-panel gradient-border rounded-[2rem] p-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-7" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-2xl font-bold",
									children: "Transfer successful"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "The transfer was completed and recorded by the banking service."
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 grid gap-3 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
										icon: UserRound,
										label: "Recipient",
										value: receipt.recipientName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
										icon: Landmark,
										label: "Amount",
										value: formatMoney(receipt.amount)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
										icon: ReceiptText,
										label: "Transaction reference",
										value: receipt.transferId
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
										icon: CalendarClock,
										label: "Completed at",
										value: formatDateTime(receipt.completedAt)
									})
								]
							}),
							receipt.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-2xl bg-muted/60 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-foreground",
									children: receipt.description
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 flex flex-wrap gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "glass",
										onClick: () => setReceiptOpen(true),
										children: "View receipt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/transactions",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "glass",
											children: "View transaction"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/dashboard",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Back to dashboard" })
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass-panel rounded-[2rem] p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: "Safe summary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl bg-muted/60 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Recipient"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm font-medium text-foreground",
										children: receipt.recipientName
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl bg-muted/60 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm font-medium text-foreground",
										children: receipt.status
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl bg-muted/60 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Reference"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 break-all font-mono text-sm text-foreground",
										children: receipt.transferId
									})]
								})
							]
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 xl:grid-cols-[1.2fr_0.8fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass-panel rounded-[2rem] p-7",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "size-6" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl font-bold",
								children: "Bank transfer"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Choose a real beneficiary, review the details, then complete any required step-up verification."
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-7 space-y-5",
							onSubmit,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, {
									control: form.control,
									name: "recipient",
									render: ({ field, fieldState }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "block text-sm font-medium text-foreground",
												children: "Recipient"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: field.value,
												onValueChange: (value) => {
													field.onChange(value);
													setSelectedRecipient(value);
												},
												disabled: beneficiariesQuery.isLoading || recipientOptions.length === 0,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: cn("h-12 rounded-2xl border border-border bg-card/70 px-4 text-sm text-foreground", fieldState.error && "border-destructive/70"),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: beneficiariesQuery.isLoading ? "Loading beneficiaries..." : "Select a beneficiary" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: recipientOptions.map((recipient) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: recipient.value,
													children: recipient.label
												}, recipient.value)) })]
											}),
											fieldState.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium text-destructive",
												children: fieldState.error.message
											}) : null
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-5 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										label: "Amount",
										inputMode: "decimal",
										placeholder: "0.00",
										error: form.formState.errors.amount?.message,
										...form.register("amount")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										label: "Recipient account",
										value: selectedBeneficiary?.accountIdentifier ?? "",
										readOnly: true,
										placeholder: "Select a recipient",
										hint: "The backend uses the beneficiary destination identifier."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "-mt-3 text-xs text-muted-foreground",
									children: [
										"Available balance:",
										" ",
										balanceQuery.isLoading ? "Loading..." : balanceQuery.isError ? "Unavailable" : formatMoney(availableBalance)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 4,
									placeholder: "Optional note for this transfer",
									className: "rounded-2xl border-border bg-card/70 px-4 py-3 text-sm",
									...form.register("description")
								}),
								form.formState.errors.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium text-destructive",
									children: form.formState.errors.description.message
								}) : null,
								errorState ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive",
									children: errorState
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										loading: isBusy,
										disabled: recipientOptions.length === 0 || isBusy,
										children: "Review and submit"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/dashboard",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "glass",
											type: "button",
											children: "Cancel"
										})
									})]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "glass-panel rounded-[2rem] p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-base font-semibold",
										children: "Review"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: "This summary is based on your current form inputs. The backend remains authoritative."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
												icon: UserRound,
												label: "Recipient",
												value: selectedBeneficiary ? selectedBeneficiary.name : "Choose a beneficiary"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
												icon: Landmark,
												label: "Amount",
												value: form.watch("amount") ? formatMoney(form.watch("amount")) : "$0.00"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
												icon: ReceiptText,
												label: "Description",
												value: form.watch("description")?.trim() || "No description"
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "glass-panel rounded-[2rem] p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-base font-semibold",
									children: "Security"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 space-y-3 text-sm text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-success" }), "Access token stays memory-only."]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4 text-warning" }), "Financial POST requests do not auto-retry."]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4 text-accent" }), "Step-up verification is recorded by the server."]
										})
									]
								})]
							}),
							beneficiariesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "glass-panel rounded-[2rem] p-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-32 animate-pulse rounded-full bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-2xl bg-muted" })]
								})
							}) : !recipientOptions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								icon: ArrowRightLeft,
								title: "No beneficiaries yet",
								description: "Add a beneficiary before initiating a transfer.",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap justify-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/beneficiaries",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Add beneficiary" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/dashboard",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "glass",
											children: "Back to dashboard"
										})
									})]
								})
							}) : null
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(pendingTransfer?.stepUpChallengeId && stepUpState !== "idle" && stepUpState !== "complete" && stepUpState !== "cancelled" && !receipt),
				onClose: () => {
					if (stepUpState === "verifying" || confirmTransferMutation.isPending) return;
					setPendingTransfer(null);
					setStepUpState("idle");
				},
				title: "Additional verification required",
				description: "This transfer requires server-recorded step-up authentication before it can be completed.",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "glass",
					disabled: verifyStepUpMutation.isPending || confirmTransferMutation.isPending || stepUpOtp.length !== 6,
					onClick: () => {
						if (!pendingTransfer?.stepUpChallengeId) return;
						verifyStepUpMutation.mutate({
							challengeId: pendingTransfer.stepUpChallengeId,
							otp: stepUpOtp
						});
					},
					children: [verifyStepUpMutation.isPending || confirmTransferMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-4" }), "Verify step-up"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "danger",
					disabled: verifyStepUpMutation.isPending || confirmTransferMutation.isPending,
					onClick: () => {
						if (!pendingTransfer?.transferId) return;
						confirmTransferMutation.mutate({
							transferId: pendingTransfer.transferId,
							confirm: false,
							basePayload: pendingTransfer
						});
					},
					children: "Cancel transfer"
				})] }),
				children: pendingTransfer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-primary/15 bg-primary/5 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-foreground",
									children: "Verification required"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "The banking service requires additional verification before the transfer can be released."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm font-medium text-foreground",
									children: "An OTP was sent to your registered email. Enter it to authorize this transfer."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtpInput, {
							value: stepUpOtp,
							onChange: setStepUpOtp,
							disabled: isBusy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
									icon: UserRound,
									label: "Recipient",
									value: pendingTransfer.recipientName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
									icon: Landmark,
									label: "Amount",
									value: formatMoney(pendingTransfer.amount)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
									icon: ReceiptText,
									label: "Transfer reference",
									value: pendingTransfer.transferId
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
									icon: BadgeCheck,
									label: "Required strength",
									value: String(pendingTransfer.requiredAuthStrength ?? "STRONG")
								})
							]
						}),
						stepUpState === "verifying" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground",
							children: "Verifying with the banking service..."
						}) : null,
						stepUpState === "verified" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border border-success/20 bg-success/10 p-4 text-sm text-success",
							children: "Verification succeeded. The transfer is being completed now."
						}) : null,
						stepUpState === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive",
							children: errorState ?? "Step-up verification failed."
						}) : null,
						stepUpState === "expired" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning-foreground",
							children: errorState ?? "The verification window expired."
						}) : null,
						stepUpExpiresAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground",
							children: ["Verification expires at ", formatDateTime(stepUpExpiresAt)]
						}) : null,
						typeof stepUpSecondsRemaining === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground",
							children: [
								"Approximate time remaining: ",
								Math.floor(stepUpSecondsRemaining / 60),
								":",
								String(stepUpSecondsRemaining % 60).padStart(2, "0")
							]
						}) : null
					]
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: preTransferOtpOpen,
				onClose: () => {
					if (isBusy) return;
					setPreTransferOtpOpen(false);
					setPendingTransferValues(null);
					setPreTransferOtp("");
				},
				title: "Verify transfer",
				description: "Transfers above $500 require a one-time verification code before submission.",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "glass",
					disabled: isBusy || preTransferOtp.length !== 6,
					onClick: submitPreTransferOtp,
					children: [initiateTransferMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-4" }), "Authorize transfer"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "danger",
					disabled: isBusy,
					onClick: () => {
						setPreTransferOtpOpen(false);
						setPendingTransferValues(null);
						setPreTransferOtp("");
					},
					children: "Cancel"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-primary/15 bg-primary/5 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-foreground",
								children: "OTP verification required"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "We sent a one-time code to your registered email. The transfer is not submitted until the code is verified by the server."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtpInput, {
							value: preTransferOtp,
							onChange: setPreTransferOtp,
							disabled: isBusy
						}),
						pendingTransferValues ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							icon: Landmark,
							label: "Amount",
							value: formatMoney(pendingTransferValues.amount)
						}) : null,
						errorState && preTransferOtpOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive",
							children: errorState
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: receiptOpen,
				onClose: () => setReceiptOpen(false),
				title: "Receipt",
				description: "Safe receipt details for your completed transfer.",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setReceiptOpen(false),
					children: "Close"
				}),
				children: receipt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							icon: UserRound,
							label: "Recipient",
							value: receipt.recipientName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							icon: Landmark,
							label: "Amount",
							value: formatMoney(receipt.amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							icon: ReceiptText,
							label: "Transaction reference",
							value: receipt.transferId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							icon: CalendarClock,
							label: "Completed at",
							value: formatDateTime(receipt.completedAt)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							icon: BadgeCheck,
							label: "Status",
							value: receipt.status
						}),
						receipt.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-muted/60 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-foreground",
								children: receipt.description
							})]
						}) : null
					]
				}) : null
			})
		]
	});
}
//#endregion
export { Route, TransferPage as component };
