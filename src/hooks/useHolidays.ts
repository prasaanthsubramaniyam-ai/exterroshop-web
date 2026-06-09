"use client";

import { useState, useCallback, useEffect } from "react";
import { holidayService, type Holiday, type CreateHolidayPayload } from "@/services/holiday.service";

export function useHolidays(year?: number) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const y = year ?? new Date().getFullYear();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHolidays(await holidayService.getByYear(y));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }, [y]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (payload: CreateHolidayPayload) => {
    const h = await holidayService.create(payload);
    setHolidays((prev) => [...prev, h].sort((a, b) => a.date.localeCompare(b.date)));
    return h;
  }, []);

  const remove = useCallback(async (id: number) => {
    await holidayService.delete(id);
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { holidays, loading, error, fetch, create, remove };
}
