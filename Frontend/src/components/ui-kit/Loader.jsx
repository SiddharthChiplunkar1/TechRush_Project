import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
function Loader({ label = "Securing session" }) {
  return <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className="relative size-14">
        <motion.span
    className="absolute inset-0 rounded-full border-2 border-primary/25"
    animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0.2, 0.9] }}
    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
  />
        <motion.span
    className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-accent"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>;
}
function Skeleton({ className }) {
  return <div className={cn("shimmer rounded-2xl", className)} />;
}
function CardSkeleton() {
  return <div className="glass-panel space-y-4 rounded-3xl p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>;
}
export {
  CardSkeleton,
  Loader,
  Skeleton
};
