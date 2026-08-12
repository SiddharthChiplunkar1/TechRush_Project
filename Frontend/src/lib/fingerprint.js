import FingerprintJS from "@fingerprintjs/fingerprintjs";
let cached = null;
function detectBrowser(ua) {
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "Unknown browser";
}
async function getDeviceFingerprint() {
  if (cached) return cached;
  if (typeof window === "undefined") {
    return {
      visitorId: null,
      platform: "server",
      browser: "server",
      screen: "-",
      timezone: "UTC",
    };
  }
  let visitorId = null;
  try {
    const agent = await FingerprintJS.load();
    const result = await agent.get();
    visitorId = result.visitorId;
  } catch {
    // Do not invent an identity value when the trusted fingerprint cannot be read.
  }
  cached = {
    visitorId,
    platform: navigator.platform || "Unknown",
    browser: detectBrowser(navigator.userAgent),
    screen: `${window.screen.width}\xD7${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  return cached;
}
export { getDeviceFingerprint };
