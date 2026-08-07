import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, KeyRound, Mail, MonitorSmartphone, ScanFace, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthBadge } from "@/components/ui-kit/SecurityCard";
import { CircularProgress } from "@/components/ui-kit/CircularProgress";
import { useAuth } from "@/context/AuthContext";
const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile \u2014 SecurePass AI" },
      { name: "description", content: "Your personal information, enabled authentication methods and security status." },
      { property: "og:title", content: "Profile \u2014 SecurePass AI" },
      { property: "og:description", content: "Manage your passwordless identity profile." },
      { name: "robots", content: "noindex" }
    ]
  }),
  component: ProfilePage
});
function ProfilePage() {
  const { user } = useAuth();
  const methods = [
    { label: "Email OTP", icon: Mail, enabled: true },
    { label: "Google OAuth", icon: KeyRound, enabled: user?.authMethod === "google" },
    { label: "Face ID", icon: ScanFace, enabled: Boolean(user?.faceEnrolled) },
    { label: "Trusted device", icon: MonitorSmartphone, enabled: true }
  ];
  return <AppShell title="Profile" subtitle="Identity details and enabled methods">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <section className="glass-panel gradient-border rounded-[2rem] p-7 text-center">
          <span className="inline-flex size-24 items-center justify-center rounded-full bg-gradient-brand text-2xl font-bold text-primary-foreground shadow-lift">
            {(user?.name ?? "SP").split(" ").map((part) => part[0]).slice(0, 2).join("")}
          </span>
          <h2 className="mt-5 text-xl font-semibold">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-4 flex justify-center gap-2">
            <AuthBadge label={`${user?.authLevel ?? "Basic"} level`} tone="primary" icon={ShieldCheck} />
          </div>
          <div className="mt-7 flex justify-center">
            <CircularProgress value={user?.securityScore ?? 70} caption="Security score" size={120} />
          </div>
        </section>

        <div className="space-y-5">
          <section className="glass-panel rounded-[2rem] p-6">
            <h3 className="text-base font-semibold">Personal information</h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
    ["Full name", user?.name ?? "\u2014", UserRound],
    ["Email", user?.email ?? "\u2014", Mail],
    ["Member since", user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "\u2014", CalendarDays],
    ["User ID", user?.id ?? "\u2014", KeyRound]
  ].map(([label, value, Icon]) => {
    const IconComponent = Icon;
    return <div key={label} className="rounded-2xl bg-muted/60 p-4">
                    <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                      <IconComponent className="size-3.5" />
                      {label}
                    </dt>
                    <dd className="mt-1 truncate text-sm font-medium text-foreground">{value}</dd>
                  </div>;
  })}
            </dl>
          </section>

          <section className="glass-panel rounded-[2rem] p-6">
            <h3 className="text-base font-semibold">Authentication methods</h3>
            <ul className="mt-4 space-y-3">
              {methods.map((method) => <li key={method.label} className="flex items-center justify-between rounded-2xl bg-muted/60 p-4">
                  <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <method.icon className="size-4 text-primary" />
                    {method.label}
                  </span>
                  <AuthBadge label={method.enabled ? "Enabled" : "Not set up"} tone={method.enabled ? "success" : "warning"} />
                </li>)}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>;
}
export {
  Route
};
