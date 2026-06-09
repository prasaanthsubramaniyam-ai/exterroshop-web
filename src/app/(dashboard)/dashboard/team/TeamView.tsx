"use client";

import * as React from "react";
import { Users, Loader2, UserCheck, UsersRound } from "lucide-react";
import { useDirectory } from "@/hooks/useDirectory";
import { useAuth } from "@/hooks/useAuth";
import { EmployeeCard, Avatar } from "@/components/ems/directory/EmployeeCard";
import type { Employee } from "@/services/directory.service";

// ── Stat pill ─────────────────────────────────────────────────────────────────

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3 text-center">
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ── Manager card ──────────────────────────────────────────────────────────────

function ManagerCard({ emp }: { emp: Employee }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
      <Avatar emp={emp} size="lg" />
      <div>
        <p className="font-semibold">{emp.name}</p>
        <p className="text-sm text-muted-foreground">{emp.jobTitle ?? "Manager"}</p>
        {emp.department && <p className="text-xs text-muted-foreground">{emp.department}</p>}
      </div>
      <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
        Your Manager
      </span>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function TeamView() {
  const { user } = useAuth();
  const { team, colleagues, loading, fetchTeam } = useDirectory();

  React.useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const isManager = ["MANAGER", "HR", "SUPER_ADMIN"].includes(user?.role ?? "");

  // Build a pseudo-manager card from user data if managerId is known
  // (we don't have a separate /me endpoint for manager here, so we infer from colleagues)
  // Find the manager from the team's reported-to chain if present
  const managerFromColleague = colleagues.find((c) => c.id === team[0]?.managerId);

  const stats = [
    { label: "Direct Reports", value: team.length,       color: "text-blue-600"    },
    { label: "Colleagues",     value: colleagues.length, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
          <Users className="size-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">My Team</h1>
          <p className="text-sm text-muted-foreground">People you work with</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats */}
          {isManager && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              {stats.map((s) => <Stat key={s.label} {...s} />)}
            </div>
          )}

          {/* Manager info */}
          {managerFromColleague && <ManagerCard emp={managerFromColleague} />}

          {/* Direct Reports — shown for managers */}
          {isManager && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <UserCheck className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">
                  Direct Reports
                  {team.length > 0 && <span className="ml-2 text-muted-foreground">({team.length})</span>}
                </h2>
              </div>
              {team.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
                  <UserCheck className="size-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium">No direct reports yet</p>
                  <p className="text-xs text-muted-foreground">Employees will appear here once assigned to you as manager.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {team.map((emp) => <EmployeeCard key={emp.id} emp={emp} layout="card" />)}
                </div>
              )}
            </section>
          )}

          {/* Colleagues */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <UsersRound className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">
                {isManager ? "Department Colleagues" : "My Team"}
                {colleagues.length > 0 && <span className="ml-2 text-muted-foreground">({colleagues.length})</span>}
              </h2>
            </div>
            {colleagues.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
                <UsersRound className="size-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">No colleagues found</p>
                <p className="text-xs text-muted-foreground">Update your department in your profile to see teammates here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {colleagues.map((emp) => <EmployeeCard key={emp.id} emp={emp} layout="row" />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
