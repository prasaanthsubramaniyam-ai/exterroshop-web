"use client";

import { useState, useCallback, useEffect } from "react";
import {
  directoryService,
  type Employee,
  type DirectoryFilters,
} from "@/services/directory.service";

export function useDirectory() {
  const [employees,   setEmployees]   = useState<Employee[]>([]);
  const [team,        setTeam]        = useState<Employee[]>([]);
  const [colleagues,  setColleagues]  = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const fetch = useCallback(async (filters?: DirectoryFilters) => {
    try {
      setLoading(true);
      setError(null);
      const [emps, depts] = await Promise.all([
        directoryService.getAll(filters),
        directoryService.getDepartments(),
      ]);
      setEmployees(emps);
      setDepartments(depts);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load directory");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [t, c] = await Promise.all([
        directoryService.getMyTeam(),
        directoryService.getColleagues(),
      ]);
      setTeam(t);
      setColleagues(c);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount
  useEffect(() => { fetch(); }, [fetch]);

  return {
    employees, team, colleagues, departments,
    loading, error,
    fetch, fetchTeam,
  };
}
