import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { bootstrapAuthSession } from "@/lib/authSession";
import { tokenStorage } from "@/lib/tokenStorage";
const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = await bootstrapAuthSession();
    const token = tokenStorage.get();
    if (!token || tokenStorage.isExpired()) {
      tokenStorage.clear();
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  component: () => <Outlet />
});
export {
  Route
};
