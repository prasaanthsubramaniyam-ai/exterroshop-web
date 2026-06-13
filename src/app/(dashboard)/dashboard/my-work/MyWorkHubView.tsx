"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock, CalendarOff, CalendarDays, FileText, CheckSquare,
  ChevronRight, type LucideIcon,
} from "lucide-react";
import { AttendanceTodayCard }  from "@/components/ems/dashboard/AttendanceTodayCard";
import { LeaveBalanceCard }     from "@/components/ems/dashboard/LeaveBalanceCard";
import { PendingApprovalsCard } from "@/components/ems/dashboard/PendingApprovalsCard";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

const MANAGER_ROLES: UserRole[] = ["MANAGER", "HR", "SUPER_ADMIN"];

// ── Quick link tile ───────────────────────────────────────────────────────────

interface QuickLink {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    label:       "Attendance History",
    description: "Check-in/out records, corrections",
    href:        "/dashboard/attendance",
    icon:        Clock,
    iconBg:      "bg-blue-50 dark:bg-blue-950",
    iconColor:   "text-blue-600",
  },
  {
    label:       "Apply Leave",
    description: "Request time off, view balances",
    href:        "/dashboard/leave",
    icon:        CalendarOff,
    iconBg:      "bg-violet-50 dark:bg-violet-950",
    iconColor:   "text-violet-600",
  },
  {
    label:       "Holidays",
    description: "Public and company holidays",
    href:        "/dashboard/holidays",
    icon:        CalendarDays,
    iconBg:      "bg-red-50 dark:bg-red-950",
    iconColor:   "text-red-600",
  },
  {
    label:       "Payslips",
    description: "Download monthly payslips",
    href:        "/dashboard/payslips",
    icon:        FileText,
    iconBg:      "bg-amber-50 dark:bg-amber-950",
    iconColor:   "text-amber-600",
  },
  {
    label:       "Approvals",
    description: "Leave and correction requests",
    href:        "/dashboard/approvals",
    icon:        CheckSquare,
    iconBg:      "bg-emerald-50 dark:bg-emerald-950",
    iconColor:   "text-emerald-600",
  },
];

export function MyWorkHubView() {
  const { user } = useAuth();
  const isManagerAbove = MANAGER_ROLES.includes(
    (user?.role ?? "") as UserRole
  );

  const quickLinks = isManagerAbove
    ? QUICK_LINKS
    : QUICK_LINKS.filter((l) => l.href !== "/dashboard/approvals");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">My Work</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Attendance, leave, payslips and approvals — everything in one place.
        </p>
      </div>

      {/* Attendance + Leave cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AttendanceTodayCard />
        <LeaveBalanceCard />
      </div>

      {/* Quick access tiles */}
      <div className="rounded-2xl border border-border bg-background">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold">Quick Access</p>
        </div>
        <div className="divide-y divide-border">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors group"
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${link.iconBg}`}>
                  <Icon className={`size-5 ${link.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{link.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pending approvals — managers only */}
      {isManagerAbove && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <PendingApprovalsCard />
          </div>
        </div>
      )}
    </div>
  );
}
