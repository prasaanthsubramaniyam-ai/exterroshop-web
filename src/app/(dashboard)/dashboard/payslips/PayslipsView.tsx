"use client";

import * as React from "react";
import {
  FileText, Download, Upload, Trash2, X, Loader2, AlertCircle, Plus,
} from "lucide-react";
import { usePayslips } from "@/hooks/usePayslips";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CAN_MANAGE = new Set(["HR", "SUPER_ADMIN"]);

const MONTH_NAMES: Record<string, string> = {
  "01": "January", "02": "February", "03": "March", "04": "April",
  "05": "May",     "06": "June",     "07": "July",  "08": "August",
  "09": "September","10": "October", "11": "November","12": "December",
};

function periodLabel(period: string) {
  const [year, month] = period.split("-");
  return `${MONTH_NAMES[month] ?? month} ${year}`;
}

// ── Upload modal (HR) ─────────────────────────────────────────────────────────

interface UploadModalProps {
  onClose: () => void;
  onUpload: (employeeId: number, period: string, file: File) => Promise<unknown>;
}

function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [employeeId, setEmployeeId] = React.useState("");
  const [period,     setPeriod]     = React.useState("");
  const [file,       setFile]       = React.useState<File | null>(null);
  const [saving,     setSaving]     = React.useState(false);
  const [error,      setError]      = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !period || !file) { setError("All fields are required"); return; }
    const id = parseInt(employeeId);
    if (isNaN(id)) { setError("Employee ID must be a number"); return; }
    if (!/^\d{4}-\d{2}$/.test(period)) { setError("Period must be YYYY-MM format"); return; }
    setSaving(true);
    try {
      await onUpload(id, period, file);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">Upload Payslip</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Employee ID *</label>
            <input
              type="number" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. 42"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Pay Period (YYYY-MM) *</label>
            <input
              type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">File (PDF) *</label>
            <input
              type="file" accept=".pdf,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
            />
            {file && <p className="mt-1 text-xs text-muted-foreground">{file.name}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function PayslipsView() {
  const { user }                                = useAuth();
  const { payslips, loading, error, upload, remove } = usePayslips();
  const [showModal, setShowModal]               = React.useState(false);
  const [deleting,  setDeleting]                = React.useState<number | null>(null);

  const canManage = CAN_MANAGE.has(user?.role ?? "");

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this payslip?")) return;
    setDeleting(id);
    try { await remove(id); } finally { setDeleting(null); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
            <FileText className="size-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Payslips</h1>
            <p className="text-xs text-muted-foreground">{payslips.length} payslips available</p>
          </div>
        </div>
        {canManage && (
          <button type="button" onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" /> Upload
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && payslips.length === 0 && (
        <div className="rounded-2xl border border-border bg-background py-14 text-center">
          <FileText className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No payslips yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {canManage ? "Upload payslips for employees" : "Your payslips will appear here when HR uploads them"}
          </p>
        </div>
      )}

      {!loading && payslips.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {payslips.map((p, idx) => (
            <div key={p.id} className={cn(
              "flex items-center gap-4 px-4 py-3.5",
              idx > 0 && "border-t border-border/60"
            )}>
              {/* Icon */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
                <FileText className="size-4.5 text-emerald-600" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{periodLabel(p.payPeriod)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {canManage ? p.employeeName + " · " : ""}{p.fileName}
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={p.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  <Download className="size-3.5" /> Download
                </a>
                {canManage && (
                  <button type="button" onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    {deleting === p.id
                      ? <Loader2 className="size-4 animate-spin" />
                      : <Trash2 className="size-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onUpload={upload}
        />
      )}
    </div>
  );
}
