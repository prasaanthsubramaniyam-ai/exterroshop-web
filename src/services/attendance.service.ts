import client, { unwrap } from "./api";
import type { LocationCapture, DeviceCapture } from "@/utils/attendance.utils";

// ── Types ──────────────────────────────────────────────────────────────────

export type WorkMode = "OFFICE" | "WFH" | "FIELD";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_LEAVE" | "HOLIDAY" | "WEEKEND";

export interface LocationHistory {
  id?: number;
  eventType: "CHECK_IN" | "CHECK_OUT";
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  ipAddress?: string;
  accuracyMeters?: number;
  locationStatus: "CAPTURED" | "DENIED" | "TIMEOUT" | "UNAVAILABLE";
  capturedAt: string;
}

export interface DeviceHistory {
  id?: number;
  eventType: "CHECK_IN" | "CHECK_OUT";
  deviceId?: string;
  browser?: string;
  os?: string;
  platform?: string;
  timezone?: string;
  screenResolution?: string;
  capturedAt: string;
}

export interface AttendanceRecord {
  id: number;
  workDate: string;          // ISO date  "2025-05-27"
  checkInTime:  string | null;
  checkOutTime: string | null;
  workMode:  WorkMode;
  status:    AttendanceStatus;
  source:    "MANUAL" | "MOBILE" | "BIOMETRIC";
  durationMinutes: number | null;
  locationHistory: LocationHistory[];
  deviceHistory:   DeviceHistory[];
}

export interface AttendanceSummary {
  year:            number;
  month:           number;
  present:         number;
  absent:          number;
  wfh:             number;
  halfDay:         number;
  onLeave:         number;
  totalWorkingDays: number;
}

export interface TeamAttendanceMember {
  userId: number;
  name: string;
  avatarUrl?: string;
  designationTitle?: string;
  departmentName?: string;
  checkedIn: boolean;
  checkedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  workMode?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toLocationPayload(loc?: LocationCapture) {
  if (!loc) return undefined;
  return {
    latitude:       loc.status === "CAPTURED" ? loc.latitude       : undefined,
    longitude:      loc.status === "CAPTURED" ? loc.longitude      : undefined,
    accuracyMeters: loc.status === "CAPTURED" ? loc.accuracyMeters : undefined,
    status: loc.status,
  };
}

function toDevicePayload(dev?: DeviceCapture) {
  if (!dev) return undefined;
  return {
    deviceId:        dev.deviceId,
    browser:         dev.browser,
    os:              dev.os,
    platform:        dev.platform,
    userAgent:       dev.userAgent,
    timezone:        dev.timezone,
    screenResolution: dev.screenResolution,
  };
}

// ── Service ────────────────────────────────────────────────────────────────

export const attendanceService = {
  /** Today's team attendance for the logged-in user's department. */
  getTeamToday: (): Promise<TeamAttendanceMember[]> =>
    client
      .get<{ data: TeamAttendanceMember[] }>("/attendance/team-today")
      .then((r) => unwrap<TeamAttendanceMember[]>(r)),

  /** Check in for today with location + device. */
  checkIn: (
    workMode: WorkMode = "OFFICE",
    location?: LocationCapture,
    device?: DeviceCapture
  ): Promise<AttendanceRecord> =>
    client
      .post<{ data: AttendanceRecord }>("/attendance/checkin", {
        workMode,
        location: toLocationPayload(location),
        device:   toDevicePayload(device),
      })
      .then((r) => unwrap<AttendanceRecord>(r)),

  /** Check out for today with location + device. */
  checkOut: (location?: LocationCapture, device?: DeviceCapture): Promise<AttendanceRecord> =>
    client
      .post<{ data: AttendanceRecord }>("/attendance/checkout", {
        location: toLocationPayload(location),
        device:   toDevicePayload(device),
      })
      .then((r) => unwrap<AttendanceRecord>(r)),

  /** Get today's record. Returns null if not yet checked in. */
  getToday: (): Promise<AttendanceRecord | null> =>
    client
      .get<{ data: AttendanceRecord | null }>("/attendance/today")
      .then((r) => unwrap<AttendanceRecord | null>(r)),

  /** History for a given month (defaults to current month). */
  getHistory: (year?: number, month?: number): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (year)  params.set("year",  String(year));
    if (month) params.set("month", String(month));
    return client
      .get<{ data: AttendanceRecord[] }>(`/attendance/history?${params}`)
      .then((r) => unwrap<AttendanceRecord[]>(r));
  },

  /** Monthly summary counts. */
  getSummary: (year?: number, month?: number): Promise<AttendanceSummary> => {
    const params = new URLSearchParams();
    if (year)  params.set("year",  String(year));
    if (month) params.set("month", String(month));
    return client
      .get<{ data: AttendanceSummary }>(`/attendance/summary?${params}`)
      .then((r) => unwrap<AttendanceSummary>(r));
  },

  /** Location history for a specific attendance record. */
  getLocationHistory: (attendanceId: number): Promise<LocationHistory[]> =>
    client
      .get<{ data: LocationHistory[] }>(`/attendance/${attendanceId}/locations`)
      .then((r) => unwrap<LocationHistory[]>(r)),

  /** Device history for a specific attendance record. */
  getDeviceHistory: (attendanceId: number): Promise<DeviceHistory[]> =>
    client
      .get<{ data: DeviceHistory[] }>(`/attendance/${attendanceId}/devices`)
      .then((r) => unwrap<DeviceHistory[]>(r)),
};
