import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui-kit/Button";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

const GOOGLE_STATE_KEY = "techrush.auth.google-state";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

const Route = createFileRoute("/login/google")({
  head: () => ({
    meta: [
      { title: "Google login \u2014 SecurePass AI" },
      { name: "description", content: "Sign in to SecurePass AI with federated Google OAuth." },
      { property: "og:title", content: "Google login \u2014 SecurePass AI" },
      { property: "og:description", content: "One tap federated sign-in." }
    ]
  }),
  component: GoogleLoginPage
});

function getGoogleRedirectUri() {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/login/google`;
}

function createOauthState() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isUsableGoogleClientId(clientId) {
  return Boolean(clientId && !clientId.startsWith("your-google-client-id"));
}

function GoogleLoginPage() {
  const { loginWithGoogle, isBusy } = useAuth();
  const [googleConfig, setGoogleConfig] = useState(null);

  useEffect(() => {
    let active = true;
    void authService.getGoogleConfig().then((config) => {
      if (active) setGoogleConfig(config);
    }).catch(() => {
      if (active) setGoogleConfig(null);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");

    if (!code) {
      return;
    }

    window.history.replaceState({}, "", window.location.pathname);

    const expectedState = window.sessionStorage.getItem(GOOGLE_STATE_KEY);
    window.sessionStorage.removeItem(GOOGLE_STATE_KEY);

    if (!expectedState || expectedState !== returnedState) {
      toast.error("Google sign-in state could not be verified");
      return;
    }

    void loginWithGoogle({
      authorizationCode: code,
      redirectUri: getGoogleRedirectUri(),
    }).catch(() => void 0);
  }, [loginWithGoogle]);

  const startGoogleLogin = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!isUsableGoogleClientId(googleConfig?.clientId)) {
      toast.error("Google login is not configured for this frontend");
      return;
    }

    const state = createOauthState();
    window.sessionStorage.setItem(GOOGLE_STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: googleConfig.redirectUri || getGoogleRedirectUri(),
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });

    window.location.assign(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  };

  return <AuthLayout title="Continue with Google" description="Use the identity provider you already trust.">
      <div className="flex flex-col items-center gap-8">
        <motion.div
    animate={{ rotate: isBusy ? 360 : 0 }}
    transition={{ duration: 1.2, repeat: isBusy ? Infinity : 0, ease: "linear" }}
    className="relative inline-flex size-28 items-center justify-center rounded-full border border-glass-border bg-card/60"
  >
          <span className="absolute inset-0 rounded-full bg-gradient-brand opacity-20 blur-xl" />
          <svg viewBox="0 0 48 48" className="relative size-12" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6c1.9-5.6 7.2-9.7 13.6-9.7z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8.4h12.7c-.3 2.1-1.6 5.2-4.7 7.3l7.6 5.9c4.5-4.2 6.9-10.3 6.9-17.5z" />
            <path fill="#FBBC05" d="M10.4 28.8A14.6 14.6 0 0 1 9.6 24c0-1.7.3-3.3.8-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6z" />
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.6-5.9l-7.6-5.9c-2 1.4-4.7 2.4-8 2.4-6.4 0-11.7-4.1-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z" />
          </svg>
        </motion.div>
        <Button fullWidth size="lg" loading={isBusy} onClick={startGoogleLogin}>
          <ShieldCheck className="size-4" />
          Sign in with Google
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          We only read your name, email and avatar. A short-lived JWT is issued after consent.
        </p>
      </div>
    </AuthLayout>;
}
export {
  Route
};
