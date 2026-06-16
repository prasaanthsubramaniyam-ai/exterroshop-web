"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { tokenStorage } from "@/utils/storage";
import { ForcePasswordChange } from "@/components/auth/ForcePasswordChange";

/**
 * Client-side auth guard for hydration consistency.
 * Server-side protection is enforced by middleware.ts.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, refreshProfile } = useAuth();
  const [checked, setChecked] = React.useState(false);

  const didFetch = React.useRef(false);

  React.useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    // Always fetch a fresh profile on first mount so that changes made
    // in another session (e.g. avatar update) are visible immediately.
    if (!didFetch.current) {
      didFetch.current = true;
      refreshProfile().catch(() => {
        tokenStorage.clear();
        router.replace("/login");
      });
    }
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (user?.mustChangePassword) {
    return <ForcePasswordChange onSuccess={() => refreshProfile()} />;
  }

  return <>{children}</>;
}
