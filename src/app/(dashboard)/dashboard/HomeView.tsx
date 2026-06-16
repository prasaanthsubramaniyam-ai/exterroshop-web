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
import { EngagementTeaserCard }  from "@/components/ems/dashboard/EngagementTeaserCard";
import { AiDashboardCard }       from "@/components/ai/AiDashboardCard";
import type { UserRole } from "@/types";

const MANAGER_ROLES: UserRole[] = ["MANAGER", "HR", "SUPER_ADMIN"];

export function HomeView() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;
  const isManagerAbove = MANAGER_ROLES.includes(role as UserRole);

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

        {/* Quick Actions — role-personalized */}
        <QuickActionsCard />

        {/* Announcements */}
        <AnnouncementsCard />
      </div>

      {/* ── Right / Sidebar column (1/3 width on lg+) ── */}
      <div className="flex flex-col gap-4">
        {/* AI Assistant Card — always first in sidebar */}
        <AiDashboardCard />

        {isManagerAbove ? (
          <>
            <PendingApprovalsCard />
            <TeamAvailabilityCard />
          </>
        ) : (
          <>
            <EngagementTeaserCard />
            <TeamAvailabilityCard />
          </>
        )}
      </div>

    </div>
  );
}
