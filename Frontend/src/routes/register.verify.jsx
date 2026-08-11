import { useEffect, useState } from "react";

import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Mail, ShieldCheck } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-kit/Button";
import { OtpInput } from "@/components/ui-kit/OtpInput";
import { useAuth } from "@/context/AuthContext";
import { bootstrapAuthSession, getPendingAuthFlow, setPendingFlow } from "@/lib/authSession";
import { tokenStorage } from "@/lib/tokenStorage";

const Route = createFileRoute("/register/verify")({
  beforeLoad: async () => {
    await bootstrapAuthSession();
    if (tokenStorage.get() && !tokenStorage.isExpired()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Verify registration — SecurePass AI" },
      { name: "description", content: "Enter the OTP sent after registration to complete account creation." },
      { property: "og:title", content: "Verify registration — SecurePass AI" },
      { property: "og:description", content: "Complete your account setup with a one-time code." },
    ],
  }),
  component: RegistrationOtpPage,
});

function RegistrationOtpPage() {
  const router = useRouter();
  const { pendingFlow, register: createAccount, verifyRegistration, isBusy } = useAuth();
  const storedFlow = getPendingAuthFlow();
  const initialFlow =
    pendingFlow?.type === "registration"
      ? pendingFlow
      : storedFlow?.type === "registration"
        ? storedFlow
        : null;
  const [email, setEmail] = useState(initialFlow?.email ?? "");
  const [firstName, setFirstName] = useState(initialFlow?.firstName ?? "");
  const [lastName, setLastName] = useState(initialFlow?.lastName ?? "");
  const [code, setCode] = useState("");

  useEffect(() => {
    const registrationFlow =
      pendingFlow?.type === "registration" && pendingFlow.email
        ? pendingFlow
        : getPendingAuthFlow();

    if (registrationFlow?.type !== "registration" || !registrationFlow.email) {
      if (!email) {
        void router.navigate({ to: "/register", replace: true });
      }
      return;
    }

    setEmail(registrationFlow.email);
    setFirstName(registrationFlow.firstName ?? "");
    setLastName(registrationFlow.lastName ?? "");
  }, [email, pendingFlow, router]);

  return (
    <AuthLayout
      title="Verify your registration"
      description={`Enter the six digit code sent to ${email || "your email"} to finish creating your account.`}
      backTo="/register"
      backLabel="Back to registration"
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-glass-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Account setup in progress</p>
          <p className="mt-1">We already sent the verification code. Check your inbox and finish the sign-up.</p>
        </div>

        <OtpInput
          value={code}
          onChange={setCode}
          disabled={isBusy}
          onComplete={async (value) => {
            if (value.length !== 6) {
              return;
            }

            try {
              await verifyRegistration({ email, code: value });
            } catch {
              setCode("");
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
                await verifyRegistration({ email, code });
              } catch {
                setCode("");
              }
            }}
          >
            <ShieldCheck className="size-4" />
            Verify account
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="glass"
            disabled={isBusy}
            onClick={async () => {
              await createAccount({ email, firstName, lastName });
              setPendingFlow({
                type: "registration",
                email,
                firstName,
                lastName,
              });
              setCode("");
            }}
          >
            <Mail className="size-4" />
            Resend code
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

export {
  Route,
};
