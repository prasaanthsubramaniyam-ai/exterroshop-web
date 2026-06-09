"use client";

import * as React from "react";
import { UsersRound, Loader2, CheckCircle2, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { sportsService, type SportsRegistration } from "@/services/sports.service";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  APPROVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default function VolunteersPage() {
  const [regs, setRegs] = React.useState<SportsRegistration[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [busy, setBusy] = React.useState<number | null>(null);

  React.useEffect(() => {
    sportsService.getAllRegistrations()
      .then((all) => setRegs(all.filter((r) => r.registrationType === "VOLUNTEER")))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    const comments = prompt("Reason (optional):");
    if (comments === null) return;
    setBusy(id);
    try {
      const updated = await sportsService.rejectRegistration(id, comments || undefined);
      setRegs((prev) => prev.map((r) => r.id === id ? updated : r));
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950">
          <UsersRound className="size-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Volunteers</h1>
          <p className="text-sm text-muted-foreground">Review and approve volunteer registrations</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search volunteers…"
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("rounded-xl px-3 py-2 text-xs font-medium transition-all",
                statusFilter === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted")}>
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
          <UsersRound className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No volunteer registrations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
              {r.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.avatarUrl} alt={r.employeeName} className="size-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="size-10 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(r.employeeName)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{r.employeeName}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{r.eventTitle}</p>
              </div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold hidden sm:inline-flex",
                STATUS_STYLE[r.status] ?? "bg-muted text-muted-foreground")}>
                {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
              </span>
              {r.status === "PENDING" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleApprove(r.id)} disabled={busy === r.id}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60">
                    {busy === r.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                    Approve
                  </button>
                  <button onClick={() => handleReject(r.id)} disabled={busy === r.id}
                    className="flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60">
                    <XCircle className="size-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
