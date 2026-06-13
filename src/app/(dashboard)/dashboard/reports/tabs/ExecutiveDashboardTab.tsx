"use client";

import * as React from "react";
import {
  Users, Clock, CalendarOff, Sparkles,
  ShoppingBag, TrendingUp, UserPlus, CheckSquare,
  Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { reportsInsightsService, type ExecutiveDashboard, type AttendanceTrendRow } from "@/services/reports-insights.service";

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon, label, value, sub, colorClass, trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  colorClass: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={cn("flex size-9 items-center justify-center rounded-xl", colorClass)}>
          <Icon className="size-4 text-white" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            trend === "up"      && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
            trend === "down"    && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
            trend === "neutral" && "bg-muted text-muted-foreground",
          )}>
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs font-medium text-foreground/80 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Mini Trend Bar ────────────────────────────────────────────────────────────

function MiniTrendBar({ rows }: { rows: AttendanceTrendRow[] }) {
  const maxVal = Math.max(...rows.map(r => r.present + r.absent + r.onLeave), 1);
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Attendance Trend — 6 Months</h2>
      </div>
      <div className="flex items-end gap-2 h-28">
        {rows.map((row) => {
          const total = row.present + row.absent + row.onLeave;
          const h = maxVal > 0 ? Math.max(Math.round((total / maxVal) * 100), 6) : 6;
          const presentPct = total > 0 ? (row.present / total) * 100 : 0;
          const absentPct  = total > 0 ? (row.absent  / total) * 100 : 0;
          const leavePct   = total > 0 ? (row.onLeave / total) * 100 : 0;
          return (
            <div key={`${row.year}-${row.month}`} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full rounded-t overflow-hidden bg-muted flex flex-col-reverse" style={{ height: `${h}px` }}>
                <div className="bg-emerald-500" style={{ height: `${presentPct}%` }} />
                <div className="bg-red-400"     style={{ height: `${absentPct}%`  }} />
                <div className="bg-violet-400"  style={{ height: `${leavePct}%`   }} />
              </div>
              <span className="text-[9px] text-muted-foreground">{row.monthName}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-[11px]">
        {[["bg-emerald-500","Present"],["bg-red-400","Absent"],["bg-violet-400","Leave"]].map(([c,l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm", c)} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── DonutRing ─────────────────────────────────────────────────────────────────

function DonutRing({ pct, label, color }: { pct: number; label: string; color: string }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(pct, 100)) / 100 * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" />
        <text x="36" y="41" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function ExecutiveDashboardTab() {
  const [data, setData]       = React.useState<ExecutiveDashboard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    reportsInsightsService.getExecutiveDashboard()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message ?? e.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
      <AlertCircle className="size-4 shrink-0" />
      {error}
    </div>
  );

  if (!data) return null;

  const kpis = [
    { icon: Users,       label: "Total Employees",      value: data.totalEmployees,      sub: `${data.activeEmployees} active`,    colorClass: "bg-blue-500",    trend: "neutral" as const },
    { icon: Clock,       label: "Attendance This Month", value: `${data.attendancePct}%`, sub: "Present / working days",            colorClass: "bg-emerald-500", trend: data.attendancePct >= 80 ? "up" as const : "down" as const },
    { icon: CalendarOff, label: "On Leave This Month",   value: `${data.leavePct}%`,      sub: "Leave rate",                        colorClass: "bg-violet-500",  trend: "neutral" as const },
    { icon: Sparkles,    label: "Engagement Score",      value: `${data.engagementScore.toFixed(0)}%`, sub: "Activity participation", colorClass: "bg-amber-500",   trend: data.engagementScore >= 50 ? "up" as const : "neutral" as const },
    { icon: TrendingUp,  label: "Event Participation",   value: data.eventParticipation,  sub: "Total sports registrations",        colorClass: "bg-pink-500",    trend: "neutral" as const },
    { icon: ShoppingBag, label: "Marketplace Listings",  value: data.marketplaceActivity, sub: "Total products listed",             colorClass: "bg-cyan-500",    trend: "neutral" as const },
    { icon: UserPlus,    label: "New Joiners",            value: data.newJoinersThisMonth, sub: "This month",                        colorClass: "bg-indigo-500",  trend: data.newJoinersThisMonth > 0 ? "up" as const : "neutral" as const },
    { icon: CheckSquare, label: "Pending Approvals",      value: data.pendingApprovals,    sub: "Leave requests awaiting action",    colorClass: "bg-orange-500",  trend: data.pendingApprovals > 5 ? "down" as const : "neutral" as const },
  ];

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Donut rings + trend */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Rings */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <h2 className="text-sm font-semibold mb-4">Key Ratios</h2>
          <div className="flex justify-around">
            <DonutRing pct={data.attendancePct}  label="Attendance"  color="#10b981" />
            <DonutRing pct={100 - data.leavePct} label="Active"      color="#6366f1" />
            <DonutRing pct={data.engagementScore} label="Engagement" color="#f59e0b" />
          </div>
        </div>

        {/* Trend chart spans 2 cols */}
        <div className="lg:col-span-2">
          {data.attendanceTrend.length > 0 && <MiniTrendBar rows={data.attendanceTrend} />}
        </div>
      </div>

      {/* Quick stats table */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <h2 className="text-sm font-semibold mb-4">Quick Snapshot</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-sm">
          {[
            ["Total Employees",     data.totalEmployees],
            ["Active Employees",    data.activeEmployees],
            ["New Joiners (month)", data.newJoinersThisMonth],
            ["Pending Approvals",   data.pendingApprovals],
            ["Event Participation", data.eventParticipation],
            ["Marketplace Items",   data.marketplaceActivity],
            ["Attendance %",        `${data.attendancePct}%`],
            ["Leave Rate",          `${data.leavePct}%`],
          ].map(([l, v]) => (
            <div key={String(l)} className="flex flex-col gap-0.5 rounded-xl bg-muted/40 px-3 py-2">
              <span className="text-[11px] text-muted-foreground">{l}</span>
              <span className="font-bold tabular-nums">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
