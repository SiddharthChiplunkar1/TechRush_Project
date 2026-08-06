import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
function ThemeToggle({ className }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return <motion.button
    type="button"
    onClick={toggle}
    whileTap={{ scale: 0.94 }}
    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    title={isDark ? "Light mode" : "Dark mode"}
    className={cn(
      "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-glass-border bg-glass text-foreground transition-colors hover:border-primary/40 hover:text-primary",
      className
    )}
  >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
    key={theme}
    initial={{ y: 12, opacity: 0, rotate: -35 }}
    animate={{ y: 0, opacity: 1, rotate: 0 }}
    exit={{ y: -12, opacity: 0, rotate: 35 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
    className="inline-flex"
  >
          {isDark ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>;
}
export {
  ThemeToggle
};
