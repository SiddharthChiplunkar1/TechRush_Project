import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Mail, UserRound } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-kit/Button";
import { Input } from "@/components/ui-kit/Input";
import { useAuth } from "@/context/AuthContext";
const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your SecurePass AI account" },
      { name: "description", content: "Register once and sign in forever without a password." },
      { property: "og:title", content: "Create your SecurePass AI account" },
      { property: "og:description", content: "Register once, then use Face ID, OTP, Google or trusted devices." }
    ]
  }),
  component: RegisterPage
});
function RegisterPage() {
  const { register: createAccount, isBusy } = useAuth();
  const { register, handleSubmit, formState } = useForm({ defaultValues: { name: "", email: "" } });
  return <AuthLayout
    title="Create your account"
    description="No password to choose. You will pick an authentication method next."
    backTo="/"
    backLabel="Back to home"
  >
      <form
    className="space-y-5"
    onSubmit={handleSubmit((values) => void createAccount(values).catch(() => void 0))}
  >
        <Input
    label="First name"
    placeholder="Alex "
    icon={<UserRound className="size-4" />}
    {...formState.errors.name?.message ? { error: formState.errors.name.message } : {}}
    {...register("name", { required: "Name is required", minLength: { value: 2, message: "Too short" } })}
  />
  <Input
    label="Last name"
    placeholder="Morgan"
    icon={<UserRound className="size-4" />}
    {...formState.errors.name?.message ? { error: formState.errors.name.message } : {}}
    {...register("name", { required: "Name is required", minLength: { value: 2, message: "Too short" } })}
  />
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
        <Button type="submit" fullWidth size="lg" loading={isBusy}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>;
}
export {
  Route
};
