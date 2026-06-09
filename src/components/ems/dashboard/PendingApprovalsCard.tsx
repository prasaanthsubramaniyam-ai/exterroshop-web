"use client";

import * as React from "react";
import Link from "next/link";
import { CheckSquare, ArrowRight, CalendarOff, Loader2 } from "lucide-react";
import { useLeave } from "@/hooks/useLeave";

export function PendingApprovalsCard() {
  const { approvals, loading, fetchApprovals } = useLeave();

  React.useEffect(() => {
    fetchApprovals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = approvals.length;
  // Show at most 3 on the dashboard card
  const visible = approvals.slice(0, 3);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
            <CheckSquare className="size-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Pending Approvals</p>
            <p className="text-xs text-muted-foreground">Requires your action</p>
          </div>
        </div>
        {count > 0 && (
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="mt-4 flex-1 space-y-2.5">
        {loading && count === 0 ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : visible.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No pending approvals</p>
        ) : (
          visible.map((req) => (
            <div key={req.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {req.userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{req.userName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {req.leaveTypeCode} · {req.totalDays}d
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-400">
                <CalendarOff className="size-2.5" />
                Leave
              </span>
            </div>
          ))
        )}
      </div>

      <Link
        href="/dashboard/approvals"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        View all <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
