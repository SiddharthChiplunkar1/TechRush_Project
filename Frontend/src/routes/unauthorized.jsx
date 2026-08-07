import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { AnimatedBackground } from "@/components/ui-kit/AnimatedBackground";
import { Button } from "@/components/ui-kit/Button";
const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Unauthorized \u2014 SecurePass AI" },
      { name: "description", content: "Your session expired or you lack access to this area." },
      { property: "og:title", content: "Unauthorized \u2014 SecurePass AI" },
      { property: "og:description", content: "Sign in again to continue." },
      { name: "robots", content: "noindex" }
    ]
  }),
  component: UnauthorizedPage
});
function UnauthorizedPage() {
  return <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground variant="subtle" />
      <div className="glass-panel max-w-md rounded-[2rem] p-10 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
          <ShieldAlert className="size-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">401 — Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your token expired or was revoked. Re-authenticate to regain access.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/login">
            <Button>Sign in again</Button>
          </Link>
          <Link to="/">
            <Button variant="glass">Back to home</Button>
          </Link>
        </div>
      </div>
    </div>;
}
export {
  Route
};
