"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { UserRole } from "@/types";
import { AccessDenied } from "./AccessDenied";

interface Props {
  /** The roles that are permitted to see this content */
  roles: UserRole[];
  children: React.ReactNode;
}

/**
 * Client-side role guard.
 *
 * • While auth is loading (page refresh / hydration) → shows a spinner
 * • If the current user's role is NOT in `roles` → shows <AccessDenied>
 * • Otherwise renders children normally
 */
export function RoleGuard({ roles, children }: Props) {
  const user      = useSelector((s: RootState) => s.auth.user);
  const isLoading = useSelector((s: RootState) => s.auth.isLoading);

  // During initial hydration `user` might be null but not yet loading
  // (the auth slice dispatches fetchProfileThunk from the layout).
  // Show spinner for up to ~1.5 s to avoid flash of AccessDenied.
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (user !== null || !isLoading) {
      setReady(true);
    }
  }, [user, isLoading]);

  // Also set ready after a grace-period so we don't spin forever
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!ready || isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const userRole = user?.role as UserRole | undefined;

  if (!userRole || !roles.includes(userRole)) {
    return <AccessDenied requiredRoles={roles} />;
  }

  return <>{children}</>;
}
