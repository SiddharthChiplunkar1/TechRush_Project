import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  Fingerprint,
  Gauge,
  KeyRound,
  Lock,
  MailCheck,
  MonitorSmartphone,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedBackground } from "@/components/ui-kit/AnimatedBackground";
import { Button } from "@/components/ui-kit/Button";
import { FeatureCard } from "@/components/ui-kit/FeatureCard";
import { Counter } from "@/components/ui-kit/Counter";
import { CircularProgress } from "@/components/ui-kit/CircularProgress";
import { SecurityTipsCarousel } from "@/components/ui-kit/SecurityTipsCarousel";
const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SecurePass AI \u2014 Experience Passwordless Authentication" },
      {
        name: "description",
        content: "Face ID, Google OAuth, email OTP and trusted device login in one premium passwordless identity platform."
      },
      { property: "og:title", content: "SecurePass AI \u2014 Experience Passwordless Authentication" },
      {
        property: "og:description",
        content: "Passwordless identity with biometrics, OTP, OAuth and device fingerprinting."
      }
    ]
  }),
  component: LandingPage
});
const features = [
  { icon: ScanFace, title: "Face Recognition", description: "Liveness-checked biometric login that completes in under two seconds." },
  { icon: MailCheck, title: "OTP Authentication", description: "Single-use six digit codes delivered by email with a 60 second lifetime." },
  { icon: KeyRound, title: "Google OAuth", description: "Federated sign-in with the identity provider your users already trust." },
  { icon: MonitorSmartphone, title: "Trusted Devices", description: "Silent re-authentication for devices you have explicitly approved." },
  { icon: Lock, title: "JWT Security", description: "Short-lived signed tokens with rotation, revocation and expiry countdown." },
  { icon: Fingerprint, title: "Device Fingerprinting", description: "Every session is bound to a hardware and browser entropy signature." }
];
const steps = [
  { title: "Choose authentication method", description: "Face, OTP, Google or a trusted device \u2014 the user decides.", icon: Sparkles },
  { title: "Verify identity", description: "Biometric match, code validation or fingerprint challenge.", icon: ShieldCheck },
  { title: "Generate JWT", description: "A short-lived signed token is issued and bound to the device.", icon: Lock },
  { title: "Access dashboard", description: "Enter the account with a live security posture snapshot.", icon: Gauge }
];
function LandingPage() {
  return <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 sm:pt-40">
        <section className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent">
              <Zap className="size-3.5" />
              Zero passwords. Zero friction.
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Experience <span className="text-gradient">Passwordless</span> Authentication
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Secure your identity using Face ID, Google OAuth, Email OTP and Trusted Devices.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg">
                  Get started
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="glass">
                  Learn more
                </Button>
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" /> SOC2-style audit trail
              </span>
              <span className="inline-flex items-center gap-2">
                <Cpu className="size-4 text-accent" /> On-device biometric matching
              </span>
            </div>
          </motion.div>

          <motion.div
    initial={{ opacity: 0, scale: 0.94 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.7, delay: 0.15 }}
    className="relative mx-auto w-full max-w-md"
  >
            <div className="glass-panel relative aspect-square rounded-[2.5rem] p-8">
              <div className="absolute inset-10 rounded-full bg-gradient-brand opacity-25 blur-3xl" />
              <div className="relative flex h-full flex-col items-center justify-center gap-6">
                <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
    className="absolute inset-4 rounded-full border border-dashed border-primary/35"
  />
                <motion.div
    animate={{ rotate: -360 }}
    transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
    className="absolute inset-12 rounded-full border border-accent/30"
  />
                <span className="relative inline-flex size-28 items-center justify-center rounded-[2rem] bg-gradient-brand text-primary-foreground shadow-lift">
                  <ScanFace className="size-14" />
                </span>
                <div className="relative text-center">
                  <p className="text-sm font-semibold text-foreground">Identity verified</p>
                  <p className="text-xs text-muted-foreground">Face ID · 1.4s · JWT issued</p>
                </div>
              </div>
            </div>

            <motion.div
    className="glass-panel animate-float absolute -left-6 top-14 w-44 rounded-2xl p-4"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5 }}
  >
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Security score</p>
              <p className="mt-1 text-2xl font-semibold text-success">96</p>
            </motion.div>
            <motion.div
    className="glass-panel animate-float absolute -right-4 bottom-16 w-48 rounded-2xl p-4 [animation-delay:-3s]"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.65 }}
  >
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Trusted devices</p>
              <p className="mt-1 text-sm font-medium text-foreground">3 active sessions</p>
            </motion.div>
          </motion.div>
        </section>

        <section id="features" className="mt-28 scroll-mt-28">
          <SectionHeading
    eyebrow="Platform"
    title="Six layers of passwordless defence"
    description="Every authentication path is first-class, auditable and instant."
  />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => <FeatureCard key={feature.title} index={index} {...feature} />)}
          </div>
        </section>

        <section id="how-it-works" className="mt-28 scroll-mt-28">
          <SectionHeading eyebrow="How it works" title="Four steps from intent to access" />
          <ol className="relative mt-10 space-y-4 pl-8">
            <span className="absolute left-3 top-4 bottom-4 w-px bg-gradient-to-b from-primary via-secondary to-accent" aria-hidden />
            {steps.map((step, index) => <motion.li
    key={step.title}
    initial={{ opacity: 0, x: -18 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.45, delay: index * 0.1 }}
    className="glass-panel relative rounded-3xl p-5"
  >
                <span className="absolute -left-[1.85rem] top-6 inline-flex size-7 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground ring-4 ring-background">
                  {index + 1}
                </span>
                <div className="flex items-start gap-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                    <step.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </motion.li>)}
          </ol>
        </section>

        <section id="security" className="mt-28 scroll-mt-28">
          <SectionHeading eyebrow="Security" title="Numbers our team is measured on" />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
    { value: <Counter to={99.9} decimals={1} suffix="%" />, label: "Authentication success" },
    { value: <Counter to={2} prefix="<" suffix=" sec" />, label: "Average login" },
    { value: <Counter to={100} suffix="%" />, label: "Passwordless" }
  ].map((stat, index) => <motion.div
    key={stat.label}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="glass-panel rounded-3xl p-7 text-center"
  >
                <p className="text-4xl font-bold text-gradient">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>)}
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto]">
            <SecurityTipsCarousel />
            <div className="glass-panel flex items-center justify-center rounded-3xl p-6">
              <CircularProgress value={96} caption="Posture" />
            </div>
          </div>
        </section>

        <section id="about" className="mt-28 scroll-mt-28">
          <div className="glass-panel gradient-border overflow-hidden rounded-[2.5rem] p-8 sm:p-12">
            <SectionHeading
    eyebrow="About"
    title="Built for teams who refuse to ship passwords"
    description="SecurePass AI is a hackathon-born identity layer: biometrics, federated sign-in and device intelligence behind a single, elegant API. Drop it in front of any product and delete your password reset flow forever."
  />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg">
                  Create free account
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="glass">
                  I already have an account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-glass-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <p>© {(/* @__PURE__ */ new Date()).getFullYear()} SecurePass AI. Passwordless by default.</p>
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-success" /> Tokens rotate every 60 minutes
          </p>
        </div>
      </footer>
    </div>;
}
function SectionHeading({
  eyebrow,
  title,
  description
}) {
  return <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5 }}
    className="max-w-2xl"
  >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>}
    </motion.div>;
}
export {
  Route
};
