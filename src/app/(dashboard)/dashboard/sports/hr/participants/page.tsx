"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Users, Loader2, CheckCircle2, XCircle, Search,
  FileSpreadsheet, FileText, FileDown, UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sportsService, type SportsRegistration } from "@/services/sports.service";
import { exportToExcel, exportToPDF, exportToDoc } from "@/utils/export";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  APPROVED:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  REJECTED:   "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  WAITLISTED: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
};

const TYPE_STYLE: Record<string, string> = {
  PARTICIPANT: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  VOLUNTEER:   "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
};

// ── Export helpers ────────────────────────────────────────────────────────────

function buildTableHtml(rows: SportsRegistration[]) {
  const header = `
    <tr>
      <th>#</th><th>Employee</th><th>Email</th><th>Event</th>
      <th>Date</th><th>Type</th><th>Status</th><th>Registered On</th><th>Reviewed By</th>
    </tr>`;
  const body = rows.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.employeeName}</td>
      <td>${r.employeeEmail}</td>
      <td>${r.eventTitle}</td>
      <td>${r.eventDate ? fmtDate(r.eventDate) : "—"}</td>
      <td><span class="badge ${r.registrationType}">${r.registrationType.charAt(0) + r.registrationType.slice(1).toLowerCase()}</span></td>
      <td><span class="badge ${r.status}">${r.status.charAt(0) + r.status.slice(1).toLowerCase()}</span></td>
      <td>${fmtDate(r.createdAt)}</td>
      <td>${r.reviewedBy ?? "—"}</td>
    </tr>`).join("");
  return `<table>${header}<tbody>${body}</tbody></table>`;
}

function buildExcelRows(rows: SportsRegistration[]) {
  return rows.map((r) => [
    r.employeeName,
    r.employeeEmail,
    r.eventTitle,
    r.eventDate ? fmtDate(r.eventDate) : "",
    r.registrationType,
    r.status,
    fmtDate(r.createdAt),
    r.reviewedBy ?? "",
    r.comments ?? "",
  ]);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RegistrationsPage() {
  const searchParams = useSearchParams();
  const initialType  = searchParams.get("type") ?? "ALL";

  const [allRegs,      setAllRegs]      = React.useState<SportsRegistration[]>([]);
  const [loading,      setLoading]      = React.useState(true);
  const [search,       setSearch]       = React.useState("");
  const [typeFilter,   setTypeFilter]   = React.useState(initialType); // ALL | PARTICIPANT | VOLUNTEER
  const [statusFilter, setStatusFilter] = React.useState("ALL");       // ALL | PENDING | APPROVED | REJECTED | WAITLISTED
  const [busy,         setBusy]         = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    sportsService.getAllRegistrations()
      .then(setAllRegs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // ── Derived filtered list ─────────────────────────────────────────────────

  const filtered = React.useMemo(() => allRegs.filter((r) => {
    if (typeFilter   !== "ALL" && r.registrationType !== typeFilter)   return false;
    if (statusFilter !== "ALL" && r.status           !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.employeeName.toLowerCase().includes(q)
        && !r.employeeEmail.toLowerCase().includes(q)
        && !r.eventTitle.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [allRegs, typeFilter, statusFilter, search]);

  // ── Count badges ──────────────────────────────────────────────────────────

  const count = (type: string, status?: string) =>
    allRegs.filter((r) =>
      (type === "ALL" || r.registrationType === type) &&
      (!status || r.status === status)
    ).length;

  // ── Approve / Reject ──────────────────────────────────────────────────────

  const handleApprove = async (id: number) => {
    setBusy(id);
    try {
      const updated = await sportsService.approveRegistration(id);
      setAllRegs((prev) => prev.map((r) => r.id === id ? updated : r));
    } finally { setBusy(null); }
  };

  const handleReject = async (id: number) => {
    const comments = prompt("Reason for rejection (optional):");
    if (comments === null) return;
    setBusy(id);
    try {
      const updated = await sportsService.rejectRegistration(id, comments || undefined);
      setAllRegs((prev) => prev.map((r) => r.id === id ? updated : r));
    } finally { setBusy(null); }
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const exportTitle = () => {
    const typePart   = typeFilter   === "ALL" ? "All Registrations" : `${typeFilter.charAt(0) + typeFilter.slice(1).toLowerCase()}s`;
    const statusPart = statusFilter === "ALL" ? "" : ` — ${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}`;
    return `Sports ${typePart}${statusPart}`;
  };

  const handleExportXL = () => {
    const headers = ["Employee", "Email", "Event", "Event Date", "Type", "Status", "Registered On", "Reviewed By", "Comments"];
    exportToExcel(exportTitle(), headers, buildExcelRows(filtered));
  };

  const handleExportPDF = () => {
    exportToPDF(exportTitle(), buildTableHtml(filtered));
  };

  const handleExportDoc = () => {
    exportToDoc(exportTitle(), buildTableHtml(filtered));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const TYPE_TABS = [
    { key: "ALL",         label: "All",          icon: Users },
    { key: "PARTICIPANT", label: "Participants",  icon: Users },
    { key: "VOLUNTEER",   label: "Volunteers",   icon: UsersRound },
  ];

  const STATUS_TABS = ["ALL", "PENDING", "APPROVED", "REJECTED", "WAITLISTED"];

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
            <Users className="size-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Registrations</h1>
            <p className="text-sm text-muted-foreground">
              Manage participant &amp; volunteer registrations
            </p>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportXL}
            disabled={filtered.length === 0}
            title="Export to Excel"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-emerald-700 dark:text-emerald-400 hover:border-emerald-300"
          >
            <FileSpreadsheet className="size-3.5" />
            XL
          </button>
          <button
            onClick={handleExportPDF}
            disabled={filtered.length === 0}
            title="Export to PDF"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-red-600 dark:text-red-400 hover:border-red-300"
          >
            <FileText className="size-3.5" />
            PDF
          </button>
          <button
            onClick={handleExportDoc}
            disabled={filtered.length === 0}
            title="Export to Word DOC"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-blue-600 dark:text-blue-400 hover:border-blue-300"
          >
            <FileDown className="size-3.5" />
            DOC
          </button>
        </div>
      </div>

      {/* ── Type filter tabs ────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TYPE_TABS.map(({ key, label, icon: Icon }) => {
          const n = count(key);
          return (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                typeFilter === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border hover:bg-muted"
              )}
            >
              <Icon className="size-3.5" />
              {label}
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                typeFilter === key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + Status filter ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or event…"
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((s) => {
            const n = allRegs.filter((r) =>
              (typeFilter === "ALL" || r.registrationType === typeFilter) &&
              (s === "ALL" || r.status === s)
            ).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-medium transition-all",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-muted"
                )}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                <span className="ml-1 opacity-70">({n})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Results summary ─────────────────────────────────────────────────── */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          <span className="font-semibold text-foreground">{allRegs.length}</span> registrations
        </p>
      )}

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading registrations…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Users className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No registrations match the selected filters</p>
          <button
            onClick={() => { setTypeFilter("ALL"); setStatusFilter("ALL"); setSearch(""); }}
            className="text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-muted/50 text-muted-foreground text-[11px] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Employee</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Event</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Registered</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">

                  {/* Employee */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {r.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.avatarUrl} alt={r.employeeName}
                          className="size-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="size-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(r.employeeName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{r.employeeName}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.employeeEmail}</p>
                      </div>
                    </div>
                  </td>

                  {/* Event */}
                  <td className="px-4 py-3 hidden sm:table-cell max-w-[180px]">
                    <p className="font-medium text-sm line-clamp-1">{r.eventTitle}</p>
                    {r.eventDate && (
                      <p className="text-xs text-muted-foreground">{fmtDate(r.eventDate)}</p>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      TYPE_STYLE[r.registrationType] ?? "bg-muted text-muted-foreground"
                    )}>
                      {r.registrationType === "PARTICIPANT" ? "Participant" : "Volunteer"}
                    </span>
                  </td>

                  {/* Registered date */}
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {fmtDate(r.createdAt)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      STATUS_STYLE[r.status] ?? "bg-muted text-muted-foreground"
                    )}>
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {r.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={busy === r.id}
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          {busy === r.id
                            ? <Loader2 className="size-3 animate-spin" />
                            : <CheckCircle2 className="size-3" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          disabled={busy === r.id}
                          className="flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          <XCircle className="size-3" /> Reject
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-right">
                        {r.reviewedBy ? `By ${r.reviewedBy}` : "—"}
                      </p>
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
