"use client";

import * as React from "react";
import { rolesService } from "@/services/roles.service";
import { useAuth } from "@/hooks/useAuth";

/**
 * Loads the current user's effective permission codes once and exposes can().
 * SUPER_ADMIN gets every permission from the backend, so can() is always true.
 *
 * Usage:
 *   const { can, loading } = usePermissions();
 *   if (can("DEPARTMENT_MANAGE")) { ...show Add button... }
 */
export function usePermissions() {
  const { user } = useAuth();
  const [codes, setCodes] = React.useState<Set<string> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    if (!user) { setCodes(new Set()); setLoading(false); return; }
    setLoading(true);
    rolesService
      .getMyPermissions()
      .then((list) => { if (mounted) setCodes(new Set(list)); })
      .catch(() => { if (mounted) setCodes(new Set()); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const can = React.useCallback(
    (code: string) => codes?.has(code) ?? false,
    [codes]
  );

  const canAny = React.useCallback(
    (...wanted: string[]) => wanted.some((c) => codes?.has(c) ?? false),
    [codes]
  );

  return { can, canAny, loading, permissions: codes };
}
