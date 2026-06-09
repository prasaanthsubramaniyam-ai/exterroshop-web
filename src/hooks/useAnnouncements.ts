"use client";

import { useState, useCallback, useEffect } from "react";
import {
  announcementService,
  type CreateAnnouncementPayload,
} from "@/services/announcement.service";
import type { Announcement } from "@/types";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAnnouncements(await announcementService.getAll());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (payload: CreateAnnouncementPayload) => {
    const ann = await announcementService.create(payload);
    setAnnouncements((prev) =>
      ann.pinned ? [ann, ...prev] : [...prev, ann]
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    );
    return ann;
  }, []);

  const togglePin = useCallback(async (id: number) => {
    const updated = await announcementService.togglePin(id);
    setAnnouncements((prev) => {
      const list = prev.map((a) => (a.id === id ? updated : a));
      return list.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });
  }, []);

  const remove = useCallback(async (id: number) => {
    await announcementService.delete(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { announcements, loading, error, fetch, create, togglePin, remove };
}
