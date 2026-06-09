"use client";

import client, { unwrap } from "./api";
import type { Announcement, AnnouncementAudience } from "@/types";

export interface CreateAnnouncementPayload {
  title:    string;
  body:     string;
  audience: AnnouncementAudience;
  pinned:   boolean;
}

export const announcementService = {
  getAll: (): Promise<Announcement[]> =>
    client.get<{ data: Announcement[] }>("/announcements").then((r) => unwrap(r)),

  create: (payload: CreateAnnouncementPayload): Promise<Announcement> =>
    client.post<{ data: Announcement }>("/announcements", payload).then((r) => unwrap(r)),

  togglePin: (id: number): Promise<Announcement> =>
    client.patch<{ data: Announcement }>(`/announcements/${id}/pin`).then((r) => unwrap(r)),

  delete: (id: number): Promise<void> =>
    client.delete(`/announcements/${id}`).then(() => undefined),
};
