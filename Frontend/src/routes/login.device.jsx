import { useState } from "react";

import { createFileRoute, redirect } from "@tanstack/react-router";
import { MonitorSmartphone, ShieldCheck } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-kit/Button";
import { FingerprintVisual } from "@/components/dashboard/FingerprintVisual";
import { Input } from "@/components/ui-kit/Input";
import { useAuth } from "@/context/AuthContext";
import { bootstrapAuthSession } from "@/lib/authSession";
import { tokenStorage } from "@/lib/tokenStorage";
import { useDeviceFingerprint } from "@/hooks/useDeviceFingerprint";

const Route = createFileRoute("/login/device")({
  beforeLoad: async () => {
    await bootstrapAuthSession();
    if (tokenStorage.get() && !tokenStorage.isExpired()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Trusted device login — SecurePass AI" },
      { name: "description", content: "Silent re-authentication using this device's approved fingerprint." },
      { property: "og:title", content: "Trusted device login — SecurePass AI" },
      { property: "og:description", content: "Recognized hardware signs you in when it is already trusted." },
    ],
  }),
  component: DeviceLoginPage,
});

function DeviceLoginPage() {
  const fingerprint = useDeviceFingerprint();
  const { loginWithTrustedDevice, isBusy } = useAuth();
  const [email, setEmail] = useState("");

  return (
    <AuthLayout
      title="Trusted device login"
      description="Use an already approved device to sign in without another OTP."
      backTo="/login"
      backLabel="All methods"
      wide
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              fullWidth
              size="lg"
              loading={isBusy}
              disabled={!email.trim()}
              onClick={async () => {
                await loginWithTrustedDevice({ email });
              }}
            >
              <ShieldCheck className="size-4" />
              Continue on this device
            </Button>
          </div>
          <div className="glass-panel rounded-[2rem] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              Device fingerprint
            </p>
            <FingerprintVisual fingerprint={fingerprint} />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Trusted device sign-in still goes through the gateway and uses the current browser fingerprint.
        </p>
      </div>
    </AuthLayout>
  );
}

export {
  Route,
};
