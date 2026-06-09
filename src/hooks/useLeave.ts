"use client";

import { useState, useCallback, useEffect } from "react";
import {
  leaveService,
  type LeaveType,
  type LeaveBalance,
  type LeaveRequest,
  type ApplyLeavePayload,
} from "@/services/leave.service";

export function useLeave() {
  const [types,      setTypes]    = useState<LeaveType[]>([]);
  const [balances,   setBalances] = useState<LeaveBalance[]>([]);
  const [requests,   setRequests] = useState<LeaveRequest[]>([]);
  const [approvals,  setApprovals] = useState<LeaveRequest[]>([]);
  const [loading,    setLoading]  = useState(false);
  const [error,      setError]    = useState<string | null>(null);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    const [t, b, r] = await Promise.all([
      leaveService.getTypes(),
      leaveService.getBalances(),
      leaveService.getMyRequests(),
    ]);
    setTypes(t ?? []);
    setBalances(b ?? []);
    setRequests(r ?? []);
  }, []);

  const fetchApprovals = useCallback(() =>
    run(async () => {
      const data = await leaveService.getPendingApprovals();
      setApprovals(data);
      return data;
    }), [run]);

  const apply = useCallback((payload: ApplyLeavePayload) =>
    run(async () => {
      const req = await leaveService.apply(payload);
      setRequests((prev) => [req, ...prev]);
      // Refresh balances after apply
      const b = await leaveService.getBalances();
      setBalances(b);
      return req;
    }), [run]);

  const cancel = useCallback((id: number) =>
    run(async () => {
      const req = await leaveService.cancel(id);
      setRequests((prev) => prev.map((r) => r.id === id ? req : r));
      return req;
    }), [run]);

  const approve = useCallback((id: number, note?: string) =>
    run(async () => {
      const req = await leaveService.approve(id, note);
      setApprovals((prev) => prev.filter((r) => r.id !== id));
      return req;
    }), [run]);

  const reject = useCallback((id: number, note?: string) =>
    run(async () => {
      const req = await leaveService.reject(id, note);
      setApprovals((prev) => prev.filter((r) => r.id !== id));
      return req;
    }), [run]);

  useEffect(() => {
    run(fetchAll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    types, balances, requests, approvals,
    loading, error,
    fetchAll, fetchApprovals,
    apply, cancel, approve, reject,
  };
}
