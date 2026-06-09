"use client";

import { useState, useCallback, useEffect } from "react";
import {
  reportsService,
  type HeadcountReport,
  type AttendanceTrend,
  type LeaveUtilisation,
  type TodaySnapshot,
} from "@/services/reports.service";

export function useReports() {
  const [headcount,  setHeadcount]  = useState<HeadcountReport | null>(null);
  const [today,      setToday]      = useState<TodaySnapshot | null>(null);
  const [trend,      setTrend]      = useState<AttendanceTrend[]>([]);
  const [teamTrend,  setTeamTrend]  = useState<AttendanceTrend[]>([]);
  const [leaveUtil,  setLeaveUtil]  = useState<LeaveUtilisation[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hc, td, tr, lu, tt] = await Promise.allSettled([
        reportsService.getHeadcount(),
        reportsService.getToday(),
        reportsService.getAttendanceTrend(6),
        reportsService.getLeaveUtilisation(),
        reportsService.getTeamAttendanceTrend(6),
      ]);
      if (hc.status === "fulfilled") setHeadcount(hc.value);
      if (td.status === "fulfilled") setToday(td.value);
      if (tr.status === "fulfilled") setTrend(tr.value);
      if (lu.status === "fulfilled") setLeaveUtil(lu.value);
      if (tt.status === "fulfilled") setTeamTrend(tt.value);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { headcount, today, trend, teamTrend, leaveUtil, loading, error, fetchAll };
}
