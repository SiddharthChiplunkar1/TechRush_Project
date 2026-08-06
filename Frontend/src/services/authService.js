import { api, delay, requestWithFallback } from "@/lib/api";
import { getDeviceFingerprint } from "@/lib/fingerprint";
function fakeJwt(payload) {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return [
    encode({ alg: "HS256", typ: "JWT" }),
    encode({ ...payload, iat: Math.floor(Date.now() / 1e3), exp: Math.floor(Date.now() / 1e3) + 3600 }),
    "securepass-demo-signature"
  ].join(".");
}
function levelFor(method) {
  if (method === "face") return "Biometric";
  if (method === "device") return "Basic";
  return "Verified";
}
function scoreFor(method) {
  return { face: 96, otp: 84, google: 88, device: 72 }[method];
}
async function simulateSession(method, email, name) {
  await delay(700);
  const user = {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    name: name ?? (email.split("@")[0] ?? "User").replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    authMethod: method,
    authLevel: levelFor(method),
    securityScore: scoreFor(method),
    faceEnrolled: method === "face",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return { token: fakeJwt({ sub: user.id, email, method }), expiresIn: 3600, user };
}
const authService = {
  register(input) {
    return requestWithFallback(
      () => api.post("/auth/register", input).then((r) => r.data),
      () => simulateSession("otp", input.email, input.name)
    );
  },
  requestOtp(email) {
    return requestWithFallback(
      () => api.post("/auth/otp/request", { email }).then((r) => r.data),
      async () => {
        await delay(600);
        return { sent: true, expiresIn: 60 };
      }
    );
  },
  verifyOtp(input) {
    return requestWithFallback(
      () => api.post("/auth/otp/verify", input).then((r) => r.data),
      async () => {
        if (input.code.length !== 6) throw { message: "Enter all six digits" };
        return simulateSession("otp", input.email);
      }
    );
  },
  loginWithGoogle() {
    return requestWithFallback(
      () => api.post("/auth/google").then((r) => r.data),
      () => simulateSession("google", "alex.morgan@gmail.com", "Alex Morgan")
    );
  },
  loginWithFace(imageDataUrl) {
    return requestWithFallback(
      () => api.post("/auth/face/login", { image: imageDataUrl }).then((r) => r.data),
      () => simulateSession("face", "alex.morgan@securepass.ai", "Alex Morgan")
    );
  },
  async loginWithTrustedDevice() {
    const fp = await getDeviceFingerprint();
    return requestWithFallback(
      () => api.post("/auth/device/login", { fingerprint: fp.visitorId }).then((r) => r.data),
      () => simulateSession("device", "alex.morgan@securepass.ai", "Alex Morgan")
    );
  },
  enrollFace(imageDataUrl) {
    return requestWithFallback(
      () => api.post("/auth/face/enroll", { image: imageDataUrl }).then((r) => r.data),
      async () => {
        await delay(1200);
        return { enrolled: true };
      }
    );
  },
  loginHistory() {
    return requestWithFallback(
      () => api.get("/auth/history").then((r) => r.data),
      async () => {
        await delay(500);
        const now = Date.now();
        const seed = [
          ["face", "MacBook Pro \xB7 Chrome", "Bengaluru, IN", "success", 4],
          ["otp", "iPhone 15 \xB7 Safari", "Bengaluru, IN", "success", 26],
          ["google", "MacBook Pro \xB7 Chrome", "Bengaluru, IN", "success", 51],
          ["device", "iPad Air \xB7 Safari", "Mumbai, IN", "success", 74],
          ["otp", "Unknown \xB7 Firefox", "Frankfurt, DE", "blocked", 96]
        ];
        return seed.map(([method, device, location, status, hoursAgo], index) => ({
          id: `evt_${index}`,
          method,
          device,
          location,
          status,
          at: new Date(now - hoursAgo * 36e5).toISOString()
        }));
      }
    );
  },
  trustedDevices() {
    return requestWithFallback(
      () => api.get("/devices").then((r) => r.data),
      async () => {
        const fp = await getDeviceFingerprint();
        return [
          {
            id: "dev_current",
            label: "This device",
            fingerprint: fp.visitorId,
            platform: fp.platform,
            browser: fp.browser,
            lastSeen: (/* @__PURE__ */ new Date()).toISOString(),
            status: "current"
          },
          {
            id: "dev_1",
            label: "iPhone 15 Pro",
            fingerprint: "a91f0c7d44b2",
            platform: "iOS 18",
            browser: "Safari",
            lastSeen: new Date(Date.now() - 26 * 36e5).toISOString(),
            status: "trusted"
          },
          {
            id: "dev_2",
            label: "Windows Workstation",
            fingerprint: "77bc21ee90aa",
            platform: "Windows 11",
            browser: "Firefox",
            lastSeen: new Date(Date.now() - 96 * 36e5).toISOString(),
            status: "unknown"
          }
        ];
      }
    );
  },
  trustDevice(fingerprint) {
    return requestWithFallback(
      () => api.post("/devices/trust", { fingerprint }).then((r) => r.data),
      async () => {
        await delay(600);
        return { trusted: true };
      }
    );
  },
  removeDevice(id) {
    return requestWithFallback(
      () => api.delete(`/devices/${id}`).then((r) => r.data),
      async () => {
        await delay(500);
        return { removed: true };
      }
    );
  },
  analytics() {
    return requestWithFallback(
      () => api.get("/security/analytics").then((r) => r.data),
      async () => {
        await delay(450);
        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return {
          timeline: labels.map((label, i) => ({
            label,
            logins: 6 + i * 5 % 9,
            blocked: i % 3 === 0 ? 1 : 0
          })),
          methods: [
            { method: "Face ID", value: 46 },
            { method: "Email OTP", value: 27 },
            { method: "Google", value: 19 },
            { method: "Device", value: 8 }
          ]
        };
      }
    );
  },
  logoutAllDevices() {
    return requestWithFallback(
      () => api.post("/auth/logout-all").then((r) => r.data),
      async () => {
        await delay(600);
        return { revoked: 3 };
      }
    );
  }
};
export {
  authService
};
