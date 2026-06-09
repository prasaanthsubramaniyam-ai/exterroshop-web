import client, { unwrap } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────

export interface HeadcountReport {
  totalActive:  number;
  byDepartment: Record<string, number>;
  byLocation:   Record<string, number>;
  byRole:       Record<string, number>;
}

export interface AttendanceTrend {
  year:             number;
  month:            number;
  monthName:        string;
  present:          number;
  absent:           number;
  wfh:              number;
  halfDay:          number;
  onLeave:          number;
  totalWorkingDays: number;
}

export interface LeaveUtilisation {
  leaveTypeCode:        string;
  leaveTypeName:        string;
  employeesWithBalance: number;
  totalAllotted:        number;
  totalUsed:            number;
  totalRemaining:       number;
  utilisationPct:       number;
}

export interface TodaySnapshot {
  totalActive:  number;
  checkedIn:    number;
  checkedOut:   number;
  onLeave:      number;
  notYetIn:     number;
  date:         string;
}

// ── Service ────────────────────────────────────────────────────────────────

export const reportsService = {
  getHeadcount: (): Promise<HeadcountReport> =>
    client.get<{ data: HeadcountReport }>("/reports/headcount").then((r) => unwrap(r)),

  getToday: (): Promise<TodaySnapshot> =>
    client.get<{ data: TodaySnapshot }>("/reports/today").then((r) => unwrap(r)),

  getAttendanceTrend: (months = 6): Promise<AttendanceTrend[]> =>
    client.get<{ data: AttendanceTrend[] }>(`/reports/attendance-trend?months=${months}`).then((r) => unwrap(r)),

  getLeaveUtilisation: (): Promise<LeaveUtilisation[]> =>
    client.get<{ data: LeaveUtilisation[] }>("/reports/leave-utilisation").then((r) => unwrap(r)),

  getTeamAttendanceTrend: (months = 6): Promise<AttendanceTrend[]> =>
    client.get<{ data: AttendanceTrend[] }>(`/reports/team-attendance?months=${months}`).then((r) => unwrap(r)),
};
