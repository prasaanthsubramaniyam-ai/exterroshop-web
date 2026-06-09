import client, { unwrap } from "./api";
import type { Notification } from "@/types";

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const res = await client.get<{ data: Notification[] }>("/notifications");
    return unwrap<Notification[]>(res);
  },
  async getUnreadCount(): Promise<number> {
    const res = await client.get<{ data: number | { count: number } }>("/notifications/unread-count");
    const body = unwrap<number | { count: number }>(res);
    if (typeof body === "number") return body;
    if (body && typeof body === "object" && "count" in body) return (body as { count: number }).count;
    return 0;
  },
  async markAllRead(): Promise<void> {
    await client.put("/notifications/mark-all-read");
  },
  async markRead(id: number): Promise<void> {
    await client.put(`/notifications/${id}/read`);
  },
};
