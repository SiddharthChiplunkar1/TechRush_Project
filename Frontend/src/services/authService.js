import { api } from "@/lib/api";
import { getDeviceFingerprint } from "@/lib/fingerprint";

const data = (response) => response.data?.data ?? response.data;
const authService = {
  register: (input) => api.post("/api/auth/register", input).then(data),
  identify: (email) => api.post("/api/auth/identify", { email }).then(data),
  continueEmail: (input) => api.post("/api/auth/continue", input).then(data),
  verifyEmailAuthentication: ({ email, code }) => api.post("/api/auth/verify", { email, otp: code }).then(data),
  requestOtp: (email) => api.post("/api/auth/login/otp/request", { email }).then(data),
  verifyOtp: ({ email, code }) => api.post("/api/auth/login/otp/verify", { loginId: email, otp: code }).then(data),
  verifyRegistration: ({ email, code }) => api.post("/api/auth/register/verify", { email, otp: code }).then(data),
  verifyLoginStepUp: ({ challengeId, code }) => api.post("/api/auth/login/step-up/verify", { challengeId, otp: code }).then(data),
  loginWithGoogle: (input) => api.post("/api/auth/login/google", input).then(data),
  loginWithFace: (image) => api.post("/api/auth/login/face", { image }).then(data),
  loginWithTrustedDevice: async () => {
    const fp = await getDeviceFingerprint();
    return api.post("/api/auth/login/trusted-device", { fingerprint: fp.visitorId }).then(data);
  },
  enrollFace: (image) => api.post("/api/users/me/face-enroll", { image }).then(data),
  loginHistory: () => api.get("/api/users/me/login-history").then(data),
};
export { authService };
