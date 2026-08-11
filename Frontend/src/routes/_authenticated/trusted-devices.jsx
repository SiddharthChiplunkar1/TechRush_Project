import { useMemo } from "react";

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MonitorSmartphone, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui-kit/Button";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { CardSkeleton } from "@/components/ui-kit/Loader";
import { AuthBadge } from "@/components/ui-kit/SecurityCard";
import { authService } from "@/services/authService";

const Route = createFileRoute("/_authenticated/trusted-devices")({
  head: () => ({
    meta: [
      { title: "Trusted devices — SecurePass AI" },
      { name: "description", content: "Review, trust and revoke the devices allowed to access your account." },
      { property: "og:title", content: "Trusted devices — SecurePass AI" },
      { property: "og:description", content: "Device-level control over every session." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrustedDevicesPage,
});

function sortDevices(devices) {
  return [...devices].sort(
    (left, right) => new Date(right.lastUsed ?? right.firstSeen ?? 0).getTime() - new Date(left.lastUsed ?? left.firstSeen ?? 0).getTime(),
  );
}

function TrustedDevicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const devicesQuery = useQuery({
    queryKey: ["devices"],
    queryFn: authService.getDevices,
  });

  const devices = useMemo(() => sortDevices(devicesQuery.data ?? []), [devicesQuery.data]);
  const currentDeviceId = devices[0]?.deviceId ?? null;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["devices"] });

  const trustDevice = useMutation({
    mutationFn: (deviceId) => authService.trustDevice(deviceId),
    onSuccess: () => {
      toast.success("Device trusted");
      refresh();
    },
    onError: () => toast.error("Could not trust that device"),
  });

  const removeDevice = useMutation({
    mutationFn: (deviceId) => authService.removeDevice(deviceId),
    onSuccess: () => {
      toast.success("Device removed");
      refresh();
    },
    onError: () => toast.error("Could not remove that device"),
  });

  return (
    <AppShell title="Trusted devices" subtitle="Every session is bound to a device fingerprint">
      <div className="mb-5 flex justify-between gap-3">
        <Button variant="glass" onClick={() => refresh()}>
          <RefreshCw className="size-4" />
          Refresh list
        </Button>
        <Button variant="glass" onClick={() => void router.navigate({ to: "/login/device" })}>
          <MonitorSmartphone className="size-4" />
          Add this device
        </Button>
      </div>

      {devicesQuery.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : devices.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {devices.map((device) => {
            const isCurrent = device.deviceId === currentDeviceId;
            return (
              <article key={device.deviceId} className="glass-panel gradient-border rounded-3xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground">
                    <ShieldCheck className="size-5" />
                  </span>
                  <AuthBadge
                    label={isCurrent ? "This device" : device.trusted ? "Trusted" : "Untrusted"}
                    tone={isCurrent || device.trusted ? "success" : "warning"}
                    icon={ShieldCheck}
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {device.deviceName ?? "Unknown device"}
                </h3>
                <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <dt>Type</dt>
                    <dd className="text-foreground/80">{device.deviceType ?? "UNKNOWN"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Browser</dt>
                    <dd className="text-foreground/80">{device.browser ?? "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Operating system</dt>
                    <dd className="text-foreground/80">{device.operatingSystem ?? "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>First seen</dt>
                    <dd className="text-foreground/80">
                      {device.firstSeen ? new Date(device.firstSeen).toLocaleString() : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Last used</dt>
                    <dd className="text-foreground/80">
                      {device.lastUsed ? new Date(device.lastUsed).toLocaleString() : "—"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex gap-2">
                  {!device.trusted && (
                    <Button
                      size="sm"
                      loading={trustDevice.isPending}
                      onClick={() => trustDevice.mutate(device.deviceId)}
                    >
                      Trust device
                    </Button>
                  )}
                  {!isCurrent && (
                    <Button
                      size="sm"
                      variant="glass"
                      loading={removeDevice.isPending}
                      onClick={() => removeDevice.mutate(device.deviceId)}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={MonitorSmartphone}
          title="No devices yet"
          description="The first time you sign in, we’ll show the device the backend registered."
        />
      )}
    </AppShell>
  );
}

export {
  Route,
};
