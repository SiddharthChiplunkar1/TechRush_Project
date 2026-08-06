import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bell, LogOut, Moon, Shield, Sun } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui-kit/Button";
import { Modal } from "@/components/ui-kit/Modal";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings \u2014 SecurePass AI" },
      { name: "description", content: "Theme, notification, privacy and session controls for your account." },
      { property: "og:title", content: "Settings \u2014 SecurePass AI" },
      { property: "og:description", content: "Tune appearance, alerts and session security." },
      { name: "robots", content: "noindex" }
    ]
  }),
  component: SettingsPage
});
function Toggle({ checked, onChange, label }) {
  return <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-gradient-brand" : "bg-muted"}`}
  >
      <span
    className={`absolute top-1 size-5 rounded-full bg-card shadow-sm transition-all ${checked ? "left-6" : "left-1"}`}
  />
    </button>;
}
function Row({ icon: Icon, title, description, control }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/60 p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {control}
    </div>;
}
function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return <AppShell title="Settings" subtitle="Appearance, alerts and session control">
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-base font-semibold">Appearance</h2>
          <div className="mt-4 space-y-3">
            <Row
    icon={theme === "dark" ? Moon : Sun}
    title="Dark mode"
    description="Deep space canvas tuned for low-light use"
    control={<Toggle label="Dark mode" checked={theme === "dark"} onChange={(value) => setTheme(value ? "dark" : "light")} />}
  />
            <div className="grid grid-cols-2 gap-3">
              {["dark", "light"].map((mode) => <button
    key={mode}
    onClick={() => setTheme(mode)}
    className={`rounded-2xl border p-4 text-left text-sm capitalize transition-all ${theme === mode ? "border-primary/60 shadow-glow" : "border-border hover:border-primary/30"}`}
  >
                  <span className="block font-medium text-foreground">{mode} theme</span>
                  <span className="text-xs text-muted-foreground">{mode === "dark" ? "#020617 canvas" : "#F8FAFC canvas"}</span>
                </button>)}
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-base font-semibold">Notifications</h2>
          <div className="mt-4 space-y-3">
            <Row icon={Bell} title="Email alerts" description="New device and blocked attempt notices" control={<Toggle label="Email alerts" checked={emailAlerts} onChange={setEmailAlerts} />} />
            <Row icon={Bell} title="Push alerts" description="Real-time push on suspicious activity" control={<Toggle label="Push alerts" checked={pushAlerts} onChange={setPushAlerts} />} />
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-base font-semibold">Privacy</h2>
          <div className="mt-4 space-y-3">
            <Row icon={Shield} title="Anonymous analytics" description="Share aggregate auth metrics to improve detection" control={<Toggle label="Analytics" checked={analyticsOptIn} onChange={setAnalyticsOptIn} />} />
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-base font-semibold">Sessions</h2>
          <p className="mt-2 text-sm text-muted-foreground">Revoke every issued JWT and force re-authentication everywhere.</p>
          <Button variant="danger" className="mt-5" onClick={() => setConfirmOpen(true)}>
            <LogOut className="size-4" />
            Logout all devices
          </Button>
        </section>
      </div>

      <Modal
    open={confirmOpen}
    onClose={() => setConfirmOpen(false)}
    title="Logout all devices?"
    description="Every active session will end immediately, including this one."
    footer={<>
            <Button variant="glass" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
      variant="danger"
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const result = await authService.logoutAllDevices();
          toast.success(`${result.revoked} sessions revoked`);
          logout({ silent: true });
        } finally {
          setBusy(false);
        }
      }}
    >
              Revoke everything
            </Button>
          </>}
  />
    </AppShell>;
}
export {
  Route
};
