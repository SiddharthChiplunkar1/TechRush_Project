import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
function CircularProgress({
  value,
  size = 132,
  strokeWidth = 10,
  label,
  caption,
  className
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  return <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gauge-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="55%" stopColor="var(--secondary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    strokeWidth={strokeWidth}
    className="fill-none stroke-muted"
  />
        <motion.circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    stroke="url(#gauge-gradient)"
    className="fill-none"
    strokeDasharray={circumference}
    initial={{ strokeDashoffset: circumference }}
    animate={{ strokeDashoffset: circumference - clamped / 100 * circumference }}
    transition={{ duration: 1.2, ease: "easeOut" }}
  />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-foreground">{label ?? `${Math.round(clamped)}`}</span>
        {caption && <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{caption}</span>}
      </div>
    </div>;
}
export {
  CircularProgress
};
