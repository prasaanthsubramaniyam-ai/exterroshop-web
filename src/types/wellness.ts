export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type GenderType = "MALE_ONLY" | "FEMALE_ONLY" | "ALL";
export type UserRole = "EMPLOYEE_USER" | "STAFF" | "SUPER_ADMIN";

export interface WellnessCenter {
  id: number;
  name: string;
  genderType: GenderType;
  location: string;
  description?: string;
  active: boolean;
  serviceCount: number;
  staffCount: number;
}

export interface WellnessService {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  bufferMinutes: number;
  genderType: GenderType;
  icon?: string;
  active: boolean;
}

export interface StaffProfile {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  gender?: string;
  centerId: number;
  centerName: string;
  specialization?: string;
  workingStart: string;
  workingEnd: string;
  workingDays: string;
  active: boolean;
}

export interface WellnessBooking {
  id: number;
  employeeId: number;
  employeeName: string;
  staffId: number;
  staffName: string;
  centerId: number;
  centerName: string;
  serviceId: number;
  serviceName: string;
  durationMinutes: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface WellnessUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  gender?: string;
  phone?: string;
  department?: string;
  employeeId?: string;
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
  // EMS V16 structured fields (returned by backend, used to pre-fill Edit modal)
  departmentId?: number | null;
  designationId?: number | null;
  jobTitle?: string;
  workLocation?: string;
  employmentType?: string;
  userStatus?: string;
}

export interface WellnessPageResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface BulkUploadResult {
  id: number;
  fileName: string;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  uploadStatus: string;
  errors: string[];
  createdAt: string;
}

export interface CalendarDay {
  date: string;
  bookings: WellnessBooking[];
  availableSlots: AvailableSlot[];
}

export interface CalendarWeek {
  weekStart: string;
  weekEnd: string;
  days: CalendarDay[];
}

export interface CreateBookingPayload {
  staffId: number;
  centerId: number;
  serviceId: number;
  bookingDate: string;
  startTime: string;
  notes?: string;
}

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
  rejectionReason?: string;
}

export interface CreateCenterPayload {
  name: string;
  genderType: string;
  location: string;
  description?: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  durationMinutes: number;
  bufferMinutes: number;
  genderType?: string;
  icon?: string;
}

export interface AssignStaffPayload {
  userId: number;
  centerId: number;
  specialization?: string;
  workingStart?: string;
  workingEnd?: string;
  workingDays?: string;
}

export interface CreateWellnessUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  gender: string;
  phone: string;
  employeeId: string;
  department?: string;
}

export interface UpdateWellnessUserPayload {
  name: string;
  email?: string;
  role: string;
  gender: string;
  phone: string;
  employeeId: string;
  department?: string;
  // EMS V16 structured fields
  departmentId?: number | null;
  designationId?: number | null;
  jobTitle?: string;
  workLocation?: string;
  employmentType?: string;
  userStatus?: string;
}
