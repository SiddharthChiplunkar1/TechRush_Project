import { g as createFileRoute, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { X as ArrowLeft, d as ShieldCheck, g as ReceiptText, h as RefreshCw, i as UserRound, k as Landmark } from "../_libs/lucide-react.mjs";
import { n as Button } from "./router-COFnCbEf.mjs";
import { t as AppShell } from "./AppShell-BBejEn7w.mjs";
import { t as EmptyState } from "./EmptyState-CY8pxcEZ.mjs";
import { t as bankingService } from "./bankingService-DaWVvy8s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transactions-VetfZMli.js
var import_jsx_runtime = require_jsx_runtime();
var Route = createFileRoute("/_authenticated/transactions")({});
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
function TransactionsPage() {
	const transactionsQuery = useQuery({
		queryKey: ["transactions"],
		queryFn: () => bankingService.getTransactions({
			page: 0,
			size: 20
		})
	});
	const transactions = transactionsQuery.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Transactions",
		subtitle: "Recent transfer activity",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/transfer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back to transfer"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "glass",
						onClick: () => void transactionsQuery.refetch(),
						loading: transactionsQuery.isFetching,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Refresh"]
					})]
				}),
				transactionsQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "glass-panel rounded-[2rem] p-6",
					children: "Loading transactions..."
				}) : transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: ReceiptText,
					title: "No transactions yet",
					description: "Transfers you complete will appear here.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/transfer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Start a transfer" })
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4",
					children: transactions.map((transaction) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "glass-panel rounded-[2rem] p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm font-semibold text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptText, { className: "size-4 text-primary" }), transaction.transactionId]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: transaction.status
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xl font-bold text-foreground",
									children: formatMoney(transaction.amount)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: formatDateTime(transaction.createdAt)
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-muted/60 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-3.5" }), "Description"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-foreground",
									children: transaction.description || "No description"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-muted/60 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-3.5" }), "Amount"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-foreground",
									children: formatMoney(transaction.amount)
								})]
							})]
						})]
					}, transaction.transactionId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-panel rounded-[2rem] p-6 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-success" }), "Transaction history is read from the authenticated banking API."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2",
						children: "Only the public transaction reference, amount, status and creation time are shown here."
					})]
				})
			]
		})
	});
}
//#endregion
export { Route, TransactionsPage as component };
