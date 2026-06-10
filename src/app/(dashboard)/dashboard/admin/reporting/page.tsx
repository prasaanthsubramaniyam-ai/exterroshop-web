"use client";

import * as React from "react";
import { Network, Loader2, Plus, Trash2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { directoryService, type Employee } from "@/services/directory.service";
import {
  reportingService, REPORTING_TYPE_STYLE,
  type ReportingLine, type ReportingType,
} from "@/services/reporting.service";

const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const TYPES: ReportingType[] = ["PRIMARY", "DOTTED", "FUNCTIONAL", "PROJECT"];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function ReportingPage() {
  const { can } = usePermissions();
  const canEdit = can("EMPLOYEE_EDIT");

  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [lines, setLines] = React.useState<ReportingLine[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [showAdd, setShowAdd] = React.useState(false);
  const [form, setForm] = React.useState<{ managerId: string; reportingType: ReportingType; note: string }>({
    managerId: "", reportingType: "DOTTED", note: "",
  });
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    directoryService.getAll().then(setEmployees).catch(() => {});
  }, []);

  const loadLines = React.useCallback((id: string) => {
    if (!id) { setLines([]); return; }
    setLoading(true);
    reportingService.getEmployeeLines(Number(id))
      .then(setLines).catch(() => {}).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadLines(selectedId); }, [selectedId, loadLines]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !form.managerId) return;
    setBusy(true);
    try {
      await reportingService.addLine({
        employeeId: Number(selectedId),
        managerId: Number(form.managerId),
        reportingType: form.reportingType,
        note: form.note || undefined,
      });
      setForm({ managerId: "", reportingType: "DOTTED", note: "" });
      setShowAdd(false);
      loadLines(selectedId);
    } catch (err) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to add line");
    } finally { setBusy(false); }
  };

  const handleRemove = async (line: ReportingLine) => {
    if (line.id == null) { alert("The primary line is managed via the employee's manager field."); return; }
    if (!confirm(`Remove ${line.reportingType.toLowerCase()} reporting to ${line.managerName}?`)) return;
    try {
      await reportingService.removeLine(line.id);
      loadLines(selectedId);
    } catch {
      alert("Failed to remove line");
    }
  };

  const selectedName = employees.find((e) => String(e.id) === selectedId)?.name;

  return (
    <RoleGuard roles={["HR", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
            <Network className="size-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reporting Structure</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage primary and matrix (dotted-line) reporting relationships.
            </p>
          </div>
        </div>

        {/* Employee selector */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select className={cn(INPUT, "sm:max-w-md")} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">— Select an employee —</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          {selectedId && canEdit && (
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Plus className="size-4" /> Add Reporting Line
            </button>
          )}
        </div>

        {/* Add form */}
        {showAdd && selectedId && (
          <form onSubmit={handleAdd} className="rounded-2xl border border-border bg-background p-4 grid sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Reports to</label>
              <select className={INPUT} value={form.managerId} onChange={(e) => setForm((f) => ({ ...f, managerId: e.target.value }))} required>
                <option value="">— Manager —</option>
                {employees.filter((e) => String(e.id) !== selectedId).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
              <select className={INPUT} value={form.reportingType} onChange={(e) => setForm((f) => ({ ...f, reportingType: e.target.value as ReportingType }))}>
                {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input className={INPUT} placeholder="Note (optional)" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
              <button type="submit" disabled={busy} className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-primary/90">
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Add"}
              </button>
            </div>
          </form>
        )}

        {/* Lines */}
        {!selectedId ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Network className="size-10 text-muted-foreground mb-3" />
            <p className="font-medium text-muted-foreground">Select an employee to view their reporting lines</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
            <p className="text-sm font-medium text-muted-foreground">{selectedName} has no reporting lines yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={line.id ?? `primary-${i}`} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3.5">
                {line.managerAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.managerAvatarUrl} alt={line.managerName} className="size-9 rounded-full object-cover" />
                ) : (
                  <div className="size-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{initials(line.managerName)}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    {line.reportingType === "PRIMARY" && <Crown className="size-3.5 text-amber-500" />}
                    {line.managerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {line.managerDesignation ?? "—"}{line.note ? ` · ${line.note}` : ""}
                  </p>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", REPORTING_TYPE_STYLE[line.reportingType])}>
                  {line.reportingType.charAt(0) + line.reportingType.slice(1).toLowerCase()}
                </span>
                {canEdit && (
                  <button
                    onClick={() => handleRemove(line)}
                    disabled={line.id == null}
                    title={line.id == null ? "Primary line — managed via the employee's manager field" : "Remove"}
                    className="rounded border border-border p-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
