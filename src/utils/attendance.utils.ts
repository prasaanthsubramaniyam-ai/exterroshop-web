/**
 * Attendance utilities — location capture + device fingerprint.
 * Used by the check-in / check-out flow.
 */

export interface LocationCapture {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  status: "CAPTURED" | "DENIED" | "TIMEOUT" | "UNAVAILABLE";
}

export interface DeviceCapture {
  deviceId: string;
  browser: string;
  os: string;
  platform: string;
  userAgent: string;
  timezone: string;
  screenResolution: string;
}

// ── Device fingerprint ────────────────────────────────────────────────────────

export function getDeviceFingerprint(): DeviceCapture {
  let deviceId: string;
  try {
    deviceId = localStorage.getItem("ems_device_id") ?? "";
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("ems_device_id", deviceId);
    }
  } catch {
    deviceId = crypto.randomUUID();
  }

  const ua = navigator.userAgent;

  // Browser detection
  let browser = "Unknown";
  if (ua.includes("Edg/"))        browser = "Edge";
  else if (ua.includes("Chrome/") && !ua.includes("Chromium/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome/"))   browser = "Safari";
  else if (ua.includes("OPR/") || ua.includes("Opera/"))        browser = "Opera";

  // OS detection
  let os = "Unknown";
  if (/Windows NT/.test(ua))  os = "Windows";
  else if (/Mac OS X/.test(ua))  os = "macOS";
  else if (/Linux/.test(ua))     os = "Linux";
  else if (/Android/.test(ua))   os = "Android";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";

  return {
    deviceId,
    browser,
    os,
    platform: navigator.platform ?? "unknown",
    userAgent: ua,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
}

// ── GPS location ──────────────────────────────────────────────────────────────

export function getCurrentLocation(timeoutMs = 10_000): Promise<LocationCapture> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ status: "UNAVAILABLE" });
      return;
    }

    const timer = setTimeout(() => resolve({ status: "TIMEOUT" }), timeoutMs + 500);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          status: "CAPTURED",
        });
      },
      (err) => {
        clearTimeout(timer);
        if (err.code === err.PERMISSION_DENIED) {
          resolve({ status: "DENIED" });
        } else if (err.code === err.TIMEOUT) {
          resolve({ status: "TIMEOUT" });
        } else {
          resolve({ status: "UNAVAILABLE" });
        }
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}
