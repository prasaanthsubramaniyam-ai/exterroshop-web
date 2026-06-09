"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import auditService, {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogPage,
} from "@/services/audit.service";

// ── Action badge colours ──────────────────────────────────────────────────────

const ACTION_COLOUR: Record<string, string> = {
  USER_CREATED:          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  USER_UPDATED:          "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300",
  USER_DELETED:          "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-300",
  DEPARTMENT_CREATED:    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  DEPARTMENT_UPDATED:    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  DESIGNATION_CREATED:   "bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-300",
  DESIGNATION_UPDATED:   "bg-cyan-100   text-cyan-700   dark:bg-cyan-900/30   dark:text-cyan-300",
  LEAVE_APPROVED:        "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300",
  LEAVE_REJECTED:        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  LOGIN:                 "bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400",
};

function actionBadge(action: string) {
  const cls =
    ACTION_COLOUR[action] ??
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {action.replace(/_/g, " ")}
    </span>
  );
}

// ── JSON diff drawer ──────────────────────────────────────────────────────────

function JsonPanel({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    parsed = value;
  }
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <pre className="overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300 max-h-64">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    </div>
  );
}

interface DiffDrawerProps {
  entry: AuditLogEntry | null;
  onClose: () => void;
}

function DiffDrawer({ entry, onClose }: DiffDrawerProps) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${entry ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      {/* drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 ${entry ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Change Detail
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {entry && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* summary row */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800 space-y-1">
              <div className="flex items-center gap-2">
                {actionBadge(entry.action)}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {entry.entityType} #{entry.entityId}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{entry.actorName ?? "System"}</span>
                {entry.actorEmail && (
                  <span className="ml-1 text-gray-400">({entry.actorEmail})</span>
                )}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(entry.createdAt + "Z").toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {entry.ipAddress && ` · ${entry.ipAddress}`}
              </p>
            </div>
            <JsonPanel label="Before" value={entry.oldValue} />
            <JsonPanel label="After"  value={entry.newValue} />
            {!entry.oldValue && !entry.newValue && (
              <p className="text-sm text-gray-400">No payload recorded for this event.</p>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────

function exportCSV(rows: AuditLogEntry[]) {
  const header = ["ID", "Action", "Entity Type", "Entity ID", "Actor", "Actor Email", "IP", "Timestamp"];
  const escape = (v?: string | number | null) => {
    if (v == null) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = rows.map((r) =>
    [r.id, r.action, r.entityType, r.entityId, r.actorName, r.actorEmail, r.ipAddress,
      new Date(r.createdAt + "Z").toISOString()]
      .map(escape)
      .join(",")
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AuditLogView() {
  const [page, setPage]            = useState<AuditLogPage | null>(null);
  const [loading, setLoading]      = useState(false);
  const [selectedEntry, setEntry]  = useState<AuditLogEntry | null>(null);
  const [actions, setActions]      = useState<string[]>([]);
  const [entityTypes, setETypes]   = useState<string[]>([]);
  const [showFilter, setFilter]    = useState(false);

  // filters
  const [action,      setAction]      = useState("");
  const [entityType,  setEntityType]  = useState("");
  const [from,        setFrom]        = useState("");
  const [to,          setTo]          = useState("");
  const [actorSearch, setActorSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const buildFilters = useCallback((): AuditLogFilters => ({
    action:     action     || undefined,
    entityType: entityType || undefined,
    from:       from       || undefined,
    to:         to         || undefined,
    page:       currentPage,
    size:       50,
  }), [action, entityType, from, to, currentPage]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await auditService.getLogs(buildFilters());
      setPage(data);
    } catch (e) {
      console.error("Audit log fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, [buildFilters]);

  // initial dropdown data
  useEffect(() => {
    auditService.getDistinctActions().then(setActions).catch(() => {});
    auditService.getDistinctEntityTypes().then(setETypes).catch(() => {});
  }, []);

  // load on filter / page change
  useEffect(() => { load(); }, [load]);

  // 60-second auto-refresh
  useEffect(() => {
    refreshTimer.current = setInterval(() => load(true), 60_000);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [load]);

  // reset page when filters change
  const applyFilter = () => { setCurrentPage(0); setFilter(false); };
  const clearFilters = () => {
    setAction(""); setEntityType(""); setFrom(""); setTo(""); setActorSearch("");
    setCurrentPage(0);
  };

  const activeFilterCount =
    (action ? 1 : 0) + (entityType ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0);

  // client-side actor name search (optional additional filter)
  const rows = page?.content.filter((r) => {
    if (!actorSearch) return true;
    const q = actorSearch.toLowerCase();
    return (
      r.actorName?.toLowerCase().includes(q) ||
      r.actorEmail?.toLowerCase().includes(q)
    );
  }) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-purple-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Audit Logs
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                System activity trail — SUPER_ADMIN only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load()}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => rows.length && exportCSV(rows)}
              disabled={!rows.length}
              className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-3">
          {/* Actor search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={actorSearch}
              onChange={(e) => setActorSearch(e.target.value)}
              placeholder="Search actor…"
              className="rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFilter((f) => !f)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 rounded-full bg-purple-600 px-1.5 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}

          {/* Active filter chips */}
          {action && (
            <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Action: {action}
              <button onClick={() => setAction("")}><X className="h-3 w-3" /></button>
            </span>
          )}
          {entityType && (
            <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              Type: {entityType}
              <button onClick={() => setEntityType("")}><X className="h-3 w-3" /></button>
            </span>
          )}
          {from && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              From: {from}
              <button onClick={() => setFrom("")}><X className="h-3 w-3" /></button>
            </span>
          )}
          {to && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              To: {to}
              <button onClick={() => setTo("")}><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>

        {/* Expanded filter panel */}
        {showFilter && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Action */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All actions</option>
                {actions.map((a) => (
                  <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            {/* Entity type */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Entity Type
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All types</option>
                {entityTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {/* From */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                From Date
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            {/* To */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                To Date
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            {/* Apply */}
            <div className="col-span-full flex justify-end">
              <button
                onClick={applyFilter}
                className="rounded-lg bg-purple-600 px-4 py-1.5 text-sm text-white hover:bg-purple-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Entity</th>
              <th className="px-5 py-3">Actor</th>
              <th className="px-5 py-3">Timestamp (IST)</th>
              <th className="px-5 py-3">IP</th>
              <th className="px-5 py-3 text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  No audit log entries found.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-100 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/50"
              >
                <td className="px-5 py-3">{actionBadge(r.action)}</td>
                <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{r.entityType}</span>
                  {r.entityId != null && (
                    <span className="ml-1 text-gray-400">#{r.entityId}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {r.actorName ?? "System"}
                  </p>
                  {r.actorEmail && (
                    <p className="text-xs text-gray-400">{r.actorEmail}</p>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-gray-500 dark:text-gray-400">
                  {new Date(r.createdAt + "Z").toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-gray-400">
                  {r.ipAddress ?? "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  {(r.oldValue || r.newValue) && (
                    <button
                      onClick={() => setEntry(r)}
                      className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      Diff
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {page && page.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing page {page.number + 1} of {page.totalPages} —{" "}
            {page.totalElements.toLocaleString()} entries total
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={page.number === 0}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {/* Page number chips — show up to 5 around current */}
            {Array.from({ length: Math.min(page.totalPages, 5) }, (_, i) => {
              const start = Math.max(0, Math.min(page.number - 2, page.totalPages - 5));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`min-w-[2rem] rounded px-1.5 py-1 text-xs ${
                    p === page.number
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(page.totalPages - 1, p + 1))}
              disabled={page.number >= page.totalPages - 1}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Diff drawer */}
      <DiffDrawer entry={selectedEntry} onClose={() => setEntry(null)} />
    </div>
  );
}
