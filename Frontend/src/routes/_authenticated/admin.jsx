import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui-kit/Button";
import { CardSkeleton } from "@/components/ui-kit/Loader";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { Modal } from "@/components/ui-kit/Modal";
import { adminService } from "@/services/adminService";

const PAGE_SIZE = 20;

const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    if (context.session?.user?.role !== "ADMIN") {
      throw redirect({ to: "/unauthorized" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin panel - SecurePass AI" },
      { name: "description", content: "Restricted authentication administration controls." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function formatDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleString();
}

function Metric({ icon: Icon, label, value, hint }) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <Icon className="size-5 text-primary" aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function statusLabel(user, locked) {
  if (locked) return "Locked";
  if (user.emailVerified === false) return "Unverified";
  return "Active";
}

function AdminPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => adminService.listUsers({ page, size: PAGE_SIZE }),
    staleTime: 30_000,
    retry: false,
  });
  const lockedQuery = useQuery({ queryKey: ["admin-locked-users"], queryFn: adminService.listLockedUsers, staleTime: 30_000, retry: false });
  const methodsQuery = useQuery({ queryKey: ["admin-login-methods"], queryFn: adminService.getLoginMethods, staleTime: 60_000, retry: false });
  const failedQuery = useQuery({ queryKey: ["admin-failed-logins"], queryFn: () => adminService.getFailedLogins(24), staleTime: 60_000, retry: false });
  const newUsersQuery = useQuery({ queryKey: ["admin-new-users"], queryFn: adminService.getNewUsers, staleTime: 60_000, retry: false });
  const sessionsQuery = useQuery({
    queryKey: ["admin-user-sessions", selectedUserId],
    queryFn: () => adminService.getActiveSessions(selectedUserId),
    enabled: Boolean(selectedUserId),
    retry: false,
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
    onError: () => toast.error("The admin action could not be completed."),
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

  return (
    <AppShell title="Admin panel" subtitle="Restricted authentication operations and audit signals">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Users} label="New users" value={newUsers} hint="Created in the last 24 hours" />
          <Metric icon={Activity} label="Failed logins" value={failedLogins} hint="Observed in the last 24 hours" />
          <Metric icon={LockKeyhole} label="Locked accounts" value={lockedQuery.isLoading ? "..." : lockedUsers.length} hint="Requires review" />
          <Metric icon={ShieldCheck} label="Passwordless methods" value={Object.keys(loginMethods).length} hint="Methods used in the last 24 hours" />
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">User access</h2>
              <p className="mt-1 text-sm text-muted-foreground">Review account state without exposing credentials or session tokens.</p>
            </div>
            <Button variant="glass" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}>
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </div>

          {usersQuery.isLoading ? <div className="mt-6 grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div> : usersQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">User data is temporarily unavailable.</div>
          ) : users.length === 0 ? <div className="mt-6"><EmptyState icon={UserRound} title="No users found" description="There are no accounts on this page." /></div> : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                  <tr><th className="pb-3 pr-4 font-medium">User</th><th className="pb-3 pr-4 font-medium">Role</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 pr-4 font-medium">Last login</th><th className="pb-3 text-right font-medium">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => { const locked = lockedUserIds.has(user.userId); return <tr key={user.userId}>
                    <td className="py-4 pr-4"><p className="font-medium text-foreground">{user.firstName || user.lastName ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "Unnamed user"}</p><p className="text-xs text-muted-foreground">{user.email}</p></td>
                    <td className="py-4 pr-4"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{user.role ?? "USER"}</span></td>
                    <td className="py-4 pr-4"><span className={locked ? "text-destructive" : "text-success"}>{statusLabel(user, locked)}</span></td>
                    <td className="py-4 pr-4 text-muted-foreground">{formatDate(user.lastLoginAt)}</td>
                    <td className="py-4 text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setSelectedUserId(user.userId)}>Sessions</Button>{locked && <Button variant="success" size="sm" onClick={() => setSelectedAction({ action: "unlock", userId: user.userId })}>Unlock</Button>}<Button variant="danger" size="sm" onClick={() => setSelectedAction({ action: "revoke", userId: user.userId })}>Revoke</Button></div></td>
                  </tr>; })}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground"><span>Page {page + 1} of {Math.max(totalPages, 1)}</span><div className="flex gap-2"><Button variant="glass" size="sm" disabled={page === 0} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="size-4" /> Previous</Button><Button variant="glass" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight className="size-4" /></Button></div></div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-base font-semibold">Locked accounts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Unlock only after reviewing the account context through your operational process.</p>
          <div className="mt-4 space-y-2">{lockedUsers.length ? lockedUsers.map((user) => <div key={user.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/60 p-4"><div><p className="text-sm font-medium">{user.email}</p><p className="text-xs text-muted-foreground">Created {formatDate(user.createdAt)}</p></div><Button variant="success" size="sm" onClick={() => setSelectedAction({ action: "unlock", userId: user.userId })}>Unlock</Button></div>) : <p className="rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">No locked accounts require review.</p>}</div>
        </section>
      </div>

      <Modal open={Boolean(selectedAction)} onClose={() => setSelectedAction(null)} title={selectedAction?.action === "unlock" ? "Unlock this account?" : "Revoke this user's sessions?"} description={selectedAction?.action === "unlock" ? `Restore sign-in access for ${selectedUser?.email ?? "this user"}.` : `All active sessions for ${selectedUser?.email ?? "this user"} will be invalidated.`} footer={<><Button variant="glass" onClick={() => setSelectedAction(null)}>Cancel</Button><Button variant={selectedAction?.action === "unlock" ? "success" : "danger"} loading={actionMutation.isPending} onClick={() => actionMutation.mutate(selectedAction)}>Confirm</Button></>}>
        <p className="text-sm text-muted-foreground">This action is enforced by the Auth service and cannot grant administrator privileges.</p>
      </Modal>

      <Modal open={Boolean(selectedUserId)} onClose={() => setSelectedUserId(null)} title="Active sessions" description="Only the current count is shown; session credentials are never displayed.">
        {sessionsQuery.isLoading ? <CardSkeleton /> : <p className="text-4xl font-bold text-foreground">{sessionsQuery.isError ? "Unavailable" : sessionsQuery.data ?? 0}<span className="ml-2 text-sm font-normal text-muted-foreground">active sessions</span></p>}
      </Modal>
    </AppShell>
  );
}

export { Route };
