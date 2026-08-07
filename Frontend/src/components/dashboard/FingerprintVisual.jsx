import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { Skeleton } from "@/components/ui-kit/Loader";
function FingerprintVisual({ fingerprint }) {
  if (!fingerprint) {
    return <Skeleton className="h-44 w-full" />;
  }
  const bits = fingerprint.visitorId.padEnd(32, "0").slice(0, 32).split("").map((char) => parseInt(char, 36) % 5);
  return <div className="glass-panel rounded-3xl p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
        <Fingerprint className="size-4" />
        Device fingerprint
      </div>
      <p className="mt-3 break-all font-mono text-xs text-muted-foreground">{fingerprint.visitorId}</p>
      <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
        {bits.map((bit, index) => <motion.span
    key={index}
    initial={{ opacity: 0.2, scaleY: 0.4 }}
    animate={{ opacity: 0.35 + bit * 0.16, scaleY: 0.5 + bit * 0.12 }}
    transition={{ duration: 0.6, delay: index * 0.02, repeat: Infinity, repeatType: "reverse" }}
    className="h-8 rounded-sm bg-gradient-brand"
  />)}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
        {[
    ["Platform", fingerprint.platform],
    ["Browser", fingerprint.browser],
    ["Screen", fingerprint.screen],
    ["Timezone", fingerprint.timezone]
  ].map(([label, value]) => <div key={label} className="rounded-2xl bg-muted/60 p-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
          </div>)}
      </dl>
    </div>;
}
export {
  FingerprintVisual
};
