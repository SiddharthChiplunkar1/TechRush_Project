import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { tokenStorage } from "@/lib/tokenStorage";
const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    const token = tokenStorage.get();
    if (!token || tokenStorage.isExpired()) {
      tokenStorage.clear();
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />
});
export {
  Route
};
