"use client";

import * as React from "react";
import {
  Download, FileSpreadsheet, FileText, File,
  Loader2, RefreshCw, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { reportsInsightsService, type ExportJob } from "@/services/reports-insights.service";

function FormatIcon({ fmt }: { fmt: string }) {
  if (fmt === "XLSX") return <FileSpreadsheet className="size-5 text-emerald-600" />;
  if (fmt === "CSV")  return <FileText className="size-5 text-blue-600" />;
  return <File className="size-5 text-red-600" />;
}

function StatusBadge({ status }: { status: ExportJob["status"] }) {
  const map: Record<ExportJob["status"], { label: string; className: string; icon: React.ReactNode }> = {
    PENDING:    { label: "Queued",     className: "bg-muted text-muted-foreground",           icon: <Clock className="size-3" /> },
    PROCESSING: { label: "Processing", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", icon: <Loader2 className="size-3 animate-spin" /> },
    DONE:       { label: "Ready",      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", icon: <CheckCircle2 className="size-3" /> },
    FAILED:     { label: "Failed",     className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",    icon: <XCircle className="size-3" /> },
  };
  const { label, className, icon } = map[status];
  return (
    <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", className)}>
      {icon}
      {label}
    </span>
  );
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function handleDownload(id: number) {
  try {
    const dataUrl = await reportsInsightsService.downloadExport(id);
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `report_export_${id}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    // silently ignore — job may not be ready
  }
}

export function ExportCenterTab() {
  const [jobs, setJobs]       = React.useState<ExportJob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [polling, setPolling] = React.useState(false);

  const fetchJobs = React.useCallback(async () => {
    try {
      const data = await reportsInsightsService.getExportJobs();
      setJobs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchJobs();
    // Poll every 5 seconds if any jobs are pending/processing
    const interval = setInterval(async () => {
      const current = await reportsInsightsService.getExportJobs().catch(() => [] as ExportJob[]);
      setJobs(current);
      const hasActive = current.some(j => j.status === "PENDING" || j.status === "PROCESSING");
      if (!hasActive) clearInterval(interval);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  async function handleRefresh() {
    setPolling(true);
    await fetchJobs();
    setPolling(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Export Center</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Download your generated reports here.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={polling}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4", polling && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <Download className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-semibold">No exports yet</p>
          <p className="text-xs text-muted-foreground">
            Use the Custom Report Builder or the export button on any report to create an export.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr>
                {["Format","Report","Status","Size","Requested By","Requested","Expires","Action"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-t border-border/40 hover:bg-muted/20">
                  <td className="px-3 py-3">
                    <FormatIcon fmt={job.exportFormat} />
                  </td>
                  <td className="px-3 py-3 font-medium max-w-[160px] truncate">{job.reportType}</td>
                  <td className="px-3 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-3 py-3 text-muted-foreground">{formatBytes(job.fileSizeBytes)}</td>
                  <td className="px-3 py-3">{job.requestedByName ?? "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {job.requestedAt ? new Date(job.requestedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-3">
                    {job.status === "DONE" ? (
                      <button
                        onClick={() => handleDownload(job.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1.5 font-semibold transition-colors"
                      >
                        <Download className="size-3.5" />
                        Download
                      </button>
                    ) : job.status === "FAILED" ? (
                      <span className="text-destructive text-[10px]" title={job.errorMessage ?? ""}>
                        {job.errorMessage ? job.errorMessage.slice(0, 40) + "…" : "Failed"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
