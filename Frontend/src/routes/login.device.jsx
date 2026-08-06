import { createFileRoute } from "@tanstack/react-router";
import { MonitorSmartphone } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-kit/Button";
import { FingerprintVisual } from "@/components/dashboard/FingerprintVisual";
import { useDeviceFingerprint } from "@/hooks/useDeviceFingerprint";
import { useAuth } from "@/context/AuthContext";
const Route = createFileRoute("/login/device")({
  head: () => ({
    meta: [
      { title: "Trusted device login \u2014 SecurePass AI" },
      { name: "description", content: "Silent re-authentication using this device's approved fingerprint." },
      { property: "og:title", content: "Trusted device login \u2014 SecurePass AI" },
      { property: "og:description", content: "Recognised hardware signs in instantly." }
    ]
  }),
  component: DeviceLoginPage
});
function DeviceLoginPage() {
  const fingerprint = useDeviceFingerprint();
  const { loginWithTrustedDevice, isBusy } = useAuth();
  return <AuthLayout title="Trusted device login" description="We recognise hardware, not passwords.">
      <div className="space-y-6">
        <FingerprintVisual fingerprint={fingerprint} />
        <Button
    fullWidth
    size="lg"
    loading={isBusy}
    disabled={!fingerprint}
    onClick={() => void loginWithTrustedDevice().catch(() => void 0)}
  >
          <MonitorSmartphone className="size-4" />
          Continue on this device
        </Button>
      </div>
    </AuthLayout>;
}
export {
  Route
};
