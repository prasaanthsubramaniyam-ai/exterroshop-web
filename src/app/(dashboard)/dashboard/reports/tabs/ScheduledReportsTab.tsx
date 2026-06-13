"use client";

import * as React from "react";
import {
  Plus, Calendar, Mail, Bell, Trash2, Power,
  Loader2, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  reportsInsightsService,
  type ScheduledReport,
  type CreateScheduledReportRequest,
} from "@/services/reports-insights.service";

const REPORT_TYPES = [
  "employees/master",
  "attendance/daily",
  "attendance/monthly",
  "leave/balance",
  "leave/pending-approvals",
  "teams/summary",
  "engagement/stats",
  "business/marketplace",
];

function FrequencyBadge({ freq }: { freq: string }) {
  const map: Record<string, string> = {
    DAILY:   "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    WEEKLY:  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    MONTHLY: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", map[freq] ?? "bg-muted text-muted-foreground")}>
      {freq}
    </span>
  );
}

function CreateScheduledModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (r: ScheduledReport) => void;
}) {
  const [form, setForm] = React.useState<CreateScheduledReportRequest>({
    name:       "",
    reportType: REPORT_TYPES[0],
    frequency:  "WEEKLY",
    delivery:   "IN_APP",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try {
      const r = await reportsInsightsService.createScheduledReport(form);
      onCreate(r);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-background border border-border shadow-2xl p-6">
        <h2 className="text-base font-semibold mb-5">Schedule a Report</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Report Name</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Weekly Attendance Summary"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Report Type</label>
            <select
              value={form.reportType}
              onChange={e => setForm(p => ({ ...p, reportType: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Frequency</label>
              <select
                value={form.frequency}
                onChange={e => setForm(p => ({ ...p, frequency: e.target.value as typeof form.frequency }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                {(["DAILY","WEEKLY","MONTHLY"] as const).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Delivery</label>
              <select
                value={form.delivery}
                onChange={e => setForm(p => ({ ...p, delivery: e.target.value as typeof form.delivery }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                {(["IN_APP","EMAIL"] as const).map(d => <option key={d} value={d}>{d.replace("_"," ")}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ScheduledReportsTab() {
  const [reports, setReports]   = React.useState<ScheduledReport[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    reportsInsightsService.getScheduledReports()
      .then(setReports).catch(() => setReports([])).finally(() => setLoading(false));
  }, []);

  async function handleToggle(id: number, active: boolean) {
    const updated = await reportsInsightsService.toggleScheduledReport(id, !active);
    setReports(prev => prev.map(r => r.id === id ? updated : r));
  }

  async function handleDelete(id: number) {
    await reportsInsightsService.deleteScheduledReport(id);
    setReports(prev => prev.filter(r => r.id !== id));
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <>
      {creating && (
        <CreateScheduledModal
          onClose={() => setCreating(false)}
          onCreate={(r) => { setReports(prev => [r, ...prev]); setCreating(false); }}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Scheduled Reports</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automate report delivery on a recurring schedule.
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="size-4" />
            New Schedule
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
            <Calendar className="size-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold">No scheduled reports</p>
            <p className="text-xs text-muted-foreground">Create one to automate recurring report delivery.</p>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium hover:bg-muted mt-1"
            >
              <Plus className="size-3.5" /> Create Schedule
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map(r => (
              <div key={r.id} className={cn(
                "rounded-2xl border bg-background p-4 space-y-3 transition-opacity",
                !r.active && "opacity-60"
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex size-9 items-center justify-center rounded-xl shrink-0",
                    r.delivery === "EMAIL" ? "bg-blue-100 dark:bg-blue-950" : "bg-violet-100 dark:bg-violet-950"
                  )}>
                    {r.delivery === "EMAIL"
                      ? <Mail className="size-4 text-blue-600 dark:text-blue-400" />
                      : <Bell className="size-4 text-violet-600 dark:text-violet-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.reportType}</p>
                  </div>
                  <FrequencyBadge freq={r.frequency} />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Next: <span className="text-foreground font-medium">
                      {r.nextRunAt ? new Date(r.nextRunAt).toLocaleDateString() : "—"}
                    </span>
                  </span>
                  <span>
                    Last: <span className="text-foreground">
                      {r.lastRunAt ? new Date(r.lastRunAt).toLocaleDateString() : "Never"}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <button
                    onClick={() => handleToggle(r.id, r.active)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                      r.active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Power className="size-3" />
                    {r.active ? "Active" : "Paused"}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
