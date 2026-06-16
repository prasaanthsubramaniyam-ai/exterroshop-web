"use client";

import * as React from "react";
import { Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";

const REQUIREMENTS = [
  "At least 12 characters",
  "One uppercase and one lowercase letter",
  "At least one number",
  "At least one special character (!@#$%...)",
];

export function ForcePasswordChange({ onSuccess }: { onSuccess: () => void }) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword]         = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPw, setShowPw]                   = React.useState(false);
  const [error, setError]                     = React.useState<string | null>(null);
  const [isLoading, setIsLoading]             = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      onSuccess();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Could not change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <ShieldAlert className="size-6" />
          </div>
          <h1 className="text-lg font-semibold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            For security, you must set a new password before continuing.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type={showPw ? "text" : "password"}
              leftIcon={<Lock className="size-4" />}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type={showPw ? "text" : "password"}
              leftIcon={<Lock className="size-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide passwords" : "Show passwords"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type={showPw ? "text" : "password"}
              leftIcon={<Lock className="size-4" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <ul className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="flex items-center gap-1.5 py-0.5">
                <span className="size-1 rounded-full bg-muted-foreground/50" />
                {r}
              </li>
            ))}
          </ul>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
