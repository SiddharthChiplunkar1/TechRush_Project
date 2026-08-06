import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AnimatedBackground } from "@/components/ui-kit/AnimatedBackground";
function AuthLayout({
  title,
  description,
  children,
  backTo = "/login",
  backLabel = "All methods",
  wide = false
}) {
  return <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-14">
      <AnimatedBackground />

      <Link to="/" className="mb-8 flex items-center gap-2.5" aria-label="SecurePass AI home">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-lift">
          <ShieldCheck className="size-5" />
        </span>
        <span className="text-base font-semibold">
          Secure<span className="text-gradient">Pass AI</span>
        </span>
      </Link>

      <motion.section
    initial={{ opacity: 0, y: 22, scale: 0.985 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={`glass-panel w-full rounded-[2rem] p-6 sm:p-9 ${wide ? "max-w-4xl" : "max-w-md"}`}
  >
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-7">{children}</div>
      </motion.section>

      <Link
    to={backTo}
    className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
  >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>
    </div>;
}
export {
  AuthLayout
};
