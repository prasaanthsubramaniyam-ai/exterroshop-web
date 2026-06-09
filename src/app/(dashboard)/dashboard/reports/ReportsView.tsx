"use client";

import * as React from "react";
import {
  BarChart2, Users, Clock, CalendarOff,
  TrendingUp, Loader2, AlertCircle, RefreshCw,
  Building2, MapPin, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReports } from "@/hooks/useReports";
import type {
  HeadcountReport, AttendanceTrend,
  LeaveUtilisation, TodaySnapshot,
} from "@/services/reports.service";

// ── Colour palettes ───────────────────────────────────────────────────────────

const LOCATION_COLORS: Record<string, string> = {
  Chennai:     "bg-blue-500",
  Coimbatore:  "bg-emerald-500",
  Bangalore:   "bg-violet-500",
};
const LOCATION_LIGHT: Record<string, string> = {
  Chennai:     "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Coimbatore:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Bangalore:   "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN:   "Super Admin",
  MANAGER:       "Manager",
  HR:            "HR",
  STAFF:         "Staff",
  EMPLOYEE_USER: "Employee",
};
const LEAVE_COLORS: Record<string, string> = {
  PL:  "bg-emerald-500",
  SL:  "bg-blue-500",
  CL:  "bg-violet-500",
  ML:  "bg-pink-500",
  PaL: "bg-cyan-500",
  BL:  "bg-orange-500",
  LOP: "bg-red-500",
};

// ── Small building blocks ─────────────────────────────────────────────────────

/** Horizontal bar with label + value */
function HBar({ label, value, max, colorClass }: { label: string; value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-xs font-medium text-right">{label}</span>
      <div className="flex-1 h-4 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-xs font-bold tabular-nums text-right">{value}</span>
    </div>
  );
}

/** Stacked bar for attendance trend month */
function TrendBar({ row, maxVal }: { row: AttendanceTrend; maxVal: number }) {
  const total = row.present + row.absent + row.onLeave + row.halfDay;
  const h = maxVal > 0 ? Math.max(Math.round((total / maxVal) * 120), 8) : 8;
  const presentPct = total > 0 ? (row.present / total) * 100 : 0;
  const absentPct  = total > 0 ? (row.absent  / total) * 100 : 0;
  const leavePct   = total > 0 ? (row.onLeave / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Stacked bar */}
      <div className="w-9 rounded-t-lg overflow-hidden bg-muted flex flex-col-reverse" style={{ height: `${h}px` }}>
        <div className="bg-emerald-500 transition-all" style={{ height: `${presentPct}%` }} title={`Present: ${row.present}`} />
        <div className="bg-red-400 transition-all"     style={{ height: `${absentPct}%`  }} title={`Absent: ${row.absent}`} />
        <div className="bg-violet-400 transition-all"  style={{ height: `${leavePct}%`   }} title={`Leave: ${row.onLeave}`} />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">{row.monthName}</span>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Today snapshot ────────────────────────────────────────────────────────────

function TodaySection({ snap }: { snap: TodaySnapshot }) {
  const items = [
    { label: "Total Active",  value: snap.totalActive, color: "text-foreground"     },
    { label: "Checked In",   value: snap.checkedIn,   color: "text-emerald-600"    },
    { label: "Checked Out",  value: snap.checkedOut,  color: "text-blue-600"       },
    { label: "On Leave",     value: snap.onLeave,     color: "text-violet-600"     },
    { label: "Not Yet In",   value: snap.notYetIn,    color: "text-amber-600"      },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-background px-4 py-3 text-center">
          <p className={cn("text-3xl font-bold tabular-nums", s.color)}>{s.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Headcount section ─────────────────────────────────────────────────────────

function HeadcountSection({ hc }: { hc: HeadcountReport }) {
  const maxDept = Math.max(...Object.values(hc.byDepartment), 1);
  const maxLoc  = Math.max(...Object.values(hc.byLocation),  1);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* By department */}
      <div className="lg:col-span-2 rounded-2xl border border-border bg-background p-5">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">By Department</h2>
        </div>
        {Object.keys(hc.byDepartment).length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No department data yet</p>
        ) : (
          <div className="space-y-2.5">
            {Object.entries(hc.byDepartment)
              .sort(([, a], [, b]) => b - a)
              .map(([dept, count]) => (
                <HBar key={dept} label={dept} value={count} max={maxDept} colorClass="bg-primary" />
              ))}
          </div>
        )}
      </div>

      {/* By location */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">By Location</h2>
        </div>
        <div className="space-y-3">
          {Object.entries(hc.byLocation)
            .sort(([, a], [, b]) => b - a)
            .map(([loc, count]) => {
              const pct = maxLoc > 0 ? Math.round((count / hc.totalActive) * 100) : 0;
              const clr = LOCATION_LIGHT[loc] ?? "bg-muted text-muted-foreground";
              return (
                <div key={loc} className="flex items-center gap-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold min-w-[90px] text-center", clr)}>{loc}</span>
                  <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", LOCATION_COLORS[loc] ?? "bg-primary")} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <span className="text-xs font-bold w-8 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
        </div>

        {/* By role */}
        <div className="mt-5 pt-4 border-t border-border">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">By Role</h3>
          </div>
          <div className="space-y-1.5">
            {Object.entries(hc.byRole)
              .sort(([, a], [, b]) => b - a)
              .map(([role, count]) => (
                <div key={role} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{ROLE_LABELS[role] ?? role}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attendance trend chart ────────────────────────────────────────────────────

function TrendSection({ rows, title }: { rows: AttendanceTrend[]; title: string }) {
  const maxVal = Math.max(...rows.map((r) => r.present + r.absent + r.onLeave + r.halfDay), 1);

  return (
    <Section title={title} icon={TrendingUp}>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">No attendance data yet</p>
      ) : (
        <div className="space-y-4">
          {/* Bar chart */}
          <div className="flex items-end gap-2 h-36 px-2">
            {rows.map((row) => <TrendBar key={`${row.year}-${row.month}`} row={row} maxVal={maxVal} />)}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
            {[
              { label: "Present", color: "bg-emerald-500" },
              { label: "Absent",  color: "bg-red-400"     },
              { label: "Leave",   color: "bg-violet-400"  },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className={cn("size-2.5 rounded-sm", l.color)} />
                {l.label}
              </span>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 text-left font-medium">Month</th>
                  <th className="pb-2 text-right font-medium">Present</th>
                  <th className="pb-2 text-right font-medium">Absent</th>
                  <th className="pb-2 text-right font-medium">WFH</th>
                  <th className="pb-2 text-right font-medium">Leave</th>
                  <th className="pb-2 text-right font-medium">Work Days</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.year}-${row.month}`} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2">{row.monthName} {row.year}</td>
                    <td className="py-2 text-right font-medium text-emerald-600">{row.present}</td>
                    <td className="py-2 text-right text-red-600">{row.absent}</td>
                    <td className="py-2 text-right text-blue-600">{row.wfh}</td>
                    <td className="py-2 text-right text-violet-600">{row.onLeave}</td>
                    <td className="py-2 text-right text-muted-foreground">{row.totalWorkingDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Leave utilisation ─────────────────────────────────────────────────────────

function LeaveUtilSection({ rows }: { rows: LeaveUtilisation[] }) {
  return (
    <Section title="Leave Utilisation — Current FY" icon={CalendarOff}>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">No leave balance data yet</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const bar = LEAVE_COLORS[row.leaveTypeCode] ?? "bg-primary";
            return (
              <div key={row.leaveTypeCode}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={cn("flex size-5 items-center justify-center rounded text-[10px] font-bold text-white", bar)}>
                      {row.leaveTypeCode}
                    </span>
                    <span className="font-medium">{row.leaveTypeName}</span>
                    <span className="text-muted-foreground">({row.employeesWithBalance} employees)</span>
                  </div>
                  <span className="tabular-nums">
                    <span className="font-bold">{row.utilisationPct}%</span>
                    <span className="text-muted-foreground ml-1">used</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-all", bar)}
                    style={{ width: `${Math.max(row.utilisationPct, 1)}%` }} />
                </div>
                <div className="mt-1 flex gap-4 text-[10px] text-muted-foreground">
                  <span>Total: <b className="text-foreground">{Number(row.totalAllotted).toLocaleString()}</b></span>
                  <span>Used: <b className="text-foreground">{Number(row.totalUsed).toLocaleString()}</b></span>
                  <span>Remaining: <b className="text-foreground">{Number(row.totalRemaining).toLocaleString()}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ReportsView() {
  const { headcount, today, trend, teamTrend, leaveUtil, loading, error, fetchAll } = useReports();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <BarChart2 className="size-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Reports &amp; Analytics</h1>
            <p className="text-sm text-muted-foreground">Attendance, headcount and leave insights</p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && !headcount ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Today snapshot */}
          {today && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Today&apos;s Snapshot</h2>
                <span className="text-xs text-muted-foreground">({today.date})</span>
              </div>
              <TodaySection snap={today} />
            </div>
          )}

          {/* Headcount */}
          {headcount && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Headcount — {headcount.totalActive} active employees</h2>
              </div>
              <HeadcountSection hc={headcount} />
            </div>
          )}

          {/* Org-wide attendance trend */}
          {trend.length > 0 && (
            <TrendSection rows={trend} title="Org-wide Attendance Trend (6 months)" />
          )}

          {/* Team attendance trend */}
          {teamTrend.length > 0 && (
            <TrendSection rows={teamTrend} title="My Team Attendance Trend (6 months)" />
          )}

          {/* Leave utilisation */}
          {leaveUtil.length > 0 && (
            <LeaveUtilSection rows={leaveUtil} />
          )}

          {!today && !headcount && trend.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
              <BarChart2 className="size-10 text-muted-foreground/40" />
              <p className="text-base font-semibold">No report data yet</p>
              <p className="text-sm text-muted-foreground">Data will appear as employees check in and use leave.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
