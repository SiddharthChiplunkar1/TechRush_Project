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
      visitorId: "server",
      platform: "server",
      browser: "server",
      screen: "-",
      timezone: "UTC",
    };
  }
  let visitorId = "unavailable";
  try {
    const agent = await FingerprintJS.load();
    const result = await agent.get();
    visitorId = result.visitorId;
  } catch {
    visitorId = `fallback-${Math.abs(hash(navigator.userAgent)).toString(16)}`;
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
function hash(value) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return h;
}
export { getDeviceFingerprint };
