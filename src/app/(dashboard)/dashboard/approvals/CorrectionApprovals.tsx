"use client";

import * as React from "react";
import { Wrench, Loader2, Check, X } from "lucide-react";
import { attendanceService, type AttendanceCorrection } from "@/services/attendance.service";
import { ApprovalChain } from "@/components/ems/ApprovalChain";

function fmtDT(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true });
}

function initials(name?: string) {
  return (name ?? "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

/** Manager/HR queue for attendance-correction requests at their current step. */
export function CorrectionApprovals() {
  const [items, setItems] = React.useState<AttendanceCorrection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    attendanceService.getCorrectionApprovals().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const act = async (id: number, approve: boolean) => {
    const note = approve ? undefined : (prompt("Reason for rejection (optional):") ?? undefined);
    setBusy(id);
    try {
      if (approve) await attendanceService.approveCorrection(id);
      else await attendanceService.rejectCorrection(id, note);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Action failed");
    } finally { setBusy(null); }
  };

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Wrench className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Attendance Corrections</h2>
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{items.length}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2.5 mb-2">
              {c.userAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.userAvatarUrl} alt={c.userName} className="size-8 rounded-full object-cover" />
              ) : (
                <div className="size-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{initials(c.userName)}</div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{c.userName}</p>
                <p className="text-xs text-muted-foreground">
                  In: {fmtDT(c.requestedIn)} · Out: {fmtDT(c.requestedOut)}
                </p>
              </div>
            </div>
            {c.reason && <p className="text-xs italic text-muted-foreground mb-2">&quot;{c.reason}&quot;</p>}
            {c.approvalChain && <div className="mb-3"><ApprovalChain chain={c.approvalChain} currentStep={c.currentStep} /></div>}
            <div className="flex gap-2">
              <button
                onClick={() => act(c.id, true)}
                disabled={busy === c.id}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-3 py-2 text-sm font-medium disabled:opacity-60"
              >
                {busy === c.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Approve
              </button>
              <button
                onClick={() => act(c.id, false)}
                disabled={busy === c.id}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-3 py-2 text-sm font-medium disabled:opacity-60"
              >
                <X className="size-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
