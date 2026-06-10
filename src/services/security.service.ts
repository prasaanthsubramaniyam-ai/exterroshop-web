import client, { unwrap } from "./api";

export interface TotpSetup {
  secret: string;
  qrCodeImage: string; // data:image/png;base64,...
  recoveryCodes: string[];
  qrCodeUri: string;
}

export interface DeviceSession {
  sessionToken: string;
  deviceName: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  current: boolean;
}

export const securityService = {
  // ── MFA / TOTP ─────────────────────────────────────────────────────────────

  async getMfaStatus(): Promise<boolean> {
    const res = await client.get<{ data: { enabled: boolean } }>("/auth/mfa/status");
    return unwrap<{ enabled: boolean }>(res).enabled;
  },

  async setupMfa(): Promise<TotpSetup> {
    const res = await client.post<{ data: TotpSetup }>("/auth/mfa/setup");
    return unwrap<TotpSetup>(res);
  },

  async verifyMfa(code: string): Promise<void> {
    await client.post("/auth/mfa/verify", { code });
  },

  async disableMfa(code: string): Promise<void> {
    await client.post("/auth/mfa/disable", { code });
  },

  // ── Device sessions ────────────────────────────────────────────────────────

  async getSessions(): Promise<DeviceSession[]> {
    const res = await client.get<{ data: DeviceSession[] }>("/auth/sessions");
    return unwrap<DeviceSession[]>(res);
  },

  async revokeSession(token: string): Promise<void> {
    await client.delete(`/auth/sessions/${token}`);
  },

  async revokeAllSessions(): Promise<void> {
    await client.delete("/auth/sessions");
  },
};
