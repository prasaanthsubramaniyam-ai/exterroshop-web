"use client";

import * as React from "react";
import {
  CalendarOff, Plus, X, Loader2, CheckCircle2,
  XCircle, Clock, AlertCircle, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeave } from "@/hooks/useLeave";
import type { LeaveBalance, LeaveRequest, LeaveType } from "@/services/leave.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_CFG: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  PENDING:   { label: "Pending",   icon: Clock,         cls: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  APPROVED:  { label: "Approved",  icon: CheckCircle2,  cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  REJECTED:  { label: "Rejected",  icon: XCircle,       cls: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
  CANCELLED: { label: "Cancelled", icon: AlertCircle,   cls: "bg-muted text-muted-foreground" },
};

const BALANCE_COLORS: Record<string, string> = {
  PL:  "bg-emerald-500",
  SL:  "bg-blue-500",
  CL:  "bg-violet-500",
  ML:  "bg-pink-500",
  PaL: "bg-cyan-500",
  BL:  "bg-orange-500",
  LOP: "bg-red-500",
};

// ── Balance card ──────────────────────────────────────────────────────────────

function BalanceCard({ bal }: { bal: LeaveBalance }) {
  const pct  = bal.totalDays > 0 ? Math.round((bal.usedDays / bal.totalDays) * 100) : 0;
  const bar  = BALANCE_COLORS[bal.leaveTypeCode] ?? "bg-primary";
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {bal.leaveTypeCode}
          </span>
          <p className="mt-0.5 text-sm font-medium">{bal.leaveTypeName}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold tabular-nums">{bal.remainingDays}</span>
          <span className="text-xs text-muted-foreground"> / {bal.totalDays}</span>
          <p className="text-[10px] text-muted-foreground">remaining</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Apply leave modal ─────────────────────────────────────────────────────────

interface ApplyModalProps {
  types: LeaveType[];
  onClose: () => void;
  onApply: (code: string, from: string, to: string, reason: string) => Promise<void>;
}

function ApplyModal({ types, onClose, onApply }: ApplyModalProps) {
  const [code,   setCode]   = React.useState(types[0]?.code ?? "PL");
  const [from,   setFrom]   = React.useState("");
  const [to,     setTo]     = React.useState("");
  const [reason, setReason] = React.useState("");
  const [busy,   setBusy]   = React.useState(false);
  const [err,    setErr]    = React.useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) { setErr("Please select both dates"); return; }
    if (to < from)    { setErr("End date must be after start date"); return; }
    setBusy(true);
    setErr(null);
    try {
      await onApply(code, from, to, reason);
      onClose();
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Failed to apply");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-background p-6 shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Apply for Leave</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="size-4" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Leave type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Leave Type</label>
            <div className="relative">
              <select
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {types.map((t) => (
                  <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-3 size-4 text-muted-foreground" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">From Date</label>
              <input
                type="date"
                min={today}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">To Date</label>
              <input
                type="date"
                min={from || today}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Reason <span className="text-muted-foreground/60">(optional)</span></label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for leave…"
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {err && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="size-3.5 shrink-0" /> {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <CalendarOff className="size-4" />}
            {busy ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Request row ───────────────────────────────────────────────────────────────

function RequestRow({ req, onCancel }: { req: LeaveRequest; onCancel: (id: number) => void }) {
  const cfg = STATUS_CFG[req.status] ?? STATUS_CFG.PENDING;
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{req.leaveTypeName}</span>
          <span className="text-xs text-muted-foreground">({req.leaveTypeCode})</span>
          <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.cls)}>
            <Icon className="size-3" />
            {cfg.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {fmtDate(req.fromDate)} → {fmtDate(req.toDate)} &nbsp;·&nbsp; {req.totalDays} day{Number(req.totalDays) !== 1 ? "s" : ""}
        </p>
        {req.reason && <p className="mt-0.5 text-xs text-muted-foreground italic">"{req.reason}"</p>}
        {req.reviewerNote && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Note: <span className="text-foreground">{req.reviewerNote}</span>
          </p>
        )}
      </div>
      {req.status === "PENDING" && (
        <button
          onClick={() => onCancel(req.id)}
          title="Cancel request"
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function LeaveView() {
  const { types, balances, requests, loading, apply, cancel } = useLeave();
  const [showModal, setShowModal] = React.useState(false);

  const handleApply = async (code: string, from: string, to: string, reason: string) => {
    await apply({ leaveTypeCode: code, fromDate: from, toDate: to, reason });
  };

  const handleCancel = async (id: number) => {
    if (confirm("Cancel this leave request?")) await cancel(id);
  };

  const fy = balances[0]?.fiscalYear ?? "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
            <CalendarOff className="size-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Leave Management</h1>
            <p className="text-sm text-muted-foreground">FY {fy || "—"}</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
        >
          <Plus className="size-4" />
          Apply Leave
        </button>
      </div>

      {/* Balance grid */}
      {loading && balances.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div>
          <h2 className="mb-3 text-sm font-semibold">Leave Balances</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {balances.map((b) => <BalanceCard key={b.id} bal={b} />)}
          </div>
        </div>
      )}

      {/* Request history */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">My Requests</h2>
        {loading && requests.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
            <CalendarOff className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No leave requests yet</p>
            <p className="text-xs text-muted-foreground">Click "Apply Leave" to submit your first request.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <RequestRow key={r.id} req={r} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>

      {/* Apply modal */}
      {showModal && (
        <ApplyModal
          types={types}
          onClose={() => setShowModal(false)}
          onApply={handleApply}
        />
      )}
    </div>
  );
}
