import { useEffect } from "react";

import { createFileRoute, Outlet, redirect, useRouter, useRouterState } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Mail, UserRound } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-kit/Button";
import { Input } from "@/components/ui-kit/Input";
import { useAuth } from "@/context/AuthContext";
import { bootstrapAuthSession, setPendingFlow } from "@/lib/authSession";
import { tokenStorage } from "@/lib/tokenStorage";

const Route = createFileRoute("/register")({
  beforeLoad: async () => {
    await bootstrapAuthSession();
    if (tokenStorage.get() && !tokenStorage.isExpired()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Create your SecurePass AI account" },
      { name: "description", content: "Register once and sign in forever without a password." },
      { property: "og:title", content: "Create your SecurePass AI account" },
      { property: "og:description", content: "Register once, then verify the OTP to finish setup." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { register: createAccount, isBusy, pendingFlow } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      firstName: pendingFlow?.firstName ?? "",
      lastName: pendingFlow?.lastName ?? "",
      email: pendingFlow?.email ?? "",
    },
  });

  useEffect(() => {
    if (pendingFlow?.type === "registration" && pendingFlow.email) {
      setValue("email", pendingFlow.email);
      setValue("firstName", pendingFlow.firstName ?? "");
      setValue("lastName", pendingFlow.lastName ?? "");
    }
  }, [pendingFlow, setValue]);

  if (pathname === "/register/verify") {
    return <Outlet />;
  }

  return (
    <AuthLayout
      title="Create your account"
      description="We’ll send a verification code to your email after registration."
      backTo="/login"
      backLabel="Back to sign in"
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit(async (values) => {
          const result = await createAccount(values);
          const flow = {
            type: "registration",
            email: (result?.email ?? values.email).trim().toLowerCase(),
            firstName: values.firstName?.trim() ?? "",
            lastName: values.lastName?.trim() ?? "",
          };

          setPendingFlow(flow);
          await router.navigate({ to: "/register/verify" });
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            placeholder="Alex"
            icon={<UserRound className="size-4" />}
            error={errors.firstName?.message}
            {...register("firstName", {
              required: "First name is required",
              minLength: { value: 2, message: "Too short" },
            })}
          />
          <Input
            label="Last name"
            placeholder="Morgan"
            icon={<UserRound className="size-4" />}
            error={errors.lastName?.message}
            {...register("lastName", {
              required: "Last name is required",
              minLength: { value: 2, message: "Too short" },
            })}
          />
        </div>
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          icon={<Mail className="size-4" />}
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Enter a valid email" },
          })}
        />
        <Button type="submit" fullWidth size="lg" loading={isBusy}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

export {
  Route,
};
