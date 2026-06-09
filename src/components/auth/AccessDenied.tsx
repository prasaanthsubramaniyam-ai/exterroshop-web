"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ROLE_LABELS, ROLE_BADGE_CLASS } from "@/constants/navigation";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  /** Roles that ARE allowed on this page */
  requiredRoles: UserRole[];
}

export function AccessDenied({ requiredRoles }: Props) {
  const user = useSelector((s: RootState) => s.auth.user);
  const userRole = user?.role as UserRole | undefined;
  const userLabel = userRole ? (ROLE_LABELS[userRole] ?? userRole) : "Unknown";
  const userBadge = userRole ? (ROLE_BADGE_CLASS[userRole] ?? "") : "bg-muted text-muted-foreground";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-destructive/10">
        <ShieldOff className="size-10 text-destructive" />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        You don&apos;t have permission to view this page. Contact your administrator
        if you believe this is a mistake.
      </p>

      {/* Current role info */}
      <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Role</p>
        <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", userBadge)}>
          {userLabel}
        </span>
      </div>

      {/* Required roles */}
      <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Allowed Role{requiredRoles.length > 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {requiredRoles.map((r) => (
            <span
              key={r}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                ROLE_BADGE_CLASS[r] ?? "bg-muted text-muted-foreground",
              )}
            >
              {ROLE_LABELS[r] ?? r}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" /> Go Back
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Home className="size-4" /> Dashboard
        </Link>
      </div>
    </div>
  );
}
