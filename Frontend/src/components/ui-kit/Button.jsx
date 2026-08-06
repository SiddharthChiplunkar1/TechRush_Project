import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
const variants = {
  primary: "bg-gradient-brand text-primary-foreground shadow-lift hover:brightness-110 focus-visible:ring-primary",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary",
  glass: "glass-panel text-foreground hover:border-primary/45 hover:shadow-glow focus-visible:ring-primary",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-primary",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
  success: "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success"
};
const sizes = {
  sm: "h-9 px-4 text-sm rounded-xl",
  md: "h-11 px-5 text-sm rounded-2xl",
  lg: "h-13 px-7 text-base rounded-2xl"
};
const Button = forwardRef(function Button2({ className, variant = "primary", size = "md", loading = false, fullWidth, children, disabled, ...props }, ref) {
  return <motion.button
    ref={ref}
    {...disabled || loading ? {} : { whileHover: { y: -2 }, whileTap: { scale: 0.975 } }}
    transition={{ type: "spring", stiffness: 420, damping: 26 }}
    disabled={disabled || loading}
    className={cn(
      "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-55",
      variants[variant],
      sizes[size],
      fullWidth && "w-full",
      className
    )}
    {...props}
  >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </motion.button>;
});
export {
  Button
};
