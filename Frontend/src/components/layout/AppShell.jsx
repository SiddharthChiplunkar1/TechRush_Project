import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  ReceiptText,
  ScanFace,
  Settings,
  ShieldCheck,
  UserRound,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSessionCountdown } from "@/hooks/useSessionCountdown";
import { Button } from "@/components/ui-kit/Button";
import { AnimatedBackground } from "@/components/ui-kit/AnimatedBackground";
import { ThemeToggle } from "@/components/ui-kit/ThemeToggle";
import { cn } from "@/lib/utils";
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transfer", label: "Transfer", icon: ArrowRightLeft },
  { to: "/transactions", label: "Transactions", icon: ReceiptText },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/face-enrollment", label: "Face enrollment", icon: ScanFace },
  { to: "/trusted-devices", label: "Trusted devices", icon: MonitorSmartphone },
  { to: "/settings", label: "Settings", icon: Settings }
];
function AppShell({ title, subtitle, children }) {
  const { user, logout, expiresAt } = useAuth();
  const { formatted } = useSessionCountdown(expiresAt);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = <nav className="space-y-1">
      {navItems.map((item) => {
    const active = pathname === item.to;
    return <Link
      key={item.to}
      to={item.to}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all",
        active ? "bg-gradient-brand text-primary-foreground shadow-lift" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
            <item.icon className="size-4.5" />
            {item.label}
          </Link>;
  })}
    </nav>;
  return <div className="min-h-screen">
      <AnimatedBackground variant="subtle" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-glass-border bg-sidebar/60 p-5 backdrop-blur-2xl lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span className="text-base font-semibold">
            Secure<span className="text-gradient">Pass AI</span>
          </span>
        </Link>
        <div className="mt-8 flex-1">{nav}</div>
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Session expires in</p>
          <p className="mt-1 font-mono text-lg text-foreground">{formatted}</p>
        </div>
        <Button variant="glass" className="mt-3" onClick={() => logout()}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-glass-border bg-background/70 backdrop-blur-2xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
    className="rounded-xl p-2 text-foreground lg:hidden"
    onClick={() => setMobileOpen(true)}
    aria-label="Open navigation"
  >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">{user?.name ?? "Guest"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground">
                {(user?.name ?? "SP").split(" ").map((part) => part[0]).slice(0, 2).join("")}
              </span>
            </div>
          </div>
        </header>

        <motion.main
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="mx-auto max-w-7xl px-4 py-8 sm:px-8"
  >
          {children}
        </motion.main>
      </div>

      <AnimatePresence>
        {mobileOpen && <motion.div
    className="fixed inset-0 z-40 lg:hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
            <button
    aria-label="Close navigation"
    className="absolute inset-0 bg-background/70 backdrop-blur-sm"
    onClick={() => setMobileOpen(false)}
  />
            <motion.aside
    initial={{ x: -320 }}
    animate={{ x: 0 }}
    exit={{ x: -320 }}
    transition={{ type: "spring", stiffness: 320, damping: 32 }}
    className="relative z-10 flex h-full w-72 flex-col border-r border-glass-border bg-sidebar p-5"
  >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">
                  Secure<span className="text-gradient">Pass AI</span>
                </span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-6 flex-1">{nav}</div>
              <Button variant="glass" onClick={() => logout()}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </motion.aside>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
export {
  AppShell
};
