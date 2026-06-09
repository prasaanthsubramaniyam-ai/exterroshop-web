"use client";

import * as React from "react";
import {
  Users, Loader2, CheckCircle2, XCircle, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sportsService, type SportsRegistration } from "@/services/sports.service";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  APPROVED:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  REJECTED:   "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  WAITLISTED: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
};

export default function ParticipantsPage() {
  const [regs, setRegs] = React.useState<SportsRegistration[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [busy, setBusy] = React.useState<number | null>(null);

  const load = () => {
    sportsService.getAllRegistrations()
      .then((all) => setRegs(all.filter((r) => r.registrationType === "PARTICIPANT")))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  React.useEffect(load, []);

  const filtered = regs.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (search && !r.employeeName.toLowerCase().includes(search.toLowerCase())
      && !r.eventTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApprove = async (id: number) => {
    setBusy(id);
    try {
      const updated = await sportsService.approveRegistration(id);
      setRegs((prev) => prev.map((r) => r.id === id ? updated : r));
    } finally { setBusy(null); }
  };

  const handleReject = async (id: number) => {
    const comments = prompt("Reason for rejection (optional):");
    if (comments === null) return; // cancelled
    setBusy(id);
    try {
      const updated = await sportsService.rejectRegistration(id, comments || undefined);
      setRegs((prev) => prev.map((r) => r.id === id ? updated : r));
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
          <Users className="size-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Participants</h1>
          <p className="text-sm text-muted-foreground">Review and approve participant registrations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or event…"
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-xl px-3 py-2 text-xs font-medium transition-all",
                statusFilter === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
              )}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Users className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No participant registrations</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Employee</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Event</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Registered</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {r.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.avatarUrl} alt={r.employeeName}
                          className="size-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(r.employeeName)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{r.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{r.employeeEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="font-medium text-sm line-clamp-1">{r.eventTitle}</p>
                    {r.eventDate && <p className="text-xs text-muted-foreground">{fmtDate(r.eventDate)}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {fmtDate(r.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", STATUS_STYLE[r.status] ?? "bg-muted text-muted-foreground")}>
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={busy === r.id}
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          {busy === r.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          disabled={busy === r.id}
                          className="flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          <XCircle className="size-3" />
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status !== "PENDING" && (
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
