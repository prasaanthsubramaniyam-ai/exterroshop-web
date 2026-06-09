"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { GreetingCard }          from "@/components/ems/dashboard/GreetingCard";
import { AttendanceTodayCard }   from "@/components/ems/dashboard/AttendanceTodayCard";
import { LeaveBalanceCard }      from "@/components/ems/dashboard/LeaveBalanceCard";
import { QuickActionsCard }      from "@/components/ems/dashboard/QuickActionsCard";
import { AnnouncementsCard }     from "@/components/ems/dashboard/AnnouncementsCard";
import { PendingApprovalsCard }  from "@/components/ems/dashboard/PendingApprovalsCard";
import { TeamAvailabilityCard }  from "@/components/ems/dashboard/TeamAvailabilityCard";

const MANAGER_ROLES = ["MANAGER", "HR", "SUPER_ADMIN"] as const;

export function HomeView() {
  const { user } = useAuth();
  const isManagerAbove = MANAGER_ROLES.includes(
    (user?.role ?? "") as (typeof MANAGER_ROLES)[number]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">

      {/* ── Left / Main column (2/3 width on lg+) ── */}
      <div className="flex flex-col gap-4 lg:col-span-2">

        {/* Greeting */}
        <GreetingCard user={user ?? null} />

        {/* Attendance + Leave row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AttendanceTodayCard />
          <LeaveBalanceCard />
        </div>

        {/* Quick Actions */}
        <QuickActionsCard />

        {/* Announcements — full-width in main column */}
        <AnnouncementsCard />
      </div>

      {/* ── Right / Sidebar column (1/3 width on lg+) ── */}
      <div className="flex flex-col gap-4">
        {isManagerAbove && <PendingApprovalsCard />}
        <TeamAvailabilityCard />
      </div>

    </div>
  );
}
