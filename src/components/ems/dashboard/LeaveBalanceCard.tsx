"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarOff, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeave } from "@/hooks/useLeave";

const COLOR_MAP: Record<string, { bar: string; bg: string; code: string }> = {
  PL:  { bar: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950", code: "text-white bg-emerald-500" },
  SL:  { bar: "bg-blue-500",   bg: "bg-blue-50 dark:bg-blue-950",        code: "text-white bg-blue-500"   },
  CL:  { bar: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-950",    code: "text-white bg-violet-500" },
  ML:  { bar: "bg-pink-500",   bg: "bg-pink-50 dark:bg-pink-950",        code: "text-white bg-pink-500"   },
  LOP: { bar: "bg-red-500",    bg: "bg-red-50 dark:bg-red-950",          code: "text-white bg-red-500"    },
};
const DEFAULT_COLOR = { bar: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-950", code: "text-white bg-amber-500" };

export function LeaveBalanceCard() {
  const { balances, loading } = useLeave();

  // Show only PL / SL / CL on the dashboard card (primary leaves)
  const primary = balances.filter((b) => ["PL", "SL", "CL"].includes(b.leaveTypeCode));
  const fy = primary[0]?.fiscalYear ?? "";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
            <CalendarOff className="size-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Leave Balance</p>
            <p className="text-xs text-muted-foreground">FY {fy || "—"}</p>
          </div>
        </div>
        <Link href="/dashboard/leave" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Content */}
      <div className="mt-5 flex-1 space-y-3.5">
        {loading && primary.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : primary.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">No balances found</p>
        ) : (
          primary.map((lt) => {
            const c   = COLOR_MAP[lt.leaveTypeCode] ?? DEFAULT_COLOR;
            const pct = lt.totalDays > 0 ? Math.round((lt.usedDays / lt.totalDays) * 100) : 0;
            return (
              <div key={lt.leaveTypeCode}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("flex size-5 items-center justify-center rounded text-[10px] font-bold", c.code)}>
                      {lt.leaveTypeCode}
                    </span>
                    <span className="text-xs font-medium">{lt.leaveTypeName}</span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    <span className="font-semibold text-foreground">{lt.remainingDays}</span>/{lt.totalDays} left
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-all", c.bar)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Apply CTA */}
      <div className="mt-5">
        <Link href="/dashboard/leave" className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted">
          <CalendarOff className="size-4" />
          Apply Leave
        </Link>
      </div>
    </div>
  );
}
