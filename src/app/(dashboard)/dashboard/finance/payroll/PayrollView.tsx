"use client";

import * as React from "react";
import { DollarSign, ChevronRight, Loader2, Play, ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import {
  financeService,
  type PayrollCycle,
  type PayrollEntry,
  type PayrollStatus,
} from "@/services/finance.service";
import type { UserRole } from "@/types";

const ADMIN_ROLES: UserRole[] = ["FINANCE", "SUPER_ADMIN", "HR"];

const STATUS_META: Record<PayrollStatus, { label: string; icon: React.ElementType; cls: string }> = {
  DRAFT:      { label: "Draft",      icon: Clock,        cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"         },
  PROCESSING: { label: "Processing", icon: Clock,        cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"   },
  COMPLETED:  { label: "Completed",  icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  FAILED:     { label: "Failed",     icon: XCircle,      cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"       },
};

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

// ── Cycle list ─────────────────────────────────────────────────────────────────

function CycleList({
  cycles, onSelect, isAdmin, onRun,
}: {
  cycles: PayrollCycle[];
  onSelect: (c: PayrollCycle) => void;
  isAdmin: boolean;
  onRun: () => void;
}) {
  const total = cycles.reduce((s, c) => s + (c.status === "COMPLETED" ? c.totalAmount : 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
            <DollarSign className="size-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Payroll</h1>
            <p className="text-sm text-muted-foreground">Monthly payroll cycles and entries</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={onRun}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            <Play className="size-4" /> Run new cycle
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total disbursed",  value: fmt(total) },
          { label: "Cycles run",       value: cycles.filter((c) => c.status === "COMPLETED").length },
          { label: "Pending cycles",   value: cycles.filter((c) => c.status === "DRAFT" || c.status === "PROCESSING").length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xl font-bold truncate">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {cycles.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No payroll cycles yet.</div>
        ) : cycles.map((c) => {
          const meta = STATUS_META[c.status];
          const Icon = meta.icon;
          return (
            <button key={c.id} onClick={() => onSelect(c)}
              className="flex w-full items-center gap-4 border-t border-border/60 px-5 py-4 first:border-0 hover:bg-muted/40 text-left transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{c.period}</p>
                <p className="text-xs text-muted-foreground">{c.headcount} employees · {c.runBy ?? "—"}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold tabular-nums">{fmt(c.totalAmount)}</span>
                <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold", meta.cls)}>
                  <Icon className="size-3" />{meta.label}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Entries view ───────────────────────────────────────────────────────────────

function EntriesView({ cycle, onBack }: { cycle: PayrollCycle; onBack: () => void }) {
  const [entries, setEntries] = React.useState<PayrollEntry[] | null>(null);
  React.useEffect(() => {
    financeService.getCycleEntries(cycle.id).then(setEntries).catch(() => setEntries([]));
  }, [cycle.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
          <ArrowLeft className="size-4" /> Back
        </button>
        <div>
          <h1 className="text-xl font-bold">Payroll — {cycle.period}</h1>
          <p className="text-xs text-muted-foreground">{cycle.headcount} entries · {STATUS_META[cycle.status].label}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {entries === null ? (
          <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Deductions</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-border/60 first:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{e.employeeName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.department ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmt(e.grossPay)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-rose-600">{fmt(e.deductions)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmt(e.netPay)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        e.status === "PAID"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      )}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Run cycle modal ────────────────────────────────────────────────────────────

function RunCycleModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: PayrollCycle) => void }) {
  const dispatch = useAppDispatch();
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [period, setPeriod] = React.useState(defaultPeriod);
  const [notes,  setNotes]  = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const run = async () => {
    if (!period) return;
    setSaving(true);
    try {
      const cycle = await financeService.runCycle(period, notes || undefined);
      onCreated(cycle);
      dispatch(pushToast({ title: `Payroll cycle ${period} started` }));
      onClose();
    } catch (err) {
      dispatch(pushToast({ title: "Failed to run cycle", description: (err as Error).message, variant: "destructive" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4">
        <h2 className="font-semibold">Run payroll cycle</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Period (YYYY-MM)</label>
            <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-06"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          <button onClick={run} disabled={saving || !period}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            Run
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function PayrollView() {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role as UserRole);

  const [cycles,      setCycles]      = React.useState<PayrollCycle[] | null>(null);
  const [selected,    setSelected]    = React.useState<PayrollCycle | null>(null);
  const [showRunModal, setShowRunModal] = React.useState(false);

  React.useEffect(() => {
    financeService.listCycles().then(setCycles).catch(() => setCycles([]));
  }, []);

  if (cycles === null) {
    return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      {selected ? (
        <EntriesView cycle={selected} onBack={() => setSelected(null)} />
      ) : (
        <CycleList
          cycles={cycles}
          onSelect={setSelected}
          isAdmin={isAdmin}
          onRun={() => setShowRunModal(true)}
        />
      )}
      {showRunModal && (
        <RunCycleModal
          onClose={() => setShowRunModal(false)}
          onCreated={(c) => setCycles((prev) => [c, ...(prev ?? [])])}
        />
      )}
    </div>
  );
}
