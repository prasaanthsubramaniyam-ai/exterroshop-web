"use client";

import * as React from "react";
import { ShieldCheck, Loader2, Save, Lock, Check } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import {
  rolesService, ROLE_LABELS,
  type Permission, type RolePermissions,
} from "@/services/roles.service";
import { cn } from "@/lib/utils";

// Column order for the matrix
const ROLE_ORDER = ["EMPLOYEE_USER", "MANAGER", "HR", "FINANCE", "IT_ADMIN", "STAFF", "SUPER_ADMIN"];

export default function RolesPermissionsPage() {
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [matrix, setMatrix] = React.useState<Record<string, Set<string>>>({});
  const [dirty, setDirty] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [savingRole, setSavingRole] = React.useState<string | null>(null);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [perms, rows] = await Promise.all([
        rolesService.getPermissions(),
        rolesService.getMatrix(),
      ]);
      setPermissions(perms);
      const m: Record<string, Set<string>> = {};
      rows.forEach((r: RolePermissions) => { m[r.role] = new Set(r.permissions); });
      setMatrix(m);
      setDirty(new Set());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const roles = ROLE_ORDER.filter((r) => matrix[r] !== undefined);

  // group permissions by category, preserving order
  const grouped = React.useMemo(() => {
    const g: Record<string, Permission[]> = {};
    permissions.forEach((p) => { (g[p.category] ??= []).push(p); });
    return g;
  }, [permissions]);

  const toggle = (role: string, code: string) => {
    if (role === "SUPER_ADMIN") return; // always-all, locked
    setMatrix((prev) => {
      const next = { ...prev, [role]: new Set(prev[role]) };
      if (next[role].has(code)) next[role].delete(code);
      else next[role].add(code);
      return next;
    });
    setDirty((prev) => new Set(prev).add(role));
  };

  const saveRole = async (role: string) => {
    setSavingRole(role);
    setSavedMsg(null);
    try {
      await rolesService.setRolePermissions(role, [...(matrix[role] ?? [])]);
      setDirty((prev) => { const n = new Set(prev); n.delete(role); return n; });
      setSavedMsg(`${ROLE_LABELS[role] ?? role} permissions saved`);
      setTimeout(() => setSavedMsg(null), 3000);
    } catch {
      alert("Failed to save permissions");
    } finally {
      setSavingRole(null);
    }
  };

  return (
    <RoleGuard roles={["HR", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950">
            <ShieldCheck className="size-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles &amp; Permissions</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configure what each role can do. Super Admin always has full access.
            </p>
          </div>
        </div>

        {savedMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
            <Check className="size-4" /> {savedMsg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Save bar for dirty roles */}
            {dirty.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Unsaved changes:
                </span>
                {[...dirty].map((role) => (
                  <button
                    key={role}
                    onClick={() => saveRole(role)}
                    disabled={savingRole === role}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                  >
                    {savingRole === role ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
                    Save {ROLE_LABELS[role] ?? role}
                  </button>
                ))}
              </div>
            )}

            {/* Matrix */}
            <div className="rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground min-w-[260px]">
                      Permission
                    </th>
                    {roles.map((role) => (
                      <th key={role} className="px-3 py-3 font-medium text-center min-w-[90px]">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs">{ROLE_LABELS[role] ?? role}</span>
                          {role === "SUPER_ADMIN" && <Lock className="size-3 text-muted-foreground" />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(grouped).map(([category, perms]) => (
                    <React.Fragment key={category}>
                      <tr className="bg-muted/30">
                        <td colSpan={roles.length + 1} className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {category}
                        </td>
                      </tr>
                      {perms.map((p) => (
                        <tr key={p.code} className="border-t border-border hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <p className="font-medium">{p.name}</p>
                            {p.description && (
                              <p className="text-xs text-muted-foreground">{p.description}</p>
                            )}
                          </td>
                          {roles.map((role) => {
                            const checked = role === "SUPER_ADMIN" || (matrix[role]?.has(p.code) ?? false);
                            const locked = role === "SUPER_ADMIN";
                            return (
                              <td key={role} className="px-3 py-2.5 text-center">
                                <button
                                  onClick={() => toggle(role, p.code)}
                                  disabled={locked}
                                  className={cn(
                                    "inline-flex size-5 items-center justify-center rounded border transition-colors",
                                    checked
                                      ? "bg-primary border-primary text-white"
                                      : "border-border bg-background hover:border-primary/50",
                                    locked && "opacity-60 cursor-not-allowed"
                                  )}
                                  aria-label={`${role} ${p.code}`}
                                >
                                  {checked && <Check className="size-3.5" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: changes are saved per role. Click a checkbox, then use the “Save …” button that appears above.
            </p>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
