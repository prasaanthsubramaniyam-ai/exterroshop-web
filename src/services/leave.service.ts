import client, { unwrap } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LeaveType {
  id:        number;
  code:      string;
  name:      string;
  totalDays: number;
  active:    boolean;
}

export interface LeaveBalance {
  id:             number;
  leaveTypeCode:  string;
  leaveTypeName:  string;
  totalDays:      number;
  usedDays:       number;
  remainingDays:  number;
  fiscalYear:     string;
}

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveRequest {
  id:             number;
  userId:         number;
  userName:       string;
  userAvatarUrl?: string;
  leaveTypeCode:  string;
  leaveTypeName:  string;
  fromDate:       string;   // "YYYY-MM-DD"
  toDate:         string;
  totalDays:      number;
  reason?:        string;
  status:         LeaveStatus;
  reviewedByName?: string;
  reviewedAt?:    string;
  reviewerNote?:  string;
  createdAt:      string;
}

export interface ApplyLeavePayload {
  leaveTypeCode: string;
  fromDate:      string;
  toDate:        string;
  reason?:       string;
}

// ── Service ────────────────────────────────────────────────────────────────

export const leaveService = {
  getTypes: (): Promise<LeaveType[]> =>
    client.get<{ data: LeaveType[] }>("/leave/types").then((r) => unwrap(r)),

  getBalances: (): Promise<LeaveBalance[]> =>
    client.get<{ data: LeaveBalance[] }>("/leave/balances").then((r) => unwrap(r)),

  getMyRequests: (): Promise<LeaveRequest[]> =>
    client.get<{ data: LeaveRequest[] }>("/leave/requests").then((r) => unwrap(r)),

  apply: (payload: ApplyLeavePayload): Promise<LeaveRequest> =>
    client.post<{ data: LeaveRequest }>("/leave/requests", payload).then((r) => unwrap(r)),

  cancel: (id: number): Promise<LeaveRequest> =>
    client.patch<{ data: LeaveRequest }>(`/leave/requests/${id}/cancel`).then((r) => unwrap(r)),

  // ── Manager endpoints ────────────────────────────────────────────────────

  getPendingApprovals: (): Promise<LeaveRequest[]> =>
    client.get<{ data: LeaveRequest[] }>("/leave/approvals").then((r) => unwrap(r)),

  approve: (id: number, note?: string): Promise<LeaveRequest> =>
    client.patch<{ data: LeaveRequest }>(`/leave/approvals/${id}/approve`, { note }).then((r) => unwrap(r)),

  reject: (id: number, note?: string): Promise<LeaveRequest> =>
    client.patch<{ data: LeaveRequest }>(`/leave/approvals/${id}/reject`, { note }).then((r) => unwrap(r)),
};
