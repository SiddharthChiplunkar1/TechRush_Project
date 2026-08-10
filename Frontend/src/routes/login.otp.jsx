import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
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
  const { identify, continueEmail, verifyEmailAuthentication, verifyLoginStepUp, isBusy } = useAuth();
  const [email, setEmail] = useState(null);
  const [flow, setFlow] = useState(null);
  const [registrationOtpSent, setRegistrationOtpSent] = useState(false);
  const [stepUpChallenge, setStepUpChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, formState, getValues } = useForm({ defaultValues: { email: "", firstName: "", lastName: "" } });
  useEffect(() => {
    if (!email || seconds === 0) return;
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1e3);
    return () => window.clearInterval(id);
  }, [email, seconds]);
  const continueWithEmail = async (value) => {
    setSending(true);
    try {
      await identify(value.email);
      await continueEmail(value);
      setEmail(value.email);
      setFlow("LOGIN");
    } finally { setSending(false); }
  };
  return <AuthLayout
    title={stepUpChallenge ? "Additional verification" : email ? "Enter your code" : "Continue with email"}
    description={stepUpChallenge ? "Enter the separate verification code we sent to complete this sign-in." : email ? `We will send a single-use code to ${email}.` : "We will securely determine the appropriate sign-in or registration step."}
  >
      <AnimatePresence mode="wait">
        {!email ? <motion.form
    key="step-1"
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 16 }}
    className="space-y-5"
    onSubmit={handleSubmit((values) => void continueWithEmail(values))}
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
            <Input label="First name (used if this is a new account)" icon={<UserRound className="size-4" />} {...register("firstName")} />
            <Input label="Last name (used if this is a new account)" icon={<UserRound className="size-4" />} {...register("lastName")} />
            <Button type="submit" fullWidth size="lg" loading={sending}>
              Continue
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
    onClick={() => void (stepUpChallenge
      ? verifyLoginStepUp({ challengeId: stepUpChallenge, code })
      : verifyEmailAuthentication({ email, code })
    ).then((result) => { if (result.authenticationState === "STEP_UP_REQUIRED") { setStepUpChallenge(result.authenticationChallenge); setCode(""); } }).catch(() => setCode(""))}
  >
              <ShieldCheck className="size-4" />
              Verify and continue
            </Button>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{seconds > 0 ? `Code expires in 00:${String(seconds).padStart(2, "0")}` : "Code expired"}</span>
              <button
    type="button"
    disabled={seconds > 0 || sending}
    onClick={() => void continueEmail({ email, firstName: getValues().firstName, lastName: getValues().lastName })}
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
