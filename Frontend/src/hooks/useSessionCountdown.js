import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/tokenStorage";
function useSessionCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const target = expiresAt ?? tokenStorage.expiresAt();
    if (!target) return;
    const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1e3)));
    tick();
    const id = window.setInterval(tick, 1e3);
    return () => window.clearInterval(id);
  }, [expiresAt]);
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  return { remaining, formatted: `${minutes}:${seconds}` };
}
export {
  useSessionCountdown
};
