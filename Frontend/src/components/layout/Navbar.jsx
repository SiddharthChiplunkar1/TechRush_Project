import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { ThemeToggle } from "@/components/ui-kit/ThemeToggle";
const links = [
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#about" }
];
function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
      <nav className="glass-panel mx-auto flex max-w-6xl items-center justify-between rounded-3xl px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="SecurePass AI home">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-lift">
            <ShieldCheck className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            PasswordLess<span className="text-gradient"> Auth</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => <li key={link.href}>
              <a
    href={link.href}
    className="rounded-xl px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
  >
                {link.label}
              </a>
            </li>)}
        </ul>

        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Register</Button>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:hidden">
        <ThemeToggle />
        <button
    className="rounded-xl p-2 text-foreground"
    onClick={() => setOpen((value) => !value)}
    aria-label={open ? "Close menu" : "Open menu"}
    aria-expanded={open}
  >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        </div>
      </nav>


      <AnimatePresence>
        {open && <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="glass-panel mx-auto mt-2 max-w-6xl rounded-3xl p-4 sm:hidden"
  >
            <ul className="space-y-1">
              {links.map((link) => <li key={link.href}>
                  <a
    href={link.href}
    onClick={() => setOpen(false)}
    className="block rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
  >
                    {link.label}
                  </a>
                </li>)}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="glass" fullWidth size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button fullWidth size="sm">
                  Register
                </Button>
              </Link>
            </div>
          </motion.div>}
      </AnimatePresence>
    </header>;
}
export {
  Navbar
};
