"use client";

import * as React from "react";
import {
  CheckSquare, Loader2, Check, X, AlertCircle,
  CalendarOff, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeave } from "@/hooks/useLeave";
import type { LeaveRequest } from "@/services/leave.service";
import { ApprovalChain } from "@/components/ems/ApprovalChain";
import { CorrectionApprovals } from "./CorrectionApprovals";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

const TYPE_COLORS: Record<string, string> = {
  PL:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  SL:  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  CL:  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  ML:  "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  LOP: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

// ── Approval card ─────────────────────────────────────────────────────────────

function ApprovalCard({
  req,
  onApprove,
  onReject,
}: {
  req: LeaveRequest;
  onApprove: (id: number, note?: string) => Promise<void>;
  onReject:  (id: number, note?: string) => Promise<void>;
}) {
  const [note,  setNote]  = React.useState("");
  const [busy,  setBusy]  = React.useState<"approve" | "reject" | null>(null);
  const [open,  setOpen]  = React.useState(false);

  const handle = async (action: "approve" | "reject") => {
    setBusy(action);
    try {
      if (action === "approve") await onApprove(req.id, note || undefined);
      else                       await onReject(req.id, note || undefined);
    } finally {
      setBusy(null);
    }
  };

  const typeColor = TYPE_COLORS[req.leaveTypeCode] ?? "bg-muted text-muted-foreground";

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {req.userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{req.userName}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", typeColor)}>
              {req.leaveTypeCode} · {req.leaveTypeName}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarOff className="size-3" />
              {fmtDate(req.fromDate)} → {fmtDate(req.toDate)}
            </span>
            <span className="font-medium text-foreground">{req.totalDays} day{Number(req.totalDays) !== 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {fmtDateTime(req.createdAt)}
            </span>
          </div>
          {req.reason && (
            <p className="mt-1.5 text-xs italic text-muted-foreground">"{req.reason}"</p>
          )}
          {req.approvalChain && req.approvalChain.length > 0 && (
            <div className="mt-2">
              <ApprovalChain chain={req.approvalChain} currentStep={req.currentStep} />
            </div>
          )}
        </div>
      </div>

      {/* Note input toggle */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
      >
        {open ? "Hide note" : "Add note (optional)"}
      </button>
      {open && (
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a reviewer note…"
          className="mt-2 w-full resize-none rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => handle("approve")}
          disabled={busy !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy === "approve" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Approve
        </button>
        <button
          onClick={() => handle("reject")}
          disabled={busy !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 disabled:opacity-60"
        >
          {busy === "reject" ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
          Reject
        </button>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ApprovalsView() {
  const { approvals, loading, error, fetchApprovals, approve, reject } = useLeave();

  React.useEffect(() => {
    fetchApprovals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id: number, note?: string) => {
    await approve(id, note);
  };
  const handleReject = async (id: number, note?: string) => {
    await reject(id, note);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
          <CheckSquare className="size-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Pending Approvals</h1>
          <p className="text-sm text-muted-foreground">Leave requests awaiting your action</p>
        </div>
        {approvals.length > 0 && (
          <span className="ml-auto flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {approvals.length}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Content */}
      {loading && approvals.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950">
            <CheckSquare className="size-7 text-emerald-600" />
          </div>
          <p className="text-base font-semibold">All caught up!</p>
          <p className="text-sm text-muted-foreground">No pending leave requests to review.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {approvals.map((req) => (
            <ApprovalCard
              key={req.id}
              req={req}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Attendance corrections queue (renders only when there are items) */}
      <CorrectionApprovals />
    </div>
  );
}
