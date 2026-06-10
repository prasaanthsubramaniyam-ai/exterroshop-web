import client, { unwrap } from "./api";

export type ReportingType = "PRIMARY" | "DOTTED" | "FUNCTIONAL" | "PROJECT";

export interface ReportingLine {
  id: number | null;          // null = synthesized primary (from manager_id)
  employeeId: number;
  employeeName: string;
  employeeAvatarUrl?: string;
  managerId: number;
  managerName: string;
  managerAvatarUrl?: string;
  managerDesignation?: string;
  reportingType: ReportingType;
  note?: string;
}

export const REPORTING_TYPE_STYLE: Record<ReportingType, string> = {
  PRIMARY:    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  DOTTED:     "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  FUNCTIONAL: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  PROJECT:    "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
};

export const reportingService = {
  getEmployeeLines: (employeeId: number): Promise<ReportingLine[]> =>
    client.get(`/reporting/employee/${employeeId}`).then((r) => unwrap<ReportingLine[]>(r)),

  getManagerReports: (managerId: number): Promise<ReportingLine[]> =>
    client.get(`/reporting/manager/${managerId}`).then((r) => unwrap<ReportingLine[]>(r)),

  addLine: (payload: { employeeId: number; managerId: number; reportingType: ReportingType; note?: string }): Promise<ReportingLine> =>
    client.post("/reporting", payload).then((r) => unwrap<ReportingLine>(r)),

  removeLine: (id: number): Promise<void> =>
    client.delete(`/reporting/${id}`).then(() => undefined),
};
