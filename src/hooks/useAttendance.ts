"use client";

import { useState, useCallback, useEffect } from "react";
import {
  attendanceService,
  type AttendanceRecord,
  type AttendanceSummary,
  type WorkMode,
} from "@/services/attendance.service";
import {
  getCurrentLocation,
  getDeviceFingerprint,
  type LocationCapture,
} from "@/utils/attendance.utils";

export function useAttendance() {
  const [today,    setToday]    = useState<AttendanceRecord | null>(null);
  const [history,  setHistory]  = useState<AttendanceRecord[]>([]);
  const [summary,  setSummary]  = useState<AttendanceSummary | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationCapture["status"] | null>(null);

  // ── Load today ─────────────────────────────────────────────────────────

  const fetchToday = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rec = await attendanceService.getToday();
      setToday(rec);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load history + summary ─────────────────────────────────────────────

  const fetchHistory = useCallback(async (year?: number, month?: number) => {
    try {
      setLoading(true);
      setError(null);
      const [hist, sum] = await Promise.all([
        attendanceService.getHistory(year, month),
        attendanceService.getSummary(year, month),
      ]);
      setHistory(hist);
      setSummary(sum);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Check-in ───────────────────────────────────────────────────────────

  const checkIn = useCallback(async (workMode: WorkMode = "OFFICE") => {
    try {
      setLoading(true);
      setError(null);

      // Capture location + device in parallel
      const [location, device] = await Promise.all([
        getCurrentLocation(),
        Promise.resolve(getDeviceFingerprint()),
      ]);
      setLocationStatus(location.status);

      const rec = await attendanceService.checkIn(workMode, location, device);
      setToday(rec);
      return rec;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Check-in failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Check-out ──────────────────────────────────────────────────────────

  const checkOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [location, device] = await Promise.all([
        getCurrentLocation(),
        Promise.resolve(getDeviceFingerprint()),
      ]);
      setLocationStatus(location.status);

      const rec = await attendanceService.checkOut(location, device);
      setToday(rec);
      return rec;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Check-out failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-load today on mount ───────────────────────────────────────────

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  return {
    today,
    history,
    summary,
    loading,
    error,
    locationStatus,
    fetchToday,
    fetchHistory,
    checkIn,
    checkOut,
  };
}
