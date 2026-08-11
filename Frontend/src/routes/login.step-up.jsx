import { useEffect, useState } from "react";

import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { ShieldAlert, ShieldCheck } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-kit/Button";
import { OtpInput } from "@/components/ui-kit/OtpInput";
import { useAuth } from "@/context/AuthContext";
import { bootstrapAuthSession } from "@/lib/authSession";
import { tokenStorage } from "@/lib/tokenStorage";

const Route = createFileRoute("/login/step-up")({
  beforeLoad: async () => {
    await bootstrapAuthSession();
    if (tokenStorage.get() && !tokenStorage.isExpired()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Step-up verification — SecurePass AI" },
      { name: "description", content: "Complete additional OTP verification to finish sign-in." },
      { property: "og:title", content: "Step-up verification — SecurePass AI" },
      { property: "og:description", content: "High-risk logins require a second code before access is granted." },
    ],
  }),
  component: StepUpPage,
});

function StepUpPage() {
  const router = useRouter();
  const { pendingFlow, verifyLoginStepUp, isBusy } = useAuth();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (pendingFlow?.type !== "step-up" || !pendingFlow.challengeId) {
      void router.navigate({ to: "/login/otp", replace: true });
    }
  }, [pendingFlow, router]);

  const email = pendingFlow?.email ?? "your account";
  const challengeId = pendingFlow?.challengeId ?? null;

  return (
    <AuthLayout
      title="Additional verification required"
      description={`We need one more OTP for ${email}. Finish the step-up challenge to continue.`}
      backTo="/login/otp"
      backLabel="Back to login"
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
          <p className="flex items-center gap-2 font-medium">
            <ShieldAlert className="size-4 text-amber-500" />
            High-risk login detected
          </p>
          <p className="mt-1 text-muted-foreground">
            No session has been created yet. Enter the step-up code to complete sign-in.
          </p>
        </div>

        <OtpInput value={code} onChange={setCode} disabled={isBusy} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            fullWidth
            size="lg"
            loading={isBusy}
            disabled={code.length !== 6 || !challengeId}
            onClick={async () => {
              try {
                await verifyLoginStepUp({ challengeId, code, email });
              } catch {
                setCode("");
              }
            }}
          >
            <ShieldCheck className="size-4" />
            Verify step-up
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="glass"
            onClick={() => void router.navigate({ to: "/login/otp", replace: true })}
          >
            Restart login
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

export {
  Route,
};
