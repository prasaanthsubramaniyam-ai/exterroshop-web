"use client";

import * as React from "react";
import Image from "next/image";
import {
  Users, Clock, CalendarOff, UsersRound,
  ChevronDown, ChevronRight, Loader2,
  Search, UserMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  reportsInsightsService,
  type EmployeeMasterRow,
  type AttendanceDetailRow,
  type LeaveBalanceSummary,
  type PendingApprovalReport,
  type TeamSummaryReport,
} from "@/services/reports-insights.service";
import { ExportButton } from "../components/ExportButton";

// ── Section accordion ─────────────────────────────────────────────────────────

function Section({
  icon: Icon, title, badge, children, defaultOpen = false,
}: {
  icon: React.ElementType;
  title: string;
  badge?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-foreground/70" />
        </div>
        <span className="flex-1 text-sm font-semibold">{title}</span>
        {badge !== undefined && (
          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold">
            {badge}
          </span>
        )}
        {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-border">{children}</div>}
    </div>
  );
}

// ── Sub-report selector ───────────────────────────────────────────────────────

function SubReportChips({
  options, selected, onChange,
}: {
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            selected === o
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ── Employee Master table ─────────────────────────────────────────────────────

function EmployeeMasterTable({ rows }: { rows: EmployeeMasterRow[] }) {
  const [q, setQ] = React.useState("");
  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(q.toLowerCase()) ||
    (r.email?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search employees…"
            className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30"
          />
        </div>
        <ExportButton reportType="employees/master" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr>
              {["Name","Email","Role","Department","Designation","Location","Code","Joining Date","Status"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No employees found</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {r.avatarUrl ? (
                      <Image src={r.avatarUrl} alt="" width={24} height={24} className="size-6 rounded-full object-cover" />
                    ) : (
                      <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                        {r.name.charAt(0)}
                      </div>
                    )}
                    {r.name}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.email}</td>
                <td className="px-3 py-2.5"><RoleBadge role={r.role} /></td>
                <td className="px-3 py-2.5">{r.department ?? "—"}</td>
                <td className="px-3 py-2.5">{r.designation ?? "—"}</td>
                <td className="px-3 py-2.5">{r.location ?? "—"}</td>
                <td className="px-3 py-2.5 font-mono">{r.employeeCode ?? "—"}</td>
                <td className="px-3 py-2.5">{r.joiningDate ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    r.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                             : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  )}>
                    {r.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} of {rows.length} employees</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    SUPER_ADMIN:   "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    HR:            "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    MANAGER:       "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    EMPLOYEE_USER: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    FINANCE:       "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", map[role] ?? "bg-muted text-muted-foreground")}>
      {role.replace("_", " ")}
    </span>
  );
}

// ── Attendance table ──────────────────────────────────────────────────────────

function AttendanceTable({ rows, loading }: { rows: AttendanceDetailRow[]; loading: boolean }) {
  if (loading) return <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr>
            {["Employee","Dept","Date","Check In","Check Out","Status","Mode","Duration","Late","Early Out"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={10} className="py-8 text-center text-muted-foreground">No records</td></tr>
          ) : rows.map((r, i) => (
            <tr key={`${r.userId}-${r.workDate}-${i}`} className="border-t border-border/40 hover:bg-muted/20">
              <td className="px-3 py-2 font-medium">{r.userName}</td>
              <td className="px-3 py-2 text-muted-foreground">{r.department ?? "—"}</td>
              <td className="px-3 py-2">{r.workDate}</td>
              <td className="px-3 py-2">{r.checkInTime ?? "—"}</td>
              <td className="px-3 py-2">{r.checkOutTime ?? "—"}</td>
              <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
              <td className="px-3 py-2">{r.workMode}</td>
              <td className="px-3 py-2">{r.durationMinutes != null ? `${r.durationMinutes}m` : "—"}</td>
              <td className="px-3 py-2">{r.isLate ? <span className="text-amber-600 font-bold">Yes</span> : "No"}</td>
              <td className="px-3 py-2">{r.isEarlyLogout ? <span className="text-orange-600 font-bold">Yes</span> : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PRESENT:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    ABSENT:   "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    HALF_DAY: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    ON_LEAVE: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", map[status] ?? "bg-muted text-muted-foreground")}>
      {status.replace("_", " ")}
    </span>
  );
}

// ── Leave Balance table ───────────────────────────────────────────────────────

function LeaveBalanceTable({ rows }: { rows: LeaveBalanceSummary[] }) {
  const [q, setQ] = React.useState("");
  const filtered = rows.filter(r => r.userName.toLowerCase().includes(q.toLowerCase()));
  const allTypes = Array.from(new Set(rows.flatMap(r => r.balances.map(b => b.leaveTypeCode))));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search employee…"
            className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
        </div>
        <ExportButton reportType="leave/balance" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Employee</th>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Dept</th>
              {allTypes.map(t => (
                <th key={t} className="px-3 py-2.5 text-center font-semibold text-muted-foreground">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.userId} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{r.userName}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.department ?? "—"}</td>
                {allTypes.map(t => {
                  const b = r.balances.find(b => b.leaveTypeCode === t);
                  return (
                    <td key={t} className="px-3 py-2 text-center">
                      {b ? (
                        <span title={`Used: ${b.usedDays} / ${b.totalDays}`}>
                          <span className="font-bold">{Number(b.remainingDays).toFixed(0)}</span>
                          <span className="text-muted-foreground">/{b.totalDays}</span>
                        </span>
                      ) : <span className="text-muted-foreground/40">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Pending Approvals table ───────────────────────────────────────────────────

function PendingApprovalsTable({ rows }: { rows: PendingApprovalReport[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr>
            {["Employee","Dept","Leave Type","From","To","Days","Approver","Steps","Submitted"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No pending approvals</td></tr>
          ) : rows.map(r => (
            <tr key={r.requestId} className="border-t border-border/40 hover:bg-muted/20">
              <td className="px-3 py-2 font-medium">{r.employeeName}</td>
              <td className="px-3 py-2 text-muted-foreground">{r.department ?? "—"}</td>
              <td className="px-3 py-2">{r.leaveType}</td>
              <td className="px-3 py-2">{r.fromDate}</td>
              <td className="px-3 py-2">{r.toDate}</td>
              <td className="px-3 py-2 font-bold">{r.days}</td>
              <td className="px-3 py-2">{r.currentApproverName}</td>
              <td className="px-3 py-2">
                <span className="font-mono">{r.stepNumber}/{r.totalSteps}</span>
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Team Summary ──────────────────────────────────────────────────────────────

function TeamSummaryTable({ rows }: { rows: TeamSummaryReport[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.length === 0 ? (
        <div className="col-span-full py-8 text-center text-sm text-muted-foreground">No teams found</div>
      ) : rows.map(t => (
        <div key={t.teamId} className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm">{t.teamName}</p>
              <p className="text-xs text-muted-foreground">Lead: {t.leadName}</p>
            </div>
            <span className="text-lg font-bold tabular-nums">{t.headcount}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 py-1.5">
              <div className="font-bold text-emerald-600">{t.presentToday}</div>
              <div className="text-muted-foreground">Present</div>
            </div>
            <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 py-1.5">
              <div className="font-bold text-violet-600">{t.onLeaveToday}</div>
              <div className="text-muted-foreground">Leave</div>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 py-1.5">
              <div className="font-bold text-red-600">{t.absentToday}</div>
              <div className="text-muted-foreground">Absent</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Month attendance</span>
              <span className="font-bold">{t.attendancePctThisMonth}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${t.attendancePctThisMonth}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Attendance sub-section ────────────────────────────────────────────────────

function AttendanceSection() {
  const OPTIONS = ["Daily", "Monthly", "Late Check-ins", "Early Logouts", "Missed Check-ins"];
  const [selected, setSelected] = React.useState("Daily");
  const [rows, setRows]         = React.useState<AttendanceDetailRow[]>([]);
  const [loading, setLoading]   = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    const p: Promise<AttendanceDetailRow[]> = selected === "Daily"          ? reportsInsightsService.getDailyAttendance()
           : selected === "Monthly"         ? reportsInsightsService.getMonthlyAttendance()
           : selected === "Late Check-ins"  ? reportsInsightsService.getLateCheckIns()
           : selected === "Early Logouts"   ? reportsInsightsService.getEarlyLogouts()
                                            : reportsInsightsService.getMissedCheckIns();
    p.then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, [selected]);

  return (
    <div>
      <SubReportChips options={OPTIONS} selected={selected} onChange={setSelected} />
      <AttendanceTable rows={rows} loading={loading} />
    </div>
  );
}

// ── Employee sub-section ──────────────────────────────────────────────────────

function EmployeeSection() {
  const OPTIONS = ["Employee Master", "New Joiners"];
  const [selected, setSelected] = React.useState("Employee Master");
  const [rows, setRows]         = React.useState<EmployeeMasterRow[]>([]);
  const [loading, setLoading]   = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const p = selected === "Employee Master"
      ? reportsInsightsService.getEmployeeMaster()
      : reportsInsightsService.getNewJoiners();
    p.then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, [selected]);

  return (
    <div>
      <SubReportChips options={OPTIONS} selected={selected} onChange={setSelected} />
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <EmployeeMasterTable rows={rows} />
      )}
    </div>
  );
}

// ── Leave sub-section ─────────────────────────────────────────────────────────

function LeaveSection() {
  const OPTIONS = ["Leave Balance", "Pending Approvals"];
  const [selected, setSelected]   = React.useState("Leave Balance");
  const [balances, setBalances]   = React.useState<LeaveBalanceSummary[]>([]);
  const [approvals, setApprovals] = React.useState<PendingApprovalReport[]>([]);
  const [loading, setLoading]     = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    if (selected === "Leave Balance") {
      reportsInsightsService.getLeaveBalanceSummary()
        .then(setBalances).catch(() => setBalances([])).finally(() => setLoading(false));
    } else {
      reportsInsightsService.getPendingApprovals()
        .then(setApprovals).catch(() => setApprovals([])).finally(() => setLoading(false));
    }
  }, [selected]);

  return (
    <div>
      <SubReportChips options={OPTIONS} selected={selected} onChange={setSelected} />
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : selected === "Leave Balance" ? (
        <LeaveBalanceTable rows={balances} />
      ) : (
        <PendingApprovalsTable rows={approvals} />
      )}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function WorkforceReportsTab() {
  const [teams, setTeams]   = React.useState<TeamSummaryReport[]>([]);
  const [teamsLoaded, setTeamsLoaded] = React.useState(false);

  return (
    <div className="space-y-3">
      <Section icon={Users} title="Employee Reports" defaultOpen={true}>
        <EmployeeSection />
      </Section>

      <Section icon={Clock} title="Attendance Reports">
        <AttendanceSection />
      </Section>

      <Section icon={CalendarOff} title="Leave Reports">
        <LeaveSection />
      </Section>

      <Section
        icon={UsersRound}
        title="Team Reports"
        badge={teams.length || undefined}
      >
        {!teamsLoaded ? (
          <TeamLoader onLoad={(data) => { setTeams(data); setTeamsLoaded(true); }} />
        ) : (
          <TeamSummaryTable rows={teams} />
        )}
      </Section>

      <Section icon={UserMinus} title="Attrition Report">
        <AttritionReport />
      </Section>
    </div>
  );
}

function TeamLoader({ onLoad }: { onLoad: (data: TeamSummaryReport[]) => void }) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    reportsInsightsService.getTeamsSummary()
      .then(onLoad).catch(() => onLoad([])).finally(() => setLoading(false));
  }, [onLoad]);
  if (loading) return <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  return null;
}

// ── Attrition Report ──────────────────────────────────────────────────────────

function AttritionReport() {
  const now  = new Date();
  const [from, setFrom] = React.useState(
    new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10)
  );
  const [to, setTo]     = React.useState(now.toISOString().slice(0, 10));
  const [rows, setRows] = React.useState<EmployeeMasterRow[] | null>(null);

  const load = React.useCallback(() => {
    // inactive employees → attrition view (active=false in master)
    reportsInsightsService.getEmployeeMaster().then((all) =>
      setRows(all.filter((r) => !r.active))
    ).catch(() => setRows([]));
  }, []);

  React.useEffect(load, [load]);

  const filtered = React.useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (!r.joiningDate) return true;
      return true; // date filter would use exit date once backend provides it
    });
  }, [rows, from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 ring-primary/30"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 ring-primary/30"
          />
        </label>
        <ExportButton reportType="employees/attrition" />
      </div>

      {rows === null ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No inactive employees in this period.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr>
                {["Name","Department","Designation","Location","Joined","Status"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                  <td className="px-3 py-2.5 font-medium">{r.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.department ?? "—"}</td>
                  <td className="px-3 py-2.5">{r.designation ?? "—"}</td>
                  <td className="px-3 py-2.5">{r.location ?? "—"}</td>
                  <td className="px-3 py-2.5">{r.joiningDate ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                      Inactive
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} inactive employee{filtered.length !== 1 ? "s" : ""} found.
          Exit date field will be available after V38 migration.
        </p>
      )}
    </div>
  );
}
