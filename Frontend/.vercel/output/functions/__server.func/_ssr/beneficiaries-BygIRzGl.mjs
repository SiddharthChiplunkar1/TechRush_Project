import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as ContactRound, _ as Pencil, a as UserPlus, c as Star, h as RefreshCw, o as Trash2 } from "../_libs/lucide-react.mjs";
import { n as Button } from "./router-COFnCbEf.mjs";
import { t as AppShell } from "./AppShell-BBejEn7w.mjs";
import { t as EmptyState } from "./EmptyState-CY8pxcEZ.mjs";
import { t as Input } from "./Input-DD5okQ9K.mjs";
import { t as bankingService } from "./bankingService-DaWVvy8s.mjs";
import { r as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as objectType, r as stringType, t as booleanType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/beneficiaries-BygIRzGl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var beneficiarySchema = objectType({
	name: stringType().trim().min(1, "Beneficiary name is required").max(100, "Name must not exceed 100 characters"),
	accountIdentifier: stringType().trim().min(1, "Account identifier is required").max(255, "Account identifier must not exceed 255 characters"),
	favourite: booleanType()
});
var Route = createFileRoute("/_authenticated/beneficiaries")({});
function apiMessage(error, fallback) {
	return error?.message ?? fallback;
}
function BeneficiariesPage() {
	const queryClient = useQueryClient();
	const beneficiariesQuery = useQuery({
		queryKey: ["beneficiaries"],
		queryFn: bankingService.getBeneficiaries
	});
	const form = useForm({
		resolver: u(beneficiarySchema),
		defaultValues: {
			name: "",
			accountIdentifier: "",
			favourite: false
		}
	});
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const saveMutation = useMutation({
		mutationFn: ({ id, payload }) => id ? bankingService.updateBeneficiary(id, payload) : bankingService.addBeneficiary(payload),
		onSuccess: () => {
			form.reset();
			setEditingId(null);
			queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
			toast.success(editingId ? "Beneficiary updated" : "Beneficiary added");
		},
		onError: (error) => toast.error(apiMessage(error, "Beneficiary could not be saved"))
	});
	const deleteMutation = useMutation({
		mutationFn: bankingService.deleteBeneficiary,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
			toast.success("Beneficiary removed");
		},
		onError: (error) => toast.error(apiMessage(error, "Beneficiary could not be removed"))
	});
	const favoriteMutation = useMutation({
		mutationFn: ({ id, favourite }) => bankingService.setBeneficiaryFavorite(id, favourite),
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["beneficiaries"] }),
		onError: (error) => toast.error(apiMessage(error, "Favorite status could not be updated"))
	});
	const beneficiaries = beneficiariesQuery.data ?? [];
	const onSubmit = form.handleSubmit((values) => {
		saveMutation.mutate({
			id: editingId,
			payload: {
				name: values.name.trim(),
				accountIdentifier: values.accountIdentifier.trim(),
				favourite: values.favourite
			}
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Beneficiaries",
		subtitle: "Manage safe transfer destinations",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 xl:grid-cols-[0.8fr_1.2fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass-panel rounded-[2rem] p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-6" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-bold",
						children: editingId ? "Edit beneficiary" : "Add beneficiary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Save a recipient for future transfers."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-6 space-y-4",
					onSubmit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Name",
							placeholder: "e.g. Alex Morgan",
							...form.register("name"),
							error: form.formState.errors.name?.message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Account identifier",
							placeholder: "Recipient account ID or email",
							hint: "Use the identifier provided by the recipient.",
							...form.register("accountIdentifier"),
							error: form.formState.errors.accountIdentifier?.message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-3 rounded-2xl bg-muted/60 p-4 text-sm text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "size-4 accent-primary",
								...form.register("favourite")
							}), "Mark as favorite"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							fullWidth: true,
							loading: saveMutation.isPending,
							children: editingId ? "Save beneficiary" : "Add beneficiary"
						}),
						editingId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "glass",
							fullWidth: true,
							onClick: () => {
								setEditingId(null);
								form.reset();
							},
							children: "Cancel edit"
						}) : null
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-bold",
							children: "Saved beneficiaries"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Only destinations owned by your account are shown."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "glass",
							onClick: () => void beneficiariesQuery.refetch(),
							loading: beneficiariesQuery.isFetching,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Refresh"]
						})]
					}),
					beneficiariesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "glass-panel rounded-[2rem] p-6",
						children: "Loading beneficiaries..."
					}) : beneficiaries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: ContactRound,
						title: "No beneficiaries yet",
						description: "Add a trusted transfer destination to use it from the transfer flow."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3",
						children: beneficiaries.map((beneficiary) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "glass-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactRound, { className: "size-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-semibold text-foreground",
										children: beneficiary.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm text-muted-foreground",
										children: beneficiary.accountIdentifier
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										"aria-label": `Edit ${beneficiary.name}`,
										onClick: () => {
											setEditingId(beneficiary.id);
											form.reset({
												name: beneficiary.name,
												accountIdentifier: beneficiary.accountIdentifier,
												favourite: beneficiary.favourite
											});
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										"aria-label": beneficiary.favourite ? `Unfavorite ${beneficiary.name}` : `Favorite ${beneficiary.name}`,
										loading: favoriteMutation.isPending && favoriteMutation.variables?.id === beneficiary.id,
										onClick: () => favoriteMutation.mutate({
											id: beneficiary.id,
											favourite: !beneficiary.favourite
										}),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: beneficiary.favourite ? "size-4 fill-current text-amber-500" : "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										"aria-label": `Remove ${beneficiary.name}`,
										loading: deleteMutation.isPending && deleteMutation.variables === beneficiary.id,
										onClick: () => {
											if (window.confirm(`Remove ${beneficiary.name} from your beneficiaries?`)) deleteMutation.mutate(beneficiary.id);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
									})
								]
							})]
						}, beneficiary.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/transfer",
						className: "inline-flex text-sm font-medium text-primary hover:underline",
						children: "Continue to transfer"
					})
				]
			})]
		})
	});
}
//#endregion
export { Route, BeneficiariesPage as component };
