import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
function AnimatedBackground({ variant = "full" }) {
  const particles = Array.from({ length: 18 });
  return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
    className={cn(
      "absolute -left-32 -top-32 size-[38rem] rounded-full blur-3xl animate-blob",
      variant === "full" ? "bg-primary/25" : "bg-primary/12"
    )}
  />
      <div
    className={cn(
      "absolute -right-24 top-24 size-[32rem] rounded-full blur-3xl animate-blob [animation-delay:-6s]",
      variant === "full" ? "bg-secondary/25" : "bg-secondary/12"
    )}
  />
      <div
    className={cn(
      "absolute bottom-[-14rem] left-1/3 size-[34rem] rounded-full blur-3xl animate-blob [animation-delay:-12s]",
      variant === "full" ? "bg-accent/20" : "bg-accent/10"
    )}
  />
      <div
    className="absolute inset-0 opacity-[0.16]"
    style={{
      backgroundImage: "linear-gradient(to right, color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 1px)",
      backgroundSize: "64px 64px",
      maskImage: "radial-gradient(80% 60% at 50% 20%, black, transparent)"
    }}
  />
      {particles.map((_, index) => <motion.span
    key={index}
    className="absolute size-1 rounded-full bg-accent/70"
    style={{ left: `${index * 37 % 100}%`, top: `${index * 53 % 100}%` }}
    animate={{ y: [0, -60, 0], opacity: [0, 0.9, 0] }}
    transition={{
      duration: 8 + index % 5 * 2,
      repeat: Infinity,
      delay: index * 0.4,
      ease: "easeInOut"
    }}
  />)}
    </div>;
}
export {
  AnimatedBackground
};
