/**
 * Reports & Insights — extended service layer.
 * The original reportsService in reports.service.ts is preserved unchanged.
 */
import client, { unwrap } from "./api";

// ── Executive Dashboard ────────────────────────────────────────────────────

export interface ExecutiveDashboard {
  totalEmployees:      number;
  activeEmployees:     number;
  attendancePct:       number;
  leavePct:            number;
  engagementScore:     number;
  eventParticipation:  number;
  marketplaceActivity: number;
  beautyServicesUsage: number;
  newJoinersThisMonth: number;
  pendingApprovals:    number;
  attendanceTrend:     AttendanceTrendRow[];
}

export interface AttendanceTrendRow {
  year: number; month: number; monthName: string;
  present: number; absent: number; wfh: number;
  halfDay: number; onLeave: number; totalWorkingDays: number;
}

// ── Workforce ─────────────────────────────────────────────────────────────

export interface EmployeeMasterRow {
  id:           number;
  name:         string;
  email:        string;
  phone:        string | null;
  role:         string;
  department:   string | null;
  designation:  string | null;
  location:     string | null;
  employeeCode: string | null;
  joiningDate:  string | null;
  active:       boolean;
  gender:       string | null;
  avatarUrl:    string | null;
}

export interface AttendanceDetailRow {
  userId:          number;
  userName:        string;
  department:      string | null;
  workDate:        string;
  checkInTime:     string | null;
  checkOutTime:    string | null;
  status:          string;
  workMode:        string;
  durationMinutes: number | null;
  isLate:          boolean;
  isEarlyLogout:   boolean;
}

export interface LeaveBalanceSummary {
  userId:     number;
  userName:   string;
  department: string | null;
  balances:   Array<{
    leaveTypeCode: string;
    leaveTypeName: string;
    totalDays:     number;
    usedDays:      number;
    remainingDays: number;
  }>;
}

export interface PendingApprovalReport {
  requestId:           number;
  employeeName:        string;
  department:          string | null;
  leaveType:           string;
  fromDate:            string;
  toDate:              string;
  days:                number;
  reason:              string | null;
  submittedAt:         string;
  currentApproverName: string;
  stepNumber:          number;
  totalSteps:          number;
}

export interface TeamSummaryReport {
  teamId:                number;
  teamName:              string;
  leadName:              string;
  headcount:             number;
  presentToday:          number;
  onLeaveToday:          number;
  absentToday:           number;
  attendancePctThisMonth: number;
}

// ── Engagement ─────────────────────────────────────────────────────────────

export interface SportEventReport {
  eventId:           number;
  eventName:         string;
  eventDate:         string | null;
  status:            string;
  totalRegistrations: number;
  capacity:          number;
  byDepartment:      Record<string, number>;
  byType:            Record<string, number>;
}

export interface EngagementStats {
  totalSurveys:          number;
  activeSurveys:         number;
  totalSurveyResponses:  number;
  surveyParticipationPct: number;
  kudosGivenThisMonth:   number;
  kudosGivenAllTime:     number;
  uniqueRecognizers:     number;
  topRecipients:         Array<{ name: string; avatarUrl: string | null; points: number }>;
  challenges:            ActivityStats;
  csr:                   ActivityStats;
  learning:              ActivityStats;
  wellness:              ActivityStats;
}

export interface ActivityStats {
  kind:               string;
  totalActivities:    number;
  totalRegistrations: number;
  completions:        number;
}

// ── Business ──────────────────────────────────────────────────────────────

export interface MarketplaceReport {
  totalListings:      number;
  activeListings:     number;
  soldListings:       number;
  totalChats:         number;
  totalCallRequests:  number;
  byCategory:         Record<string, number>;
  totalListedValue:   number;
  totalSoldValue:     number;
}

// ── Export ────────────────────────────────────────────────────────────────

export interface ExportJob {
  id:              number;
  reportType:      string;
  exportFormat:    string;
  status:          "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  fileUrl:         string | null;
  fileSizeBytes:   number | null;
  errorMessage:    string | null;
  requestedByName: string | null;
  requestedAt:     string;
  completedAt:     string | null;
  expiresAt:       string | null;
}

export interface CreateExportRequest {
  reportType:   string;
  exportFormat: "XLSX" | "CSV" | "PDF";
  filters?:     Record<string, unknown>;
}

// ── Scheduled Reports ─────────────────────────────────────────────────────

export interface ScheduledReport {
  id:            number;
  name:          string;
  reportType:    string;
  frequency:     "DAILY" | "WEEKLY" | "MONTHLY";
  delivery:      "EMAIL" | "IN_APP";
  recipients:    unknown;
  filters:       Record<string, unknown>;
  active:        boolean;
  nextRunAt:     string | null;
  lastRunAt:     string | null;
  createdByName: string | null;
  createdAt:     string;
}

export interface CreateScheduledReportRequest {
  name:       string;
  reportType: string;
  frequency:  "DAILY" | "WEEKLY" | "MONTHLY";
  delivery:   "EMAIL" | "IN_APP";
  recipients?: unknown;
  filters?:    Record<string, unknown>;
}

// ── Service object ────────────────────────────────────────────────────────

export const reportsInsightsService = {

  // Executive
  getExecutiveDashboard: (): Promise<ExecutiveDashboard> =>
    client.get<{ data: ExecutiveDashboard }>("/reports/executive-dashboard").then((r) => unwrap(r)),

  // Employee
  getEmployeeMaster: (params?: { dept?: string; role?: string; location?: string }): Promise<EmployeeMasterRow[]> => {
    const q = new URLSearchParams();
    if (params?.dept)     q.set("dept",     params.dept);
    if (params?.role)     q.set("role",     params.role);
    if (params?.location) q.set("location", params.location);
    return client.get<{ data: EmployeeMasterRow[] }>(`/reports/employees/master?${q}`).then((r) => unwrap(r));
  },

  getNewJoiners: (from?: string, to?: string): Promise<EmployeeMasterRow[]> => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to)   q.set("to",   to);
    return client.get<{ data: EmployeeMasterRow[] }>(`/reports/employees/new-joiners?${q}`).then((r) => unwrap(r));
  },

  getDepartmentSummary: (): Promise<Record<string, unknown>> =>
    client.get<{ data: Record<string, unknown> }>("/reports/departments/summary").then((r) => unwrap(r)),

  getDesignationSummary: (): Promise<Record<string, unknown>> =>
    client.get<{ data: Record<string, unknown> }>("/reports/designations/summary").then((r) => unwrap(r)),

  // Attendance
  getDailyAttendance: (date?: string): Promise<AttendanceDetailRow[]> => {
    const q = date ? `?date=${date}` : "";
    return client.get<{ data: AttendanceDetailRow[] }>(`/reports/attendance/daily${q}`).then((r) => unwrap(r));
  },

  getMonthlyAttendance: (year?: number, month?: number): Promise<AttendanceDetailRow[]> => {
    const q = new URLSearchParams();
    if (year)  q.set("year",  String(year));
    if (month) q.set("month", String(month));
    return client.get<{ data: AttendanceDetailRow[] }>(`/reports/attendance/monthly?${q}`).then((r) => unwrap(r));
  },

  getLateCheckIns: (from?: string, to?: string): Promise<AttendanceDetailRow[]> => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to)   q.set("to",   to);
    return client.get<{ data: AttendanceDetailRow[] }>(`/reports/attendance/late-checkins?${q}`).then((r) => unwrap(r));
  },

  getEarlyLogouts: (from?: string, to?: string): Promise<AttendanceDetailRow[]> => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to)   q.set("to",   to);
    return client.get<{ data: AttendanceDetailRow[] }>(`/reports/attendance/early-logouts?${q}`).then((r) => unwrap(r));
  },

  getMissedCheckIns: (from?: string, to?: string): Promise<AttendanceDetailRow[]> => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to)   q.set("to",   to);
    return client.get<{ data: AttendanceDetailRow[] }>(`/reports/attendance/missed-checkins?${q}`).then((r) => unwrap(r));
  },

  // Leave
  getLeaveBalanceSummary: (): Promise<LeaveBalanceSummary[]> =>
    client.get<{ data: LeaveBalanceSummary[] }>("/reports/leave/balance-summary").then((r) => unwrap(r)),

  getPendingApprovals: (): Promise<PendingApprovalReport[]> =>
    client.get<{ data: PendingApprovalReport[] }>("/reports/leave/pending-approvals").then((r) => unwrap(r)),

  // Teams
  getTeamsSummary: (): Promise<TeamSummaryReport[]> =>
    client.get<{ data: TeamSummaryReport[] }>("/reports/teams/summary").then((r) => unwrap(r)),

  // Engagement
  getSportsReport: (): Promise<SportEventReport[]> =>
    client.get<{ data: SportEventReport[] }>("/reports/engagement/sports").then((r) => unwrap(r)),

  getEngagementStats: (): Promise<EngagementStats> =>
    client.get<{ data: EngagementStats }>("/reports/engagement/stats").then((r) => unwrap(r)),

  // Business
  getMarketplaceReport: (): Promise<MarketplaceReport> =>
    client.get<{ data: MarketplaceReport }>("/reports/business/marketplace").then((r) => unwrap(r)),

  // Export
  createExport: (req: CreateExportRequest): Promise<ExportJob> =>
    client.post<{ data: ExportJob }>("/reports/export", req).then((r) => unwrap(r)),

  getExportJobs: (): Promise<ExportJob[]> =>
    client.get<{ data: ExportJob[] }>("/reports/export/jobs").then((r) => unwrap(r)),

  getExportJob: (id: number): Promise<ExportJob> =>
    client.get<{ data: ExportJob }>(`/reports/export/jobs/${id}`).then((r) => unwrap(r)),

  downloadExport: (id: number): Promise<string> =>
    client.get<{ data: string }>(`/reports/export/jobs/${id}/download`).then((r) => unwrap(r)),

  // Scheduled
  getScheduledReports: (): Promise<ScheduledReport[]> =>
    client.get<{ data: ScheduledReport[] }>("/reports/scheduled").then((r) => unwrap(r)),

  createScheduledReport: (req: CreateScheduledReportRequest): Promise<ScheduledReport> =>
    client.post<{ data: ScheduledReport }>("/reports/scheduled", req).then((r) => unwrap(r)),

  toggleScheduledReport: (id: number, active: boolean): Promise<ScheduledReport> =>
    client.patch<{ data: ScheduledReport }>(`/reports/scheduled/${id}/toggle?active=${active}`, {}).then((r) => unwrap(r)),

  deleteScheduledReport: (id: number): Promise<void> =>
    client.delete(`/reports/scheduled/${id}`).then(() => undefined),
};
