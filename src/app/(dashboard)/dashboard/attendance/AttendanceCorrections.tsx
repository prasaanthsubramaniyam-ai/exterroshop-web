"use client";

import * as React from "react";
import { Wrench, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  attendanceService,
  type AttendanceRecord,
  type AttendanceCorrection,
} from "@/services/attendance.service";
import { ApprovalChain } from "@/components/ems/ApprovalChain";

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  APPROVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Lets an employee raise an attendance-correction request and track its approval chain. */
export function AttendanceCorrections({ records }: { records: AttendanceRecord[] }) {
  const [corrections, setCorrections] = React.useState<AttendanceCorrection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({ recordId: "", requestedIn: "", requestedOut: "", reason: "" });

  const load = React.useCallback(() => {
    setLoading(true);
    attendanceService.getMyCorrections()
      .then(setCorrections).catch(() => {}).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recordId) return;
    setBusy(true);
    try {
      await attendanceService.requestCorrection({
        recordId: Number(form.recordId),
        requestedIn: form.requestedIn || undefined,
        requestedOut: form.requestedOut || undefined,
        reason: form.reason || undefined,
      });
      setForm({ recordId: "", requestedIn: "", requestedOut: "", reason: "" });
      setOpen(false);
      load();
    } catch (err) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to submit correction");
    } finally { setBusy(false); }
  };

  const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Attendance Corrections</h2>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          {open ? "Close" : "Request Correction"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-4 rounded-2xl border border-border bg-background p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Attendance day *</label>
            <select className={INPUT} value={form.recordId} onChange={(e) => setForm((f) => ({ ...f, recordId: e.target.value }))} required>
              <option value="">— Select a day —</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>{fmtDate(r.workDate)} ({r.status})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Corrected check-in</label>
              <input type="datetime-local" className={INPUT} value={form.requestedIn} onChange={(e) => setForm((f) => ({ ...f, requestedIn: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Corrected check-out</label>
              <input type="datetime-local" className={INPUT} value={form.requestedOut} onChange={(e) => setForm((f) => ({ ...f, requestedOut: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Reason</label>
            <textarea className={cn(INPUT, "resize-y")} rows={2} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Why does this need correcting?" />
          </div>
          <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {busy ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="size-4 animate-spin mr-2" /> Loading…
        </div>
      ) : corrections.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No correction requests yet.</p>
      ) : (
        <div className="space-y-2">
          {corrections.map((c) => (
            <div key={c.id} className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {c.requestedIn ? `In → ${new Date(c.requestedIn).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}
                  {c.requestedOut ? `  Out → ${new Date(c.requestedOut).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}
                </p>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", STATUS_STYLE[c.status])}>
                  {c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                </span>
              </div>
              {c.reason && <p className="mt-0.5 text-xs italic text-muted-foreground">&quot;{c.reason}&quot;</p>}
              {c.approvalChain && c.approvalChain.length > 0 && (
                <div className="mt-2"><ApprovalChain chain={c.approvalChain} currentStep={c.currentStep} /></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
