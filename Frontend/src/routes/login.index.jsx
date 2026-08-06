import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { KeyRound, MailCheck, MonitorSmartphone, ScanFace } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
const Route = createFileRoute("/login/")({
  head: () => ({
    meta: [
      { title: "Sign in \u2014 SecurePass AI" },
      { name: "description", content: "Choose Face ID, Google OAuth, email OTP or a trusted device to sign in." },
      { property: "og:title", content: "Sign in \u2014 SecurePass AI" },
      { property: "og:description", content: "Four passwordless ways to prove who you are." }
    ]
  }),
  component: LoginPage
});
const methods = [
  {
    to: "/login/otp",
    icon: MailCheck,
    title: "OTP Login",
    description: "Six digit single-use code sent straight to your inbox.",
    meta: "~15 sec"
  },
  {
    to: "/login/google",
    icon: KeyRound,
    title: "Google Login",
    description: "Federated OAuth sign-in with your Google account.",
    meta: "1 tap"
  },
  {
    to: "/login/face",
    icon: ScanFace,
    title: "Face Login",
    description: "Biometric match with live scan and liveness detection.",
    meta: "~2 sec"
  },
  {
    to: "/login/device",
    icon: MonitorSmartphone,
    title: "Trusted Device",
    description: "Silent login using this device's approved fingerprint.",
    meta: "instant"
  }
];
function LoginPage() {
  return <AuthLayout
    title="Choose how you sign in"
    description="No passwords. Pick the method that fits the moment."
    backTo="/"
    backLabel="Back to home"
    wide
  >
      <div className="grid gap-4 sm:grid-cols-2">
        {methods.map((method, index) => <motion.div
    key={method.to}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: index * 0.08 }}
    whileHover={{ y: -8 }}
  >
            <Link
    to={method.to}
    className="glass-panel gradient-border group relative block h-full overflow-hidden rounded-3xl p-6 transition-shadow hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-accent/25 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start justify-between gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-lift">
                  <method.icon className="size-5" />
                </span>
                <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {method.meta}
                </span>
              </div>
              <h2 className="relative mt-5 text-base font-semibold text-foreground">{method.title}</h2>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{method.description}</p>
              {method.title === "Face Login" && <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
    className="h-full w-1/3 rounded-full bg-gradient-brand"
    animate={{ x: ["-10%", "230%"] }}
    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
  />
                </div>}
            </Link>
          </motion.div>)}
      </div>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        New to SecurePass AI?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>;
}
export {
  Route
};
