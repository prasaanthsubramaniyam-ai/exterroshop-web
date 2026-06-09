"use client";

import client, { unwrap } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────────

export type EventStatus = "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type RegistrationType = "PARTICIPANT" | "VOLUNTEER";
export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED" | "WAITLISTED";

export const EVENT_TYPE_LABELS: Record<string, string> = {
  CRICKET: "Cricket", FOOTBALL: "Football", VOLLEYBALL: "Volleyball",
  BASKETBALL: "Basketball", BADMINTON: "Badminton", TABLE_TENNIS: "Table Tennis",
  CHESS: "Chess", CARROM: "Carrom", RUNNING: "Running", CYCLING: "Cycling",
  HACKATHON: "Hackathon", INNOVATION_DAY: "Innovation Day",
  TEAM_BUILDING: "Team Building", CSR_ACTIVITY: "CSR Activity",
  CULTURAL_EVENT: "Cultural Event",
};

export const STATUS_STYLE: Record<EventStatus, string> = {
  DRAFT:     "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  PUBLISHED: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  ONGOING:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  COMPLETED: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export interface SportsEvent {
  id: number;
  title: string;
  description?: string;
  eventType: string;
  category: string;
  location?: string;
  eventDate: string;
  registrationStart?: string;
  registrationEnd?: string;
  maxParticipants?: number;
  maxVolunteers?: number;
  status: EventStatus;
  bannerUrl?: string;
  createdBy?: string;
  createdAt?: string;
  participantCount: number;
  volunteerCount: number;
}

export interface SportsRegistration {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  bannerUrl?: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  avatarUrl?: string;
  registrationType: RegistrationType;
  status: RegistrationStatus;
  comments?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface SportsTeam {
  id: number;
  eventId: number;
  teamName: string;
  captainId?: number;
  captainName?: string;
  members: { id: number; name: string; email: string; avatarUrl?: string }[];
}

export interface SportsResult {
  id: number;
  eventId: number;
  eventTitle: string;
  eventType: string;
  bannerUrl?: string;
  winnerTeamId?: number;
  winnerTeamName?: string;
  runnerUpTeamId?: number;
  runnerUpTeamName?: string;
  remarks?: string;
  publishedAt: string;
}

export interface GalleryImage {
  id: number;
  eventId: number;
  eventTitle: string;
  imageUrl: string;
  caption?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

export interface HRDashboard {
  activeEvents: number;
  draftEvents: number;
  completedEvents: number;
  pendingRegistrations: number;
  approvedParticipants: number;
  approvedVolunteers: number;
  totalEvents: number;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  eventType: string;
  category: string;
  location?: string;
  eventDate: string;
  registrationStart?: string;
  registrationEnd?: string;
  maxParticipants?: number;
  maxVolunteers?: number;
  bannerUrl?: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

export const sportsService = {
  // Events
  getPublishedEvents: (): Promise<SportsEvent[]> =>
    client.get<{ data: SportsEvent[] }>("/sports/events").then((r) => unwrap(r)),

  getAllEvents: (): Promise<SportsEvent[]> =>
    client.get<{ data: SportsEvent[] }>("/sports/events/all").then((r) => unwrap(r)),

  getEventById: (id: number): Promise<SportsEvent> =>
    client.get<{ data: SportsEvent }>(`/sports/events/${id}`).then((r) => unwrap(r)),

  createEvent: (payload: CreateEventPayload): Promise<SportsEvent> =>
    client.post<{ data: SportsEvent }>("/sports/events", payload).then((r) => unwrap(r)),

  updateEvent: (id: number, payload: Partial<CreateEventPayload>): Promise<SportsEvent> =>
    client.put<{ data: SportsEvent }>(`/sports/events/${id}`, payload).then((r) => unwrap(r)),

  deleteEvent: (id: number): Promise<void> =>
    client.delete(`/sports/events/${id}`).then(() => undefined),

  publishEvent: (id: number): Promise<SportsEvent> =>
    client.patch<{ data: SportsEvent }>(`/sports/events/${id}/publish`).then((r) => unwrap(r)),

  updateStatus: (id: number, status: EventStatus): Promise<SportsEvent> =>
    client.patch<{ data: SportsEvent }>(`/sports/events/${id}/status`, { status }).then((r) => unwrap(r)),

  // Registrations
  register: (eventId: number, registrationType: RegistrationType): Promise<SportsRegistration> =>
    client.post<{ data: SportsRegistration }>(`/sports/events/${eventId}/register`, { registrationType }).then((r) => unwrap(r)),

  cancelRegistration: (eventId: number, type: RegistrationType): Promise<void> =>
    client.delete(`/sports/events/${eventId}/register?type=${type}`).then(() => undefined),

  getMyRegistrations: (): Promise<SportsRegistration[]> =>
    client.get<{ data: SportsRegistration[] }>("/sports/my-registrations").then((r) => unwrap(r)),

  getAllRegistrations: (): Promise<SportsRegistration[]> =>
    client.get<{ data: SportsRegistration[] }>("/sports/registrations").then((r) => unwrap(r)),

  getEventRegistrations: (eventId: number): Promise<SportsRegistration[]> =>
    client.get<{ data: SportsRegistration[] }>(`/sports/events/${eventId}/registrations`).then((r) => unwrap(r)),

  approveRegistration: (id: number): Promise<SportsRegistration> =>
    client.patch<{ data: SportsRegistration }>(`/sports/registrations/${id}/approve`).then((r) => unwrap(r)),

  rejectRegistration: (id: number, comments?: string): Promise<SportsRegistration> =>
    client.patch<{ data: SportsRegistration }>(`/sports/registrations/${id}/reject`, { comments }).then((r) => unwrap(r)),

  // Teams
  getTeams: (eventId: number): Promise<SportsTeam[]> =>
    client.get<{ data: SportsTeam[] }>(`/sports/events/${eventId}/teams`).then((r) => unwrap(r)),

  createTeam: (eventId: number, teamName: string, captainId?: number): Promise<SportsTeam> =>
    client.post<{ data: SportsTeam }>(`/sports/events/${eventId}/teams`, { teamName, captainId }).then((r) => unwrap(r)),

  // Results
  getAllResults: (): Promise<SportsResult[]> =>
    client.get<{ data: SportsResult[] }>("/sports/results").then((r) => unwrap(r)),

  getEventResults: (eventId: number): Promise<SportsResult[]> =>
    client.get<{ data: SportsResult[] }>(`/sports/events/${eventId}/results`).then((r) => unwrap(r)),

  publishResult: (eventId: number, data: {
    winnerTeamId?: number; runnerUpTeamId?: number; remarks?: string;
  }): Promise<SportsResult> =>
    client.post<{ data: SportsResult }>(`/sports/events/${eventId}/results`, data).then((r) => unwrap(r)),

  // Gallery
  getRecentGallery: (): Promise<GalleryImage[]> =>
    client.get<{ data: GalleryImage[] }>("/sports/gallery").then((r) => unwrap(r)),

  getEventGallery: (eventId: number): Promise<GalleryImage[]> =>
    client.get<{ data: GalleryImage[] }>(`/sports/events/${eventId}/gallery`).then((r) => unwrap(r)),

  uploadGalleryImage: (eventId: number, imageUrl: string, caption?: string): Promise<GalleryImage> =>
    client.post<{ data: GalleryImage }>(`/sports/events/${eventId}/gallery`, { imageUrl, caption }).then((r) => unwrap(r)),

  deleteGalleryImage: (imageId: number): Promise<void> =>
    client.delete(`/sports/gallery/${imageId}`).then(() => undefined),

  // Dashboard
  getHRDashboard: (): Promise<HRDashboard> =>
    client.get<{ data: HRDashboard }>("/sports/hr/dashboard").then((r) => unwrap(r)),
};
