import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-kit/Button";
import { Input } from "@/components/ui-kit/Input";
import { OtpInput } from "@/components/ui-kit/OtpInput";
import { useAuth } from "@/context/AuthContext";
const Route = createFileRoute("/login/otp")({
  head: () => ({
    meta: [
      { title: "Email OTP login \u2014 SecurePass AI" },
      { name: "description", content: "Request a single-use six digit code and verify your identity in seconds." },
      { property: "og:title", content: "Email OTP login \u2014 SecurePass AI" },
      { property: "og:description", content: "Single-use codes that expire in 60 seconds." }
    ]
  }),
  component: OtpLoginPage
});
function OtpLoginPage() {
  const { requestOtp, verifyOtp, isBusy } = useAuth();
  const [email, setEmail] = useState(null);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, formState } = useForm({ defaultValues: { email: "" } });
  useEffect(() => {
    if (!email || seconds === 0) return;
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1e3);
    return () => window.clearInterval(id);
  }, [email, seconds]);
  const send = async (value) => {
    setSending(true);
    try {
      await requestOtp(value);
      setEmail(value);
      setSeconds(60);
    } finally {
      setSending(false);
    }
  };
  return <AuthLayout
    title={email ? "Enter your code" : "Sign in with email OTP"}
    description={email ? `We sent a six digit code to ${email}.` : "We will email you a single-use six digit code."}
  >
      <AnimatePresence mode="wait">
        {!email ? <motion.form
    key="step-1"
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 16 }}
    className="space-y-5"
    onSubmit={handleSubmit((values) => void send(values.email))}
  >
            <Input
    label="Email address"
    type="email"
    placeholder="you@company.com"
    icon={<Mail className="size-4" />}
    {...formState.errors.email?.message ? { error: formState.errors.email.message } : {}}
    {...register("email", {
      required: "Email is required",
      pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Enter a valid email" }
    })}
  />
            <Button type="submit" fullWidth size="lg" loading={sending}>
              Request OTP
            </Button>
          </motion.form> : <motion.div
    key="step-2"
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -16 }}
    className="space-y-6"
  >
            <OtpInput value={code} onChange={setCode} disabled={isBusy} />
            <Button
    fullWidth
    size="lg"
    loading={isBusy}
    disabled={code.length !== 6}
    onClick={() => void verifyOtp({ email, code }).catch(() => setCode(""))}
  >
              <ShieldCheck className="size-4" />
              Verify and continue
            </Button>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{seconds > 0 ? `Code expires in 00:${String(seconds).padStart(2, "0")}` : "Code expired"}</span>
              <button
    type="button"
    disabled={seconds > 0 || sending}
    onClick={() => void send(email)}
    className="font-semibold text-primary transition-opacity hover:underline disabled:opacity-40"
  >
                Resend OTP
              </button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </AuthLayout>;
}
export {
  Route
};
