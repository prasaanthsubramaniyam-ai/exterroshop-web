"use client";

import * as React from "react";
import {
  Receipt, Plus, Loader2, CheckCircle2, XCircle,
  Clock, CreditCard, X, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { formatTimeAgo } from "@/utils/format";
import {
  financeService,
  type ExpenseClaim,
  type ExpenseStatus,
  type ExpenseCategory,
  type SubmitExpensePayload,
} from "@/services/finance.service";
import type { UserRole } from "@/types";

const APPROVER_ROLES: UserRole[] = ["FINANCE", "SUPER_ADMIN", "MANAGER", "HR"];

const STATUS_META: Record<ExpenseStatus, { label: string; icon: React.ElementType; cls: string }> = {
  DRAFT:     { label: "Draft",     icon: Clock,         cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"         },
  SUBMITTED: { label: "Submitted", icon: Clock,         cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"   },
  APPROVED:  { label: "Approved",  icon: CheckCircle2,  cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"       },
  REJECTED:  { label: "Rejected",  icon: XCircle,       cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"       },
  PAID:      { label: "Paid",      icon: CreditCard,    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
};

const CATEGORIES: ExpenseCategory[] = ["TRAVEL","MEALS","ACCOMMODATION","EQUIPMENT","TRAINING","OTHER"];
const CAT_LABEL: Record<ExpenseCategory, string> = {
  TRAVEL: "Travel", MEALS: "Meals", ACCOMMODATION: "Accommodation",
  EQUIPMENT: "Equipment", TRAINING: "Training", OTHER: "Other",
};

const STATUS_FILTERS: (ExpenseStatus | "ALL")[] = ["ALL","SUBMITTED","APPROVED","REJECTED","PAID"];

// ── Submit modal ──────────────────────────────────────────────────────────────

function SubmitModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: (c: ExpenseClaim) => void }) {
  const dispatch = useAppDispatch();
  const [form, setForm] = React.useState<SubmitExpensePayload>({
    title: "", category: "TRAVEL", amount: 0, date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = React.useState(false);

  const set = (k: keyof SubmitExpensePayload, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim() || form.amount <= 0) return;
    setSaving(true);
    try {
      const claim = await financeService.submitExpense(form);
      onSubmitted(claim);
      dispatch(pushToast({ title: "Expense submitted for approval" }));
      onClose();
    } catch (err) {
      dispatch(pushToast({ title: "Submission failed", description: (err as Error).message, variant: "destructive" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Submit expense claim</h2>
          <button onClick={onClose}><X className="size-5 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Title *"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value as ExpenseCategory)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Amount (₹) *</label>
              <input type="number" min={0.01} step={0.01} value={form.amount || ""}
                onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Expense date *</label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
          </div>

          <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
            placeholder="Description / purpose" rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={saving || !form.title.trim() || form.amount <= 0}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Expense row ───────────────────────────────────────────────────────────────

function ExpenseRow({
  claim, canApprove, onApprove, onReject,
}: {
  claim: ExpenseClaim;
  canApprove: boolean;
  onApprove: (id: number) => void;
  onReject:  (id: number) => void;
}) {
  const meta = STATUS_META[claim.status];
  const Icon = meta.icon;

  return (
    <div className="flex flex-wrap items-start gap-4 border-t border-border/60 px-5 py-4 first:border-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Receipt className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{claim.title}</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {CAT_LABEL[claim.category]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {claim.employeeName} · {formatTimeAgo(claim.submittedAt)}
          {claim.approverNote && <> · <span className="italic">{claim.approverNote}</span></>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold tabular-nums">
          ₹{claim.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
        <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold", meta.cls)}>
          <Icon className="size-3" />{meta.label}
        </span>
        {canApprove && claim.status === "SUBMITTED" && (
          <>
            <button onClick={() => onApprove(claim.id)}
              className="rounded-lg px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
              Approve
            </button>
            <button onClick={() => onReject(claim.id)}
              className="rounded-lg px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300">
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ExpensesView() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const canApprove = APPROVER_ROLES.includes(user?.role as UserRole);

  const [claims,    setClaims]    = React.useState<ExpenseClaim[] | null>(null);
  const [filter,    setFilter]    = React.useState<ExpenseStatus | "ALL">("ALL");
  const [showModal, setShowModal] = React.useState(false);

  const load = React.useCallback(() => {
    financeService.listExpenses().then(setClaims).catch(() => setClaims([]));
  }, []);
  React.useEffect(load, [load]);

  const handleApprove = async (id: number) => {
    try {
      const updated = await financeService.approveExpense(id);
      setClaims((prev) => prev?.map((c) => c.id === id ? updated : c) ?? null);
      dispatch(pushToast({ title: "Expense approved" }));
    } catch (err) {
      dispatch(pushToast({ title: "Failed", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const handleReject = async (id: number) => {
    const note = prompt("Reason for rejection:");
    if (note === null) return;
    try {
      const updated = await financeService.rejectExpense(id, note || "Rejected");
      setClaims((prev) => prev?.map((c) => c.id === id ? updated : c) ?? null);
      dispatch(pushToast({ title: "Expense rejected" }));
    } catch (err) {
      dispatch(pushToast({ title: "Failed", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const visible = (claims ?? []).filter((c) => filter === "ALL" || c.status === filter);

  // Summary stats
  const total     = (claims ?? []).reduce((s, c) => s + c.amount, 0);
  const pending   = (claims ?? []).filter((c) => c.status === "SUBMITTED").length;
  const approved  = (claims ?? []).filter((c) => c.status === "APPROVED").length;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <Receipt className="size-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Expense Reports</h1>
            <p className="text-sm text-muted-foreground">Submit and track expense claims</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4" /> New claim
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total claimed",  value: `₹${total.toLocaleString("en-IN")}`, tint: "bg-blue-500"    },
          { label: "Pending review", value: pending,                               tint: "bg-amber-500"   },
          { label: "Approved",       value: approved,                              tint: "bg-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <div className={cn("mb-2 h-1.5 w-8 rounded-full", s.tint)} />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
            )}>
            {f === "ALL" ? "All" : STATUS_META[f].label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {claims === null ? (
          <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : visible.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <Receipt className="mx-auto mb-2 size-8 text-muted-foreground/30" />
            {filter === "ALL" ? "No expense claims yet." : `No ${STATUS_META[filter as ExpenseStatus]?.label.toLowerCase()} claims.`}
          </div>
        ) : (
          visible.map((c) => (
            <ExpenseRow key={c.id} claim={c} canApprove={canApprove}
              onApprove={handleApprove} onReject={handleReject} />
          ))
        )}
      </div>

      {showModal && (
        <SubmitModal
          onClose={() => setShowModal(false)}
          onSubmitted={(c) => setClaims((prev) => [c, ...(prev ?? [])])}
        />
      )}
    </div>
  );
}
