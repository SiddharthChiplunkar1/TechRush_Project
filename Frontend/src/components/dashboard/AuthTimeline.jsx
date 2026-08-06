import { motion } from "framer-motion";
import { KeyRound, ScanFace, MailCheck, MonitorSmartphone, ShieldAlert, ShieldCheck } from "lucide-react";
import { AuthBadge } from "@/components/ui-kit/SecurityCard";
const methodMeta = {
  face: { label: "Face ID", icon: ScanFace },
  otp: { label: "Email OTP", icon: MailCheck },
  google: { label: "Google OAuth", icon: KeyRound },
  device: { label: "Trusted device", icon: MonitorSmartphone }
};
function AuthTimeline({ events }) {
  return <ol className="relative space-y-4 pl-6">
      <span className="absolute left-2 top-2 bottom-2 w-px bg-border" aria-hidden />
      {events.map((event, index) => {
    const meta = methodMeta[event.method];
    return <motion.li
      key={event.id}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="relative"
    >
            <span
      className={`absolute left-[-1.35rem] top-3 size-3 rounded-full ring-4 ring-background ${event.status === "success" ? "bg-success" : "bg-destructive"}`}
      aria-hidden
    />
            <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-muted text-foreground">
                  <meta.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.device} · {event.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AuthBadge
      label={event.status === "success" ? "Verified" : "Blocked"}
      tone={event.status === "success" ? "success" : "danger"}
      icon={event.status === "success" ? ShieldCheck : ShieldAlert}
    />
                <span className="text-xs text-muted-foreground">
                  {new Date(event.at).toLocaleString(void 0, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    })}
                </span>
              </div>
            </div>
          </motion.li>;
  })}
    </ol>;
}
export {
  AuthTimeline
};
