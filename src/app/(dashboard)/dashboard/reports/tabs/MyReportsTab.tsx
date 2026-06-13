"use client";

import * as React from "react";
import {
  Loader2, CalendarOff, FileText,
  CheckCircle2, AlertCircle, TrendingDown, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { attendanceService } from "@/services/attendance.service";
import { leaveService }     from "@/services/leave.service";
import { payslipService }   from "@/services/payslip.service";

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, colorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 flex flex-col gap-3">
      <div className={cn("flex size-9 items-center justify-center rounded-xl", colorClass)}>
        <Icon className="size-4 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-sm font-medium mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

// ── Attendance summary ─────────────────────────────────────────────────────────

function AttendanceSummary() {
  const [records, setRecords] = React.useState<Awaited<ReturnType<typeof attendanceService.getHistory>> | null>(null);

  React.useEffect(() => {
    const now = new Date();
    attendanceService.getHistory(now.getFullYear(), now.getMonth() + 1)
      .then(setRecords)
      .catch(() => setRecords([]));
  }, []);

  const present = records?.filter((r) => r.status === "PRESENT").length  ?? 0;
  const absent  = records?.filter((r) => r.status === "ABSENT").length   ?? 0;
  const onLeave = records?.filter((r) => r.status === "ON_LEAVE").length ?? 0;
  const halfDay = records?.filter((r) => r.status === "HALF_DAY").length ?? 0;
  const total   = records?.length ?? 0;
  const pct     = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <Section title="My attendance — this month">
      {records === null ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={CheckCircle2} label="Present"  value={present} sub={`${pct}% rate`}  colorClass="bg-emerald-500" />
            <StatCard icon={AlertCircle}  label="Absent"   value={absent}  sub="working days"     colorClass="bg-rose-500"    />
            <StatCard icon={CalendarOff}  label="On Leave" value={onLeave}                         colorClass="bg-amber-500"   />
            <StatCard icon={TrendingDown} label="Half-day" value={halfDay}                         colorClass="bg-blue-500"    />
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Attendance rate</span>
              <span className={pct >= 80 ? "text-emerald-600" : "text-rose-500"}>{pct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", pct >= 80 ? "bg-emerald-500" : "bg-rose-500")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{present} of {total} working days present</p>
          </div>
        </>
      )}
    </Section>
  );
}

// ── Leave balances ─────────────────────────────────────────────────────────────

function LeaveBalances() {
  const [balances, setBalances] = React.useState<Awaited<ReturnType<typeof leaveService.getBalances>> | null>(null);

  React.useEffect(() => {
    leaveService.getBalances().then(setBalances).catch(() => setBalances([]));
  }, []);

  return (
    <Section title="Leave balances">
      {balances === null ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : balances.length === 0 ? (
        <p className="text-sm text-muted-foreground">No leave types configured.</p>
      ) : (
        <div className="rounded-2xl border border-border bg-background divide-y divide-border overflow-hidden">
          {balances.map((b) => {
            const usedPct = b.totalDays > 0 ? (b.usedDays / b.totalDays) * 100 : 0;
            return (
              <div key={b.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{b.leaveTypeName}</p>
                    <p className="text-xs text-muted-foreground">{b.leaveTypeCode} · FY {b.fiscalYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">
                      <span className="text-emerald-600">{b.remainingDays}</span>
                      <span className="text-muted-foreground"> / {b.totalDays}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">days remaining</p>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ── Payslips list ──────────────────────────────────────────────────────────────

function PayslipsList() {
  const [slips, setSlips] = React.useState<Awaited<ReturnType<typeof payslipService.getMyPayslips>> | null>(null);

  React.useEffect(() => {
    payslipService.getMyPayslips().then(setSlips).catch(() => setSlips([]));
  }, []);

  const fmtPeriod = (s: string) => {
    const [y, m] = s.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-IN", { year: "numeric", month: "long" });
  };

  return (
    <Section title="Payslips">
      {slips === null ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : slips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          <FileText className="mx-auto mb-2 size-8 text-muted-foreground/30" />
          No payslips uploaded yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background divide-y divide-border overflow-hidden">
          {slips.slice(0, 6).map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-semibold">{fmtPeriod(s.payPeriod)}</p>
                <p className="text-xs text-muted-foreground">Uploaded {new Date(s.uploadedAt).toLocaleDateString("en-IN")}</p>
              </div>
              <a
                href={s.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                <Download className="size-3" /> {s.fileName}
              </a>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ── Tab entry point ────────────────────────────────────────────────────────────

export function MyReportsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold">My Reports</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your personal attendance, leave balances and payslips at a glance.
        </p>
      </div>
      <AttendanceSummary />
      <LeaveBalances />
      <PayslipsList />
    </div>
  );
}
