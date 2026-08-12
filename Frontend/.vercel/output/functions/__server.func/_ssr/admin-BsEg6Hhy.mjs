import { o as __toESM } from "../_runtime.mjs";
import { n as api } from "./authSession-BkpFMSMQ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as ChevronLeft, T as LockKeyhole, Z as Activity, d as ShieldCheck, h as RefreshCw, i as UserRound, r as Users, z as ChevronRight } from "../_libs/lucide-react.mjs";
import { n as Button } from "./router-COFnCbEf.mjs";
import { t as AppShell } from "./AppShell-BBejEn7w.mjs";
import { t as CardSkeleton } from "./Loader-V5YPL4Np.mjs";
import { t as EmptyState } from "./EmptyState-CY8pxcEZ.mjs";
import { t as Modal } from "./Modal-BruMXIUu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BsEg6Hhy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var unwrap = (response) => response.data?.data ?? response.data;
var adminService = {
	listUsers: ({ page = 0, size = 20 } = {}) => api.get("/api/admin/users", { params: {
		page,
		size
	} }).then(unwrap),
	listLockedUsers: () => api.get("/api/admin/users/locked").then(unwrap),
	unlockUser: (userId) => api.post(`/api/admin/users/${encodeURIComponent(userId)}/unlock`).then(unwrap),
	revokeUserSessions: (userId) => api.post(`/api/admin/users/${encodeURIComponent(userId)}/revoke-sessions`).then(unwrap),
	getLoginMethods: () => api.get("/api/admin/stats/login-methods").then(unwrap),
	getFailedLogins: (hours = 24) => api.get("/api/admin/stats/failed-logins", { params: { hours } }).then(unwrap),
	getNewUsers: () => api.get("/api/admin/stats/new-users").then(unwrap),
	getActiveSessions: (userId) => api.get(`/api/admin/users/${encodeURIComponent(userId)}/sessions`).then(unwrap)
};
var PAGE_SIZE = 20;
var Route = createFileRoute("/_authenticated/admin")({});
function formatDate(value) {
	if (!value) return "Never";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleString();
}
function Metric({ icon: Icon, label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-panel rounded-3xl p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5 text-primary",
					"aria-hidden": "true"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-3xl font-bold tracking-tight text-foreground",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
function statusLabel(user, locked) {
	if (locked) return "Locked";
	if (user.emailVerified === false) return "Unverified";
	return "Active";
}
function AdminPage() {
	const queryClient = useQueryClient();
	const [page, setPage] = (0, import_react.useState)(0);
	const [selectedAction, setSelectedAction] = (0, import_react.useState)(null);
	const [selectedUserId, setSelectedUserId] = (0, import_react.useState)(null);
	const usersQuery = useQuery({
		queryKey: ["admin-users", page],
		queryFn: () => adminService.listUsers({
			page,
			size: PAGE_SIZE
		}),
		staleTime: 3e4,
		retry: false
	});
	const lockedQuery = useQuery({
		queryKey: ["admin-locked-users"],
		queryFn: adminService.listLockedUsers,
		staleTime: 3e4,
		retry: false
	});
	const methodsQuery = useQuery({
		queryKey: ["admin-login-methods"],
		queryFn: adminService.getLoginMethods,
		staleTime: 6e4,
		retry: false
	});
	const failedQuery = useQuery({
		queryKey: ["admin-failed-logins"],
		queryFn: () => adminService.getFailedLogins(24),
		staleTime: 6e4,
		retry: false
	});
	const newUsersQuery = useQuery({
		queryKey: ["admin-new-users"],
		queryFn: adminService.getNewUsers,
		staleTime: 6e4,
		retry: false
	});
	const sessionsQuery = useQuery({
		queryKey: ["admin-user-sessions", selectedUserId],
		queryFn: () => adminService.getActiveSessions(selectedUserId),
		enabled: Boolean(selectedUserId),
		retry: false
	});
	const actionMutation = useMutation({
		mutationFn: ({ action, userId }) => action === "unlock" ? adminService.unlockUser(userId) : adminService.revokeUserSessions(userId),
		retry: false,
		onSuccess: (_, variables) => {
			toast.success(variables.action === "unlock" ? "User unlocked" : "Sessions revoked");
			setSelectedAction(null);
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["admin-locked-users"] });
			queryClient.invalidateQueries({ queryKey: ["admin-user-sessions", variables.userId] });
		},
		onError: () => toast.error("The admin action could not be completed.")
	});
	const pageData = usersQuery.data ?? {};
	const users = Array.isArray(pageData) ? pageData : pageData.content ?? [];
	const totalPages = pageData.totalPages ?? 1;
	const lockedUsers = Array.isArray(lockedQuery.data) ? lockedQuery.data : [];
	const lockedUserIds = new Set(lockedUsers.map((user) => user.userId));
	const loginMethods = methodsQuery.data && typeof methodsQuery.data === "object" ? methodsQuery.data : {};
	const failedLogins = typeof failedQuery.data === "number" ? failedQuery.data : failedQuery.data?.count ?? 0;
	const newUsers = typeof newUsersQuery.data === "number" ? newUsersQuery.data : newUsersQuery.data?.count ?? 0;
	const selectedUser = users.find((user) => user.userId === selectedAction?.userId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Admin panel",
		subtitle: "Restricted authentication operations and audit signals",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								icon: Users,
								label: "New users",
								value: newUsers,
								hint: "Created in the last 24 hours"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								icon: Activity,
								label: "Failed logins",
								value: failedLogins,
								hint: "Observed in the last 24 hours"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								icon: LockKeyhole,
								label: "Locked accounts",
								value: lockedQuery.isLoading ? "..." : lockedUsers.length,
								hint: "Requires review"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								icon: ShieldCheck,
								label: "Passwordless methods",
								value: Object.keys(loginMethods).length,
								hint: "Methods used in the last 24 hours"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass-panel rounded-[2rem] p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-base font-semibold",
									children: "User access"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Review account state without exposing credentials or session tokens."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "glass",
									size: "sm",
									onClick: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), " Refresh"]
								})]
							}),
							usersQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 grid gap-4 md:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {})]
							}) : usersQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive",
								children: "User data is temporarily unavailable."
							}) : users.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
									icon: UserRound,
									title: "No users found",
									description: "There are no accounts on this page."
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full min-w-[760px] text-left text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "border-b border-border text-xs uppercase tracking-widest text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "pb-3 pr-4 font-medium",
												children: "User"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "pb-3 pr-4 font-medium",
												children: "Role"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "pb-3 pr-4 font-medium",
												children: "Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "pb-3 pr-4 font-medium",
												children: "Last login"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "pb-3 text-right font-medium",
												children: "Actions"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y divide-border",
										children: users.map((user) => {
											const locked = lockedUserIds.has(user.userId);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "py-4 pr-4",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-medium text-foreground",
														children: user.firstName || user.lastName ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "Unnamed user"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-muted-foreground",
														children: user.email
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-4 pr-4",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold",
														children: user.role ?? "USER"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-4 pr-4",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: locked ? "text-destructive" : "text-success",
														children: statusLabel(user, locked)
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-4 pr-4 text-muted-foreground",
													children: formatDate(user.lastLoginAt)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-4 text-right",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-end gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																variant: "ghost",
																size: "sm",
																onClick: () => setSelectedUserId(user.userId),
																children: "Sessions"
															}),
															locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																variant: "success",
																size: "sm",
																onClick: () => setSelectedAction({
																	action: "unlock",
																	userId: user.userId
																}),
																children: "Unlock"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																variant: "danger",
																size: "sm",
																onClick: () => setSelectedAction({
																	action: "revoke",
																	userId: user.userId
																}),
																children: "Revoke"
															})
														]
													})
												})
											] }, user.userId);
										})
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Page ",
									page + 1,
									" of ",
									Math.max(totalPages, 1)
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "glass",
										size: "sm",
										disabled: page === 0,
										onClick: () => setPage((value) => value - 1),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), " Previous"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "glass",
										size: "sm",
										disabled: page + 1 >= totalPages,
										onClick: () => setPage((value) => value + 1),
										children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass-panel rounded-[2rem] p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-semibold",
								children: "Locked accounts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Unlock only after reviewing the account context through your operational process."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 space-y-2",
								children: lockedUsers.length ? lockedUsers.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/60 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: user.email
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["Created ", formatDate(user.createdAt)]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "success",
										size: "sm",
										onClick: () => setSelectedAction({
											action: "unlock",
											userId: user.userId
										}),
										children: "Unlock"
									})]
								}, user.userId)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground",
									children: "No locked accounts require review."
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(selectedAction),
				onClose: () => setSelectedAction(null),
				title: selectedAction?.action === "unlock" ? "Unlock this account?" : "Revoke this user's sessions?",
				description: selectedAction?.action === "unlock" ? `Restore sign-in access for ${selectedUser?.email ?? "this user"}.` : `All active sessions for ${selectedUser?.email ?? "this user"} will be invalidated.`,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "glass",
					onClick: () => setSelectedAction(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: selectedAction?.action === "unlock" ? "success" : "danger",
					loading: actionMutation.isPending,
					onClick: () => actionMutation.mutate(selectedAction),
					children: "Confirm"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "This action is enforced by the Auth service and cannot grant administrator privileges."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(selectedUserId),
				onClose: () => setSelectedUserId(null),
				title: "Active sessions",
				description: "Only the current count is shown; session credentials are never displayed.",
				children: sessionsQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-4xl font-bold text-foreground",
					children: [sessionsQuery.isError ? "Unavailable" : sessionsQuery.data ?? 0, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-sm font-normal text-muted-foreground",
						children: "active sessions"
					})]
				})
			})
		]
	});
}
//#endregion
export { Route, AdminPage as component };
