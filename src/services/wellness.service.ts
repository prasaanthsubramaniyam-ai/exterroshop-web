import client, { unwrap } from "./api";
import type {
  WellnessCenter,
  WellnessService,
  StaffProfile,
  WellnessBooking,
  AvailableSlot,
  WellnessUser,
  WellnessPageResponse,
  BulkUploadResult,
  CalendarDay,
  CalendarWeek,
  CreateBookingPayload,
  UpdateBookingStatusPayload,
  CreateCenterPayload,
  CreateServicePayload,
  AssignStaffPayload,
  CreateWellnessUserPayload,
  UpdateWellnessUserPayload,
} from "@/types/wellness";

const BASE = "/wellness";

// ── Centers ────────────────────────────────────────────────────────────────

export const centerService = {
  getAll: () =>
    client.get<{ data: WellnessCenter[] }>(`${BASE}/centers`).then(unwrap),

  getById: (id: number) =>
    client.get<{ data: WellnessCenter }>(`${BASE}/centers/${id}`).then(unwrap),

  create: (payload: CreateCenterPayload) =>
    client.post<{ data: WellnessCenter }>(`${BASE}/centers`, payload).then(unwrap),

  update: (id: number, payload: CreateCenterPayload) =>
    client.put<{ data: WellnessCenter }>(`${BASE}/centers/${id}`, payload).then(unwrap),

  deactivate: (id: number) =>
    client.delete(`${BASE}/centers/${id}`),

  addService: (centerId: number, serviceId: number) =>
    client.post(`${BASE}/centers/${centerId}/services/${serviceId}`),

  removeService: (centerId: number, serviceId: number) =>
    client.delete(`${BASE}/centers/${centerId}/services/${serviceId}`),
};

// ── Services ───────────────────────────────────────────────────────────────

export const wellnessServiceApi = {
  getAll: () =>
    client.get<{ data: WellnessService[] }>(`${BASE}/services`).then(unwrap),

  getById: (id: number) =>
    client.get<{ data: WellnessService }>(`${BASE}/services/${id}`).then(unwrap),

  create: (payload: CreateServicePayload) =>
    client.post<{ data: WellnessService }>(`${BASE}/services`, payload).then(unwrap),

  update: (id: number, payload: CreateServicePayload) =>
    client.put<{ data: WellnessService }>(`${BASE}/services/${id}`, payload).then(unwrap),

  deactivate: (id: number) =>
    client.delete(`${BASE}/services/${id}`),
};

// ── Staff ──────────────────────────────────────────────────────────────────

export const staffService = {
  getAll: () =>
    client.get<{ data: StaffProfile[] }>(`${BASE}/staff`).then(unwrap),

  getByCenter: (centerId: number) =>
    client.get<{ data: StaffProfile[] }>(`${BASE}/staff/center/${centerId}`).then(unwrap),

  assign: (payload: AssignStaffPayload) =>
    client.post<{ data: StaffProfile }>(`${BASE}/staff/assign`, payload).then(unwrap),

  updateSchedule: (staffId: number, payload: Partial<AssignStaffPayload>) =>
    client.put<{ data: StaffProfile }>(`${BASE}/staff/${staffId}/schedule`, payload).then(unwrap),

  getSlots: (staffId: number, date: string, serviceId: number) =>
    client
      .get<{ data: AvailableSlot[] }>(`${BASE}/staff/${staffId}/slots`, {
        params: { date, serviceId },
      })
      .then(unwrap),

  blockSlot: (staffId: number, payload: { date: string; startTime: string; endTime: string; reason?: string }) =>
    client.post(`${BASE}/staff/${staffId}/block`, payload),
};

// ── Bookings ───────────────────────────────────────────────────────────────

export const bookingService = {
  create: (payload: CreateBookingPayload) =>
    client.post<{ data: WellnessBooking }>(`${BASE}/bookings`, payload).then(unwrap),

  myBookings: () =>
    client.get<{ data: WellnessBooking[] }>(`${BASE}/bookings/my`).then(unwrap),

  staffBookings: () =>
    client.get<{ data: WellnessBooking[] }>(`${BASE}/bookings/staff`).then(unwrap),

  all: (params?: { status?: string; centerId?: number }) =>
    client.get<{ data: WellnessBooking[] }>(`${BASE}/bookings`, { params }).then(unwrap),

  getById: (id: number) =>
    client.get<{ data: WellnessBooking }>(`${BASE}/bookings/${id}`).then(unwrap),

  updateStatus: (id: number, payload: UpdateBookingStatusPayload) =>
    client.patch<{ data: WellnessBooking }>(`${BASE}/bookings/${id}/status`, payload).then(unwrap),

  cancel: (id: number) =>
    client.delete(`${BASE}/bookings/${id}`),
};

// ── Calendar ───────────────────────────────────────────────────────────────

export const calendarService = {
  day: (date: string, params?: { centerId?: number; staffId?: number }) =>
    client.get<{ data: CalendarDay }>(`${BASE}/calendar/day`, { params: { date, ...params } }).then(unwrap),

  week: (weekStart: string, params?: { centerId?: number; staffId?: number }) =>
    client.get<{ data: CalendarWeek }>(`${BASE}/calendar/week`, { params: { weekStart, ...params } }).then(unwrap),

  month: (year: number, month: number, params?: { centerId?: number; staffId?: number }) =>
    client.get<{ data: CalendarDay[] }>(`${BASE}/calendar/month`, { params: { year, month, ...params } }).then(unwrap),
};

// ── Users ──────────────────────────────────────────────────────────────────

export const wellnessUserService = {
  getAll: (params?: { page?: number; size?: number; role?: string; search?: string }) =>
    client.get<{ data: WellnessPageResponse<WellnessUser> }>(`${BASE}/users`, { params }).then(unwrap),

  getById: (id: number) =>
    client.get<{ data: WellnessUser }>(`${BASE}/users/${id}`).then(unwrap),

  create: (payload: CreateWellnessUserPayload) =>
    client.post<{ data: WellnessUser }>(`${BASE}/users`, payload).then(unwrap),

  update: (id: number, payload: UpdateWellnessUserPayload) =>
    client.put<{ data: WellnessUser }>(`${BASE}/users/${id}`, payload).then(unwrap),

  delete: (id: number) =>
    client.delete(`${BASE}/users/${id}`),

  resetPassword: (id: number, newPassword: string) =>
    client.patch<{ data: WellnessUser }>(`${BASE}/users/${id}/reset-password`, { newPassword }),
};

// ── Bulk Upload ────────────────────────────────────────────────────────────

export const bulkUploadService = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client
      .post<{ data: BulkUploadResult }>(`${BASE}/bulk-upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrap);
  },

  downloadTemplate: () =>
    client.get(`${BASE}/bulk-upload/template`, { responseType: "blob" }),

  history: (page = 0, size = 10) =>
    client
      .get<{ data: BulkUploadResult[] }>(`${BASE}/bulk-upload/history`, { params: { page, size } })
      .then(unwrap),
};
