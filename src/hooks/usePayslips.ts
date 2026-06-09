"use client";

import { useState, useCallback, useEffect } from "react";
import { payslipService, type Payslip } from "@/services/payslip.service";

export function usePayslips() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPayslips(await payslipService.getMyPayslips());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load payslips");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const upload = useCallback(async (employeeId: number, payPeriod: string, file: File) => {
    const p = await payslipService.upload(employeeId, payPeriod, file);
    setPayslips((prev) => [p, ...prev]);
    return p;
  }, []);

  const remove = useCallback(async (id: number) => {
    await payslipService.delete(id);
    setPayslips((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { payslips, loading, error, fetch, upload, remove };
}
