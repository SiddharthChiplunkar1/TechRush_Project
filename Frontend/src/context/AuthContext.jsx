import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { tokenStorage, userStorage } from "@/lib/tokenStorage";
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  useEffect(() => {
    const stored = tokenStorage.get();
    const storedUser = userStorage.get();
    if (stored && !tokenStorage.isExpired() && storedUser) {
      setToken(stored);
      setExpiresAt(tokenStorage.expiresAt());
      setUser(storedUser);
    } else if (stored) {
      tokenStorage.clear();
    }
    setIsHydrated(true);
  }, []);
  const persist = useCallback(
    (session) => {
      tokenStorage.set(session.token, session.expiresIn);
      userStorage.set(session.user);
      setToken(session.token);
      setExpiresAt(tokenStorage.expiresAt());
      setUser(session.user);
    },
    []
  );
  const run = useCallback(
    async (task, successMessage) => {
      setIsBusy(true);
      try {
        const session = await task();
        persist(session);
        toast.success(successMessage);
        await router.navigate({ to: "/dashboard" });
      } catch (error) {
        const message = error.message ?? "Authentication failed";
        toast.error(message);
        throw error;
      } finally {
        setIsBusy(false);
      }
    },
    [persist, router]
  );
  const logout = useCallback(
    (options) => {
      tokenStorage.clear();
      setToken(null);
      setUser(null);
      setExpiresAt(null);
      if (!options?.silent) toast.success("Signed out securely");
      void router.navigate({ to: "/login", replace: true });
    },
    [router]
  );
  const value = useMemo(
    () => ({
      user,
      token,
      expiresAt,
      isAuthenticated: Boolean(token && user),
      isHydrated,
      isBusy,
      register: (input) => run(() => authService.register(input), `Welcome aboard, ${input.name}`),
      requestOtp: async (email) => {
        await authService.requestOtp(email);
        toast.success(`Code sent to ${email}`);
      },
      verifyOtp: (input) => run(() => authService.verifyOtp(input), "Identity verified"),
      loginWithGoogle: () => run(() => authService.loginWithGoogle(), "Signed in with Google"),
      loginWithFace: (image) => run(() => authService.loginWithFace(image), "Face matched"),
      loginWithTrustedDevice: () => run(() => authService.loginWithTrustedDevice(), "Trusted device recognised"),
      markFaceEnrolled: () => setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, faceEnrolled: true, securityScore: Math.max(prev.securityScore, 96) };
        userStorage.set(next);
        return next;
      }),
      logout
    }),
    [user, token, expiresAt, isHydrated, isBusy, run, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}
export {
  AuthProvider,
  useAuth
};
