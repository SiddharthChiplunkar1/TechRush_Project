import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { authService } from "@/services/authService";
import { bootstrapAuthSession, endSession, establishSession, getCurrentDeviceId, setPendingFlow } from "@/lib/authSession";
import { getPendingAuthFlow, normalizeUser } from "@/lib/authFlow";

const INITIAL_STATE = {
  status: "INITIALIZING",
  user: null,
  token: null,
  expiresAt: null,
  pendingFlow: null,
  currentDeviceId: null,
  error: null,
  isBusy: false,
};

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const router = useRouter();
  const [state, setState] = useState({
    ...INITIAL_STATE,
    pendingFlow: getPendingAuthFlow(),
  });

  useEffect(() => {
    let active = true;

    void bootstrapAuthSession()
      .then((snapshot) => {
        if (!active) {
          return;
        }

        setState((current) => ({
          ...current,
          status: snapshot.status,
          user: snapshot.user ? normalizeUser(snapshot.user, snapshot.user.authMethod ?? "otp") : null,
          token: snapshot.token,
          expiresAt: snapshot.expiresAt,
          currentDeviceId: snapshot.currentDeviceId ?? getCurrentDeviceId(),
          pendingFlow: getPendingAuthFlow(),
          error: null,
        }));
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setState((current) => ({
          ...current,
          status: "AUTH_ERROR",
          user: null,
          token: null,
          expiresAt: null,
          currentDeviceId: null,
          pendingFlow: getPendingAuthFlow(),
          error: error?.message ?? "Unable to restore session",
        }));
      });

    return () => {
      active = false;
    };
  }, []);

  const commitSession = useCallback(async (session, authMethod = "otp") => {
    const enrichedSession = {
      ...session,
      user: normalizeUser(session.user, authMethod),
    };
    const snapshot = await establishSession(enrichedSession);

    setState((current) => ({
      ...current,
      status: snapshot.status,
      user: snapshot.user,
      token: snapshot.token,
      expiresAt: snapshot.expiresAt,
      pendingFlow: getPendingAuthFlow(),
      currentDeviceId: snapshot.currentDeviceId ?? getCurrentDeviceId(),
      error: null,
    }));

    return enrichedSession.user;
  }, []);

  const finishAuthentication = useCallback(
    async (session, authMethod = "otp") => {
      await commitSession(session, authMethod);
      await router.navigate({ to: "/dashboard" });
      return session;
    },
    [commitSession, router],
  );

  const markPendingFlow = useCallback((flow) => {
    setPendingFlow(flow);
    setState((current) => ({
      ...current,
      pendingFlow: flow,
      status: flow?.type === "step-up" ? "STEP_UP_REQUIRED" : "OTP_REQUIRED",
      error: null,
    }));
    return flow;
  }, []);

  const run = useCallback(
    async (task, successMessage, options = {}) => {
      setState((current) => ({ ...current, isBusy: true, error: null }));

      try {
        const result = await task();
        if (result?.authenticationState === "STEP_UP_REQUIRED") {
          markPendingFlow({
            type: "step-up",
            email: options.email ?? result?.user?.email ?? null,
            challengeId: result.authenticationChallenge,
          });
          toast.info("Additional verification is required");
          return result;
        }

        if (result?.accessToken) {
          await finishAuthentication(result, options.authMethod ?? "otp");
          toast.success(successMessage);
          return result;
        }

        throw new Error("Authentication could not be completed. Please try again.");
      } catch (error) {
        const message = error?.message ?? "Authentication failed";
        setState((current) => ({ ...current, error: message }));
        toast.error(message);
        throw error;
      } finally {
        setState((current) => ({ ...current, isBusy: false }));
      }
    },
    [finishAuthentication, markPendingFlow],
  );

  const register = useCallback(
    async (input) => {
      setState((current) => ({ ...current, isBusy: true, error: null }));

      try {
        const result = await authService.register(input);
        markPendingFlow({
          type: "registration",
          email: (result?.email ?? input.email).trim().toLowerCase(),
          firstName: input.firstName?.trim() ?? "",
          lastName: input.lastName?.trim() ?? "",
        });
        toast.success("Verification code sent");
        return result;
      } catch (error) {
        const message = error?.message ?? "Unable to start registration";
        setState((current) => ({ ...current, error: message }));
        toast.error(message);
        throw error;
      } finally {
        setState((current) => ({ ...current, isBusy: false }));
      }
    },
    [markPendingFlow],
  );

  const requestLoginOtp = useCallback(
    async (email) => {
      const normalizedEmail = email.trim().toLowerCase();
      setState((current) => ({ ...current, isBusy: true, error: null }));

      try {
        await authService.identify(normalizedEmail);
        const result = await authService.requestLoginOtp(normalizedEmail);
        markPendingFlow({ type: "login", email: normalizedEmail });
        toast.success("Verification code sent");
        return result;
      } catch (error) {
        const message =
          error?.status === 404
            ? "No account is registered with that email."
            : error?.message ?? "Unable to send verification code";
        setState((current) => ({ ...current, error: message }));
        toast.error(message);
        throw error;
      } finally {
        setState((current) => ({ ...current, isBusy: false }));
      }
    },
    [markPendingFlow],
  );

  const verifyRegistration = useCallback(
    async ({ email, code }) =>
      run(
        () => authService.verifyRegistration({ email, code }),
        "Account created and verified",
        { authMethod: "otp" },
      ),
    [run],
  );

  const verifyLoginOtp = useCallback(
    async ({ email, code }) =>
      run(
        () => authService.verifyLoginOtp({ email, code }),
        "Identity verified",
        { authMethod: "otp", email },
      ),
    [run],
  );

  const verifyLoginStepUp = useCallback(
    async ({ challengeId, code, email }) =>
      run(
        () => authService.verifyLoginStepUp({ challengeId, code }),
        "Additional verification complete",
        { authMethod: "otp", email },
      ),
    [run],
  );

  const loginWithGoogle = useCallback(
    async (input) =>
      run(
        () => authService.loginWithGoogle(input),
        "Signed in with Google",
        { authMethod: "google" },
      ),
    [run],
  );

  const loginWithFace = useCallback(
    async ({ email, image, images }) =>
      run(
        () => authService.loginWithFace({ email, image, images }),
        "Face matched",
        { authMethod: "face" },
      ),
    [run],
  );

  const loginWithTrustedDevice = useCallback(
    async ({ email }) =>
      run(
        () => authService.loginWithTrustedDevice({ email: email.trim().toLowerCase() }),
        "Trusted device recognised",
        { authMethod: "device", email },
      ),
    [run],
  );

  const markFaceEnrolled = useCallback(() => {
    setState((current) => {
      if (!current.user) {
        return current;
      }

      const user = normalizeUser(
        {
          ...current.user,
          faceEnrolled: true,
        },
        current.user.authMethod ?? "otp",
      );

      return {
        ...current,
        user,
      };
    });
  }, []);

  const logout = useCallback(
    async (options = {}) => {
      await endSession({ allDevices: Boolean(options.allDevices) });
      setState({
        ...INITIAL_STATE,
        status: "UNAUTHENTICATED",
        pendingFlow: null,
      });

      if (!options.silent) {
        toast.success("Signed out securely");
      }

      await router.navigate({ to: "/login", replace: true });
    },
    [router],
  );

  const clearPendingState = useCallback(() => {
    setPendingFlow(null);
    setState((current) => ({
      ...current,
      pendingFlow: null,
      status: current.token && current.user ? "AUTHENTICATED" : "UNAUTHENTICATED",
    }));
  }, []);

  const value = useMemo(
    () => ({
      user: state.user,
      token: state.token,
      expiresAt: state.expiresAt,
      pendingFlow: state.pendingFlow,
      status: state.status,
      isHydrated: state.status !== "INITIALIZING",
      isInitializing: state.status === "INITIALIZING",
      isAuthenticated: state.status === "AUTHENTICATED",
      isBusy: state.isBusy,
      error: state.error,
      identify: (email) => authService.identify(email),
      continueEmail: (input) => authService.continueEmail(input),
      register,
      requestLoginOtp,
      verifyRegistration,
      verifyLoginOtp,
      verifyLoginStepUp,
      loginWithGoogle,
      loginWithFace,
      loginWithTrustedDevice,
      markFaceEnrolled,
      clearPendingState,
      logout,
    }),
    [
      clearPendingState,
      logout,
      register,
      requestLoginOtp,
      state.error,
      state.expiresAt,
      state.isBusy,
      state.pendingFlow,
      state.status,
      state.token,
      state.user,
      verifyLoginOtp,
      verifyLoginStepUp,
      verifyRegistration,
      loginWithFace,
      loginWithGoogle,
      loginWithTrustedDevice,
      markFaceEnrolled,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }

  return context;
}

export {
  AuthProvider,
  useAuth,
};
