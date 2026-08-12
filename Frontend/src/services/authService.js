import { api } from "@/lib/api";

const unwrap = (response) => response.data?.data ?? response.data;

const authService = {
  identify: (email) => api.post("/api/auth/identify", { email }).then(unwrap),
  continueEmail: (input) => api.post("/api/auth/continue", input).then(unwrap),
  register: (input) => api.post("/api/auth/register", input).then(unwrap),
  verifyRegistration: ({ email, code }) =>
    api.post("/api/auth/register/verify", { email, otp: code }).then(unwrap),
  requestLoginOtp: (email) => api.post("/api/auth/login/otp/request", { email }).then(unwrap),
  getGoogleConfig: () => api.get("/api/auth/google/config").then(unwrap),
  verifyLoginOtp: ({ email, code }) =>
    api.post("/api/auth/login/otp/verify", { loginId: email, otp: code }).then(unwrap),
  verifyLoginStepUp: ({ challengeId, code }) =>
    api.post("/api/auth/login/step-up/verify", { challengeId, otp: code }).then(unwrap),
  loginWithGoogle: (input) => api.post("/api/auth/login/google", input).then(unwrap),
  loginWithFace: ({ email, image, images }) =>
    api.post("/api/auth/login/face", { email, faceImage: image, faceImages: images }).then(unwrap),
  loginWithTrustedDevice: ({ email }) =>
    api.post("/api/auth/login/trusted-device", { email }).then(unwrap),
  refreshSession: () => api.post("/api/auth/refresh", {}).then(unwrap),
  logout: ({ allDevices = false, deviceId = null } = {}) =>
    api
      .post("/api/auth/logout", null, {
        params: { allDevices },
        headers: deviceId ? { "X-Device-Id": deviceId } : undefined,
      })
      .then(unwrap),
  logoutAllDevices: () => authService.logout({ allDevices: true }),
  getDevices: () => api.get("/api/devices").then(unwrap),
  trustDevice: (deviceId) => api.post(`/api/devices/${deviceId}/trust`).then(unwrap),
  removeDevice: (deviceId) => api.delete(`/api/devices/${deviceId}`).then(unwrap),
  getProfile: () => api.get("/api/users/me").then(unwrap),
  updateProfile: (payload) => api.put("/api/users/me", payload).then(unwrap),
  enrollFace: (image) => api.post("/api/users/me/face-enroll", { faceImage: image }).then(unwrap),
  loginHistory: () => api.get("/api/users/me/login-history").then(unwrap),
};

export { authService };
