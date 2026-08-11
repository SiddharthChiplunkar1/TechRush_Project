import { useEffect, useMemo, useState } from "react";

import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Mail, ShieldCheck } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-kit/Button";
import { Input } from "@/components/ui-kit/Input";
import { OtpInput } from "@/components/ui-kit/OtpInput";
import { useAuth } from "@/context/AuthContext";
import { bootstrapAuthSession } from "@/lib/authSession";
import { tokenStorage } from "@/lib/tokenStorage";

const Route = createFileRoute("/login/otp")({
  beforeLoad: async () => {
    await bootstrapAuthSession();
    if (tokenStorage.get() && !tokenStorage.isExpired()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Email OTP login — SecurePass AI" },
      { name: "description", content: "Request a six digit code and verify your identity in seconds." },
      { property: "og:title", content: "Email OTP login — SecurePass AI" },
      { property: "og:description", content: "Single-use codes that expire quickly." },
    ],
  }),
  component: OtpLoginPage,
});

function OtpLoginPage() {
  const router = useRouter();
  const {
    pendingFlow,
    requestLoginOtp,
    verifyLoginOtp,
    isBusy,
    status,
  } = useAuth();
  const [stage, setStage] = useState(
    pendingFlow?.type === "login" && pendingFlow.email ? "verify" : "request",
  );
  const [email, setEmail] = useState(pendingFlow?.email ?? "");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (pendingFlow?.type === "registration") {
      void router.navigate({ to: "/register/verify", replace: true });
    }
  }, [pendingFlow, router]);

  useEffect(() => {
    if (pendingFlow?.type === "step-up" && pendingFlow.challengeId) {
      void router.navigate({ to: "/login/step-up", replace: true });
    }
  }, [pendingFlow, router]);

  useEffect(() => {
    if (pendingFlow?.type === "login" && pendingFlow.email) {
      setEmail(pendingFlow.email);
      setStage("verify");
    }
  }, [pendingFlow]);

  const title = useMemo(
    () => (stage === "verify" ? "Enter your code" : "Continue with email"),
    [stage],
  );

  const description = useMemo(() => {
    if (stage === "verify") {
      return `We sent a single-use code to ${email || "your email"}.`;
    }

    return "We will send a one-time code to your inbox. No password required.";
  }, [email, stage]);

  return (
    <AuthLayout title={title} description={description}>
      {stage === "request" ? (
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            await requestLoginOtp(email);
            setCode("");
            setStage("verify");
          }}
        >
          <Input
            label="Email address"
            type="email"
            placeholder="you@company.com"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isBusy}
            disabled={!email.trim() || status === "INITIALIZING"}
          >
            Request code
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-glass-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Verification email sent</p>
            <p className="mt-1">{email || "Check your inbox for the latest code."}</p>
          </div>

          <OtpInput
            value={code}
            onChange={setCode}
            disabled={isBusy}
            onComplete={async (value) => {
              if (value.length === 6) {
                try {
                  const result = await verifyLoginOtp({ email, code: value });
                  if (result?.authenticationState === "STEP_UP_REQUIRED") {
                    await router.navigate({ to: "/login/step-up", replace: true });
                  }
                } catch {
                  setCode("");
                }
              }
            }}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              fullWidth
              size="lg"
              loading={isBusy}
              disabled={code.length !== 6}
              onClick={async () => {
                try {
                  const result = await verifyLoginOtp({ email, code });
                  if (result?.authenticationState === "STEP_UP_REQUIRED") {
                    await router.navigate({ to: "/login/step-up", replace: true });
                  }
                } catch {
                  setCode("");
                }
              }}
            >
              <ShieldCheck className="size-4" />
              Verify and continue
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="glass"
              disabled={isBusy}
              onClick={async () => {
                await requestLoginOtp(email);
                setCode("");
              }}
            >
              Resend code
            </Button>
          </div>

          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline"
            onClick={() => setStage("request")}
          >
            Use a different email
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

export {
  Route,
};
