"use client";

import * as React from "react";
import {
  AlertCircle,
  Copy,
  Laptop,
  Loader2,
  LogOut,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import {
  securityService,
  type TotpSetup,
  type DeviceSession,
} from "@/services/security.service";

// ── MFA card ──────────────────────────────────────────────────────────────────

function MfaCard() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(true);
  const [enabled, setEnabled] = React.useState(false);
  const [setup, setSetup] = React.useState<TotpSetup | null>(null);
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [disabling, setDisabling] = React.useState(false);

  React.useEffect(() => {
    securityService
      .getMfaStatus()
      .then(setEnabled)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const toast = (title: string, description?: string, destructive = false) =>
    dispatch(pushToast({ title, description, variant: destructive ? "destructive" : undefined }));

  const beginSetup = async () => {
    setBusy(true);
    try {
      setSetup(await securityService.setupMfa());
    } catch (e) {
      toast("Could not start MFA setup", (e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await securityService.verifyMfa(code.trim());
      setEnabled(true);
      setSetup(null);
      setCode("");
      toast("Two-factor authentication enabled", "You'll be asked for a code at sign-in.");
    } catch (e) {
      toast("Invalid code", (e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      await securityService.disableMfa(code.trim());
      setEnabled(false);
      setDisabling(false);
      setCode("");
      toast("Two-factor authentication disabled");
    } catch (e) {
      toast("Invalid code", (e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  const copyRecovery = () => {
    if (setup) {
      navigator.clipboard.writeText(setup.recoveryCodes.join("\n"));
      toast("Recovery codes copied", "Store them somewhere safe — each works once.");
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Two-factor authentication</h2>
            <p className="text-sm text-muted-foreground">
              Require a 6-digit code from Google or Microsoft Authenticator at sign-in.
            </p>
          </div>
        </div>
        {loading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : enabled ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Enabled
          </span>
        ) : (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            Off
          </span>
        )}
      </div>

      {/* Idle states */}
      {!loading && !enabled && !setup && (
        <Button className="mt-5" onClick={beginSetup} loading={busy}>
          Enable two-factor
        </Button>
      )}
      {!loading && enabled && !disabling && (
        <Button variant="outline" className="mt-5" onClick={() => setDisabling(true)}>
          <ShieldOff className="size-4" /> Disable
        </Button>
      )}

      {/* Enrollment flow */}
      {setup && (
        <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setup.qrCodeImage}
            alt="TOTP QR code"
            className="size-44 rounded-xl border border-border bg-white p-2"
          />
          <div className="space-y-4">
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Open Google / Microsoft Authenticator</li>
              <li>Scan the QR code (or enter the key manually)</li>
              <li>Type the 6-digit code below to confirm</li>
            </ol>
            <p className="break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs">
              {setup.secret}
            </p>

            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                  <AlertCircle className="size-3.5" /> Recovery codes — shown only once
                </p>
                <button
                  type="button"
                  onClick={copyRecovery}
                  className="flex items-center gap-1 text-xs font-medium text-amber-800 hover:underline dark:text-amber-200"
                >
                  <Copy className="size-3" /> Copy all
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1 font-mono text-sm text-amber-900 dark:text-amber-100">
                {setup.recoveryCodes.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="max-w-[160px]"
              />
              <Button onClick={confirm} loading={busy} disabled={code.length !== 6}>
                Verify & enable
              </Button>
              <Button variant="ghost" onClick={() => { setSetup(null); setCode(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Disable flow */}
      {disabling && (
        <div className="mt-5 flex items-end gap-2">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Enter a current code to confirm
            </p>
            <Input
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="max-w-[160px]"
            />
          </div>
          <Button variant="destructive" onClick={disable} loading={busy} disabled={code.length < 4}>
            Disable MFA
          </Button>
          <Button variant="ghost" onClick={() => { setDisabling(false); setCode(""); }}>
            Cancel
          </Button>
        </div>
      )}
    </section>
  );
}

// ── Devices card ──────────────────────────────────────────────────────────────

function DevicesCard() {
  const dispatch = useAppDispatch();
  const [sessions, setSessions] = React.useState<DeviceSession[] | null>(null);
  const [revoking, setRevoking] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    securityService
      .getSessions()
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  React.useEffect(load, [load]);

  const revoke = async (token: string) => {
    setRevoking(token);
    try {
      await securityService.revokeSession(token);
      load();
    } finally {
      setRevoking(null);
    }
  };

  const revokeAll = async () => {
    if (!confirm("Log out from all devices? You'll need to sign in again everywhere.")) return;
    await securityService.revokeAllSessions();
    dispatch(pushToast({ title: "Logged out from all devices" }));
    load();
  };

  const icon = (name: string | null) =>
    name && /iphone|android|ipad/i.test(name) ? (
      <Smartphone className="size-4" />
    ) : (
      <Laptop className="size-4" />
    );

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Active devices</h2>
          <p className="text-sm text-muted-foreground">
            Sessions signed into your account. Revoke anything you don't recognise.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={revokeAll}>
          <LogOut className="size-4" /> Logout all
        </Button>
      </div>

      <div className="mt-4 divide-y divide-border">
        {sessions === null && (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {sessions?.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No active sessions recorded yet — sessions appear after your next sign-in.
          </p>
        )}
        {sessions?.map((s) => (
          <div key={s.sessionToken} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {icon(s.deviceName)}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {s.deviceName ?? "Unknown device"}
                  {s.current && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      This device
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.ipAddress ?? "—"} · last active{" "}
                  {new Date(s.lastActivityAt).toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => revoke(s.sessionToken)}
              loading={revoking === s.sessionToken}
            >
              Revoke
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SecurityView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Security"
        description="Two-factor authentication and signed-in devices."
      />
      <MfaCard />
      <DevicesCard />
    </div>
  );
}
