import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Fingerprint, KeyRound, LogOut, MonitorSmartphone, ScanFace, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui-kit/Button";
import { SecurityCard, AuthBadge } from "@/components/ui-kit/SecurityCard";
import { CircularProgress } from "@/components/ui-kit/CircularProgress";
import { CardSkeleton } from "@/components/ui-kit/Loader";
import { AuthTrendChart, MethodBreakdownChart } from "@/components/ui-kit/Charts";
import { AuthTimeline } from "@/components/dashboard/AuthTimeline";
import { FingerprintVisual } from "@/components/dashboard/FingerprintVisual";
import { SecurityTipsCarousel } from "@/components/ui-kit/SecurityTipsCarousel";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useDeviceFingerprint } from "@/hooks/useDeviceFingerprint";
import { useSessionCountdown } from "@/hooks/useSessionCountdown";
import { authService } from "@/services/authService";
const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Security dashboard \u2014 SecurePass AI" },
      { name: "description", content: "Live security score, session status, device trust and authentication history." },
      { property: "og:title", content: "Security dashboard \u2014 SecurePass AI" },
      { property: "og:description", content: "Your passwordless identity posture at a glance." },
      { name: "robots", content: "noindex" }
    ]
  }),
  component: DashboardPage
});
const methodLabels = { face: "Face ID", otp: "Email OTP", google: "Google OAuth", device: "Trusted device" };
function DashboardPage() {
  const { user, logout, expiresAt } = useAuth();
  const fingerprint = useDeviceFingerprint();
  const { formatted, remaining } = useSessionCountdown(expiresAt);
  const history = useQuery({ queryKey: ["login-history"], queryFn: authService.loginHistory });
  const analytics = useQuery({ queryKey: ["analytics"], queryFn: authService.analytics });
  return <AppShell title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`} subtitle="Your live identity posture">
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass-panel gradient-border rounded-[2rem] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <AuthBadge label={user ? methodLabels[user.authMethod] : "Session"} tone="primary" icon={ShieldCheck} />
            <AuthBadge label={`${user?.authLevel ?? "Basic"} level`} tone="accent" />
            <AuthBadge label="JWT active" tone="success" icon={KeyRound} />
          </div>
          <h2 className="mt-5 text-2xl font-bold sm:text-3xl">{user?.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/face-enrollment"><Button><ScanFace className="size-4" />Enroll face</Button></Link>
            <Link to="/trusted-devices"><Button variant="glass"><MonitorSmartphone className="size-4" />Manage devices</Button></Link>
            <Button variant="glass" onClick={() => logout()}><LogOut className="size-4" />Logout</Button>
          </div>
        </div>
        <div className="glass-panel flex flex-col items-center justify-center gap-3 rounded-[2rem] p-7">
          <CircularProgress value={user?.securityScore ?? 70} caption="Security score" />
          <p className="text-center text-xs text-muted-foreground">
            Boost your score by enrolling Face ID and pruning unknown devices.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SecurityCard icon={MonitorSmartphone} label="Current device" value={fingerprint ? `${fingerprint.platform} \xB7 ${fingerprint.browser}` : "Detecting\u2026"} meta={fingerprint?.timezone} index={0} />
        <SecurityCard icon={ShieldCheck} label="Trusted device" value="Approved" meta="Bound to fingerprint" tone="success" index={1} />
        <SecurityCard icon={Clock} label="JWT expires in" value={formatted} meta={remaining < 300 ? "Rotating soon" : "Healthy"} tone={remaining < 300 ? "warning" : "accent"} index={2} />
        <SecurityCard icon={Fingerprint} label="Recent login" value={user ? methodLabels[user.authMethod] : "\u2014"} meta="Just now" index={3} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="glass-panel rounded-[2rem] p-6">
          <h3 className="text-base font-semibold">Authentication trend</h3>
          <p className="mt-1 text-xs text-muted-foreground">Successful versus blocked attempts this week</p>
          <div className="mt-4">{analytics.data ? <AuthTrendChart data={analytics.data.timeline} /> : <CardSkeleton />}</div>
        </section>
        <section className="glass-panel rounded-[2rem] p-6">
          <h3 className="text-base font-semibold">Method breakdown</h3>
          <p className="mt-1 text-xs text-muted-foreground">How your account is being accessed</p>
          <div className="mt-4">{analytics.data ? <MethodBreakdownChart data={analytics.data.methods} /> : <CardSkeleton />}</div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="glass-panel rounded-[2rem] p-6">
          <h3 className="text-base font-semibold">Authentication timeline</h3>
          <div className="mt-5">
            {history.isLoading ? <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div> : history.data && history.data.length > 0 ? <AuthTimeline events={history.data} /> : <EmptyState icon={ShieldCheck} title="No activity yet" description="Sign-in events will appear here as soon as they happen." />}
          </div>
        </section>
        <div className="space-y-5">
          <FingerprintVisual fingerprint={fingerprint} />
          <SecurityTipsCarousel />
        </div>
      </div>
    </AppShell>;
}
export {
  Route
};
