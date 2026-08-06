import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
const tones = {
  primary: "text-primary bg-primary/12 border-primary/25",
  accent: "text-accent bg-accent/12 border-accent/25",
  success: "text-success bg-success/12 border-success/25",
  warning: "text-warning bg-warning/12 border-warning/25",
  danger: "text-destructive bg-destructive/12 border-destructive/25"
};
function SecurityCard({
  icon: Icon,
  label,
  value,
  meta,
  tone = "primary",
  index = 0
}) {
  return <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: index * 0.06 }}
    whileHover={{ y: -6 }}
    className="glass-panel gradient-border card-glow rounded-3xl p-5"
  >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
        <span className={cn("inline-flex size-9 items-center justify-center rounded-xl border", tones[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-4 text-lg font-semibold text-foreground">{value}</p>
      {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
    </motion.div>;
}
function AuthBadge({
  label,
  tone = "primary",
  icon: Icon
}) {
  return <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
      tones[tone]
    )}
  >
      {Icon && <Icon className="size-3.5" />}
      {label}
    </span>;
}
export {
  AuthBadge,
  SecurityCard
};
