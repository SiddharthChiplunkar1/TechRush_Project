import { motion } from "framer-motion";
import { Laptop, MonitorSmartphone, ShieldCheck, ShieldAlert, Smartphone, Trash2 } from "lucide-react";
import { AuthBadge } from "./SecurityCard";
import { Button } from "./Button";
const statusMeta = {
  current: { label: "This device", tone: "success", icon: ShieldCheck },
  trusted: { label: "Trusted", tone: "primary", icon: ShieldCheck },
  unknown: { label: "Unrecognised", tone: "warning", icon: ShieldAlert }
};
function deviceIcon(platform) {
  if (/ios|android|phone/i.test(platform)) return Smartphone;
  if (/mac|win|linux/i.test(platform)) return Laptop;
  return MonitorSmartphone;
}
function DeviceCard({
  device,
  index = 0,
  onTrust,
  onRemove,
  busy
}) {
  const meta = statusMeta[device.status];
  const Icon = deviceIcon(device.platform);
  return <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: index * 0.07 }}
    whileHover={{ y: -6 }}
    className="glass-panel gradient-border rounded-3xl p-6"
  >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground">
          <Icon className="size-5" />
        </span>
        <AuthBadge label={meta.label} tone={meta.tone} icon={meta.icon} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{device.label}</h3>
      <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>Platform</dt>
          <dd className="text-foreground/80">{device.platform}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Browser</dt>
          <dd className="text-foreground/80">{device.browser}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Fingerprint</dt>
          <dd className="font-mono text-foreground/80">{device.fingerprint.slice(0, 12)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Last seen</dt>
          <dd className="text-foreground/80">{new Date(device.lastSeen).toLocaleString()}</dd>
        </div>
      </dl>
      <div className="mt-5 flex gap-2">
        {device.status === "unknown" && onTrust && <Button size="sm" loading={busy} onClick={() => onTrust(device)}>
            Trust device
          </Button>}
        {device.status !== "current" && onRemove && <Button size="sm" variant="glass" loading={busy} onClick={() => onRemove(device)}>
            <Trash2 className="size-4" />
            Remove
          </Button>}
      </div>
    </motion.article>;
}
export {
  DeviceCard
};
